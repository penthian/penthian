import { rwaABI } from "@/app/utils/ABIs";
import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import { ethers } from "ethers";
import { getCustomEthFrom, ZERO_ADDRESS } from "./helper";
import { PropertyDetails } from "./types";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";

import { Interface } from "ethers/lib/utils";
import { _getPrimarySaleState } from "./helper-market";

const ifaceRwaABI = new Interface(rwaABI);

export const getRwaErrorMessage = (_error: any): string => {
  console.log("❌ Raw RWA error:", _error);

  // 1. Handle user rejection
  const msg = _error?.message?.toLowerCase();
  if (msg?.includes("user rejected") || msg?.includes("user denied")) {
    return "Transaction rejected by user.";
  }

  // 2. Standard Ethers error
  if (_error?.reason) {
    return _error.reason;
  }

  if (_error?.log?.message) {
    return _error.log.message;
  }

  // 3. Try decoding custom errors
  const encodedError =
    _error?.data?.originalError?.data ||
    _error?.data?.data ||
    _error?.log?.data ||
    _error?.data;

  if (encodedError && typeof encodedError === "string") {
    try {
      const decoded = ifaceRwaABI.parseError(encodedError);
      return mapRwaCustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode custom RWA error:", decodeErr);
    }
  }

  // 4. Receipt fallback
  if (_error?.receipt?.reason) {
    return _error.receipt.reason;
  }

  // 6. error message
  if (_error?.message) {
    return _error.message;
  }

  // 7. Generic fallback
  return "An unknown error occurred during transaction.";
};

function mapRwaCustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    ActionRestricted: "This action is restricted.",
    AlreadyInitialized: "This contract has already been initialized.",
    CantApproveShares: "You cannot approve shares.",
    CantTransferShares: "Shares transfer is not allowed.",
    CommunityNotRegistered: "The community is not registered.",
    ERC1155InsufficientBalance: `Insufficient balance: You need at least ${args.needed} tokens (have ${args.balance}) of ID ${args.tokenId}.`,
    ERC1155InvalidApprover: "Invalid approver address.",
    ERC1155InvalidArrayLength: `Mismatched array lengths: idsLength = ${args.idsLength}, valuesLength = ${args.valuesLength}.`,
    ERC1155InvalidOperator: "Invalid operator address.",
    ERC1155InvalidReceiver: "Invalid receiver address.",
    ERC1155InvalidSender: "Invalid sender address.",
    ERC1155MissingApprovalForAll:
      "Operator is missing approval to manage all tokens for this owner.",
    InvalidAPR: "Cannot be same APR (Annual Percentage Rate).",
    InvalidAddress: "Provided address is invalid.",
    InvalidPrice: "The price entered is not valid.",
    OwnableInvalidOwner: "The provided owner address is invalid.",
    OwnableUnauthorizedAccount:
      "You are not authorized to perform this action.",
    PropertyAlreadyDelisted: "This property has already been delisted.",
    PropertyNotExists: "The specified property does not exist.",
    PropertyNotInClaimState: "This property is not in a claimable state.",
  };

  return map[name] || `Smart contract error: ${name}`;
}

export const APR_BIPS_BASE = 1000;

export const getRwaContract = (
  signer = false,
  particleProvider?: EVMProvider
) => {
  let provider = new ethers.providers.JsonRpcProvider(BITSTAKE_CONFIG.rpcUrl);
  let contract;
  if (signer) {
    let ethersProvider;
    if (isSocialAuthType(getLatestAuthType()) && particleProvider) {
      ethersProvider = new ethers.providers.Web3Provider(particleProvider);
    } else {
      ethersProvider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
    }

    const signer = ethersProvider.getSigner();
    contract = new ethers.Contract(BITSTAKE_CONFIG.rwa, rwaABI, signer);
    return contract;
  }
  contract = new ethers.Contract(BITSTAKE_CONFIG.rwa, rwaABI, provider);
  return contract;
};

// Set approval for all
export async function _setApprovalForAll(payload: {
  userAddress: string;
  particleProvider: EVMProvider;
}) {
  try {
    const rwaContract = getRwaContract(true, payload.particleProvider);
    const isApproved = await _isApprovedForAll({
      userAddress: payload.userAddress,
    });
    if (!isApproved) {
      await rwaContract.callStatic.setApprovalForAll(
        BITSTAKE_CONFIG.market,
        true
      );
      const tx = await rwaContract.setApprovalForAll(
        BITSTAKE_CONFIG.market,
        true
      );

      await tx.wait();
      return tx;
    }
  } catch (error) {
    throw new Error(getRwaErrorMessage(error));
  }
}

// Get total properties
export async function _getTotalProperties(): Promise<number> {
  try {
    const rwaContract = getRwaContract();
    const totalProperties = await rwaContract.totalProperties();
    return Number(totalProperties);
  } catch (error) {
    return 0;
  }
}

export async function _isApprovedForAll(payload: {
  userAddress: string;
}): Promise<boolean> {
  try {
    const rwaContract = getRwaContract();
    const isApproved = await rwaContract.isApprovedForAll(
      payload.userAddress,
      BITSTAKE_CONFIG.market
    );
    return isApproved;
  } catch (error) {
    return false;
  }
}
export async function _getUserRwaBalance(payload: {
  userAddress: string;
  propertyId: number;
  rwaContract: ethers.Contract;
}): Promise<number> {
  try {
    const userBalance = await payload.rwaContract.balanceOf(
      payload.userAddress,
      payload.propertyId
    );

    return Number(userBalance);
  } catch (error) {
    return 0;
  }
}

export async function _getUserRwaBalanceBatch(payload: {
  userAddress: string;
  totalProperties: number;
  rwaContract: ethers.Contract;
}): Promise<{ propertyId: number; balance: number }[]> {
  try {
    // Create the array of property IDs
    const propertyIds = Array.from(
      { length: payload.totalProperties },
      (_, i) => i + 1
    );

    // Create the array of user addresses
    const userAddresses = new Array(payload.totalProperties).fill(
      payload.userAddress
    );

    // Fetch the balances in batch
    const userBalance = (await payload.rwaContract.balanceOfBatch(
      userAddresses,
      propertyIds
    )) as string[];

    // Filter out balances <= 0, then map the remaining results

    const returnData = userBalance
      .map((balance: string, index: number) => ({
        propertyId: propertyIds[index],
        balance: Number(balance), // Assuming balance is in wei (18 decimals)
      }))
      .filter((entry) => entry.balance > 0); // Filter to include only balances greater than 0
    return returnData;
  } catch (error) {
    console.log("Error fetching user RWA balances:", error);
    return [];
  }
}

// Get property details
export async function _getPropertyDetails(payload: {
  propertyId: number;
}): Promise<PropertyDetails | null> {
  try {
    const rwaContract = getRwaContract();
    const details = await rwaContract.getPropertyDetails(payload.propertyId);
    if (details.owner === ZERO_ADDRESS) {
      return null;
    }
    const property = {
      owner: details.owner,
      pricePerShare: parseFloat(
        getCustomEthFrom(details.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
      ),
      totalOwners: Number(details.totalOwners),
      totalShares: Number(details.totalShares),
      aprBips: (Number(details.aprBips) * 100) / APR_BIPS_BASE,
      uri: details.uri,
    };
    return property;
  } catch (error) {
    return null;
  }
}

export async function _changeRwaUri(payload: {
  propertyId: number;
  newUri: string;
  particleProvider: EVMProvider;
}): Promise<ethers.ContractTransaction> {
  try {
    const rwaContract = getRwaContract(true, payload.particleProvider);
    await rwaContract.callStatic.changeUri(payload.propertyId, payload.newUri);
    const tx = await rwaContract.changeUri(payload.propertyId, payload.newUri);
    await tx.wait();
    return tx;
  } catch (error: any) {
    console.log("changeUri error:", error.message);
    throw new Error(getRwaErrorMessage(error));
  }
}
export async function _changeRwaPropertyPrice(payload: {
  propertyId: number;
  newPricePerShareInWei: string;
  particleProvider: EVMProvider;
}): Promise<ethers.ContractTransaction> {
  try {
    const rwaContract = getRwaContract(true, payload.particleProvider);
    await rwaContract.callStatic.changePropertyPrice(
      payload.propertyId,
      payload.newPricePerShareInWei
    );
    const tx = await rwaContract.changePropertyPrice(
      payload.propertyId,
      payload.newPricePerShareInWei
    );
    await tx.wait();
    return tx;
  } catch (error: any) {
    console.log("changePropertyPrice error:", error.message);
    throw new Error(getRwaErrorMessage(error));
  }
}
export async function _delistProperty(payload: {
  propertyId: number;
  particleProvider: EVMProvider;
}): Promise<ethers.ContractTransaction> {
  try {
    const rwaContract = getRwaContract(true, payload.particleProvider);

    const state = await _getPrimarySaleState({
      propertyId: payload.propertyId,
    });
    if (state == "none") throw new Error("Property cannot found");
    if (state == "ongoing")
      throw new Error("Property is on primary listing, cannot delist");
    if (state == "refund")
      throw new Error("Property is refunded, cannot delist");
    await rwaContract.callStatic.delistProperty(payload.propertyId);
    const tx = await rwaContract.delistProperty(payload.propertyId);
    await tx.wait();
    return tx;
  } catch (error: any) {
    console.log("delistProperty error:", error.message);
    throw new Error(getRwaErrorMessage(error));
  }
}
export async function _changeRwaPropertyApr(payload: {
  propertyId: number;
  newAprBips: number; //1000 max for 100% then 100 ==> 10%
  particleProvider: EVMProvider;
}): Promise<ethers.ContractTransaction> {
  try {
    const rwaContract = getRwaContract(true, payload.particleProvider);
    await rwaContract.callStatic.changePropertyAPR(
      payload.propertyId,
      payload.newAprBips
    );
    const tx = await rwaContract.changePropertyAPR(
      payload.propertyId,
      payload.newAprBips
    );
    await tx.wait();
    return tx;
  } catch (error: any) {
    console.log("changePropertyAPR error:", error.message);
    throw new Error(getRwaErrorMessage(error));
  }
}
