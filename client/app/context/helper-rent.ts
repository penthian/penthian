import { ethers } from "ethers";
import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import {
  getCustomEthFrom,
  getCustomWeiFrom,
  getEthFrom,
  NotifySuccess,
  ZERO_ADDRESS,
} from "./helper";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";
import {
  approveUsdcSpender,
  getUsdcAllowance,
  getUserUsdcBalance,
} from "./helper-usdc";
import { _getUserRwaBalance, getRwaContract } from "./helper-rwa";
import { Interface } from "ethers/lib/utils";

const ifaceRentABI = new Interface(BITSTAKE_CONFIG.rentABI);

export const getRentErrorMessage = (_error: any): string => {
  console.log("❌ Raw rent error:", _error);

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
      const decoded = ifaceRentABI.parseError(encodedError);
      return mapRentCustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode custom rent error:", decodeErr);
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
function mapRentCustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    NoRentAvailable: "No rent is currently available to withdraw.",
    RentNotWithdrawn: "Rent could not be withdrawn. Please try again.",
    TimeNotPassedYet: "Month not passed yet. Please wait.",
    TimeOver: "The rent claiming period is over.",
    YouAreNotEligible: "You are not eligible to receive rent.",
    OwnableInvalidOwner: "Invalid owner address provided.",
    OwnableUnauthorizedAccount:
      "You are not authorized to perform this action.",
  };

  return map[name] || `Smart contract error: ${name}`;
}

// Get Rent Contract instance
export const getRentContract = (
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
    contract = new ethers.Contract(
      BITSTAKE_CONFIG.rent,
      BITSTAKE_CONFIG.rentABI,
      signer
    );
    return contract;
  }
  contract = new ethers.Contract(
    BITSTAKE_CONFIG.rent,
    BITSTAKE_CONFIG.rentABI,
    provider
  );
  return contract;
};

//===================================== WRITE FUNCTIONS ===================================

// Add Rent to a property
export async function _addRent(payload: {
  propertyId: number;
  adminRentAmount: string; // in simple formate e.g. 10.5 | 200 | 20.659
  connectedAddress: string;
  particleProvider: EVMProvider;
}) {
  try {
    const { propertyId, adminRentAmount, connectedAddress, particleProvider } =
      payload;
    console.log("🚀 ~ payload:", payload);

    const rentContract = getRentContract(true, particleProvider);
    const rwaContract = getRwaContract();
    const details = await rwaContract.getPropertyDetails(propertyId);

    if (details.owner.toString() === ZERO_ADDRESS)
      throw new Error("Property does not exist");

    const _currentTime = Math.floor(Date.now() / 1000);

    const rentDetails = await rentContract.getRentDetails(propertyId);
    console.log(
      "🚀 ~ rentDetails:",
      Number(rentDetails._endTime) > _currentTime
    );

    if (Number(rentDetails._endTime) > _currentTime) {
      throw new Error("Time not reached to add rent");
    }
    if (Number(rentDetails._rentRemaining) > 0) {
      await rentContract.callStatic.resetPropertyDetails(propertyId);
      const tx = await rentContract.resetPropertyDetails(propertyId);
      await tx.wait();
      NotifySuccess(
        "Property rent details reset successfully, now adding new rent amount"
      );
    }

    const _adminRentAmount = Number(adminRentAmount);

    const balance = await getUserUsdcBalance({ user: connectedAddress });
    if (_adminRentAmount > balance)
      throw new Error(`Insufficient USDC balance, required ${balance}`);

    const allowance = await getUsdcAllowance({
      owner: connectedAddress,
      spenderType: "rent",
    });
    if (_adminRentAmount > allowance)
      await approveUsdcSpender({
        amount: "10000000000000000000000000", // 1 million USDC
        particleProvider: particleProvider,
        spenderType: "rent",
      });

    const _totalMonthRent = getCustomWeiFrom(adminRentAmount, BITSTAKE_CONFIG.usdcDecimals);

    await rentContract.callStatic.addRent(propertyId, _totalMonthRent);
    const tx = await rentContract.addRent(propertyId, _totalMonthRent);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getRentErrorMessage(error));
  }
}

// Withdraw Rent
export async function _withdrawRent(payload: {
  propertyId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const rentContract = getRentContract(true, payload.particleProvider);
    await rentContract.callStatic.withdrawRent(payload.propertyId);
    const tx = await rentContract.withdrawRent(payload.propertyId);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getRentErrorMessage(error));
  }
}

//===================================== READ FUNCTIONS ===================================

// Get Rent Details
export async function _getRentDetails(propertyId: number) {
  try {
    const rentContract = getRentContract();
    const rentDetails = await rentContract.getRentDetails(propertyId);

    return {
      startTime: Number(rentDetails._startTime),
      endTime: Number(rentDetails._endTime),
      totalRent: parseFloat(getCustomEthFrom(rentDetails._totalRent,BITSTAKE_CONFIG.usdcDecimals)),
      rentRemaining: parseFloat(getCustomEthFrom(rentDetails._rentRemaining,BITSTAKE_CONFIG.usdcDecimals)),
      rentPerShare: parseFloat(getCustomEthFrom(rentDetails._rentPerShare,BITSTAKE_CONFIG.usdcDecimals)),
    };
  } catch (error) {
    console.log("🚀 ~ _getRentDetails ~ error:", error);
    return {
      startTime: 0,
      endTime: 0,
      totalRent: 0,
      rentRemaining: 0,
      rentPerShare: 0,
    };
  }
}

// Get Rent History for a user and property
export async function _getRentHistory(payload: {
  userAddress: string;
  propertyId: number;
}): Promise<number | null> {
  try {
    const rentContract = getRentContract();
    const _lastClaimTime = await rentContract.getRentHistory(
      payload.userAddress,
      payload.propertyId
    );
    return Number(_lastClaimTime);
  } catch (error) {
    console.log("🚀 ~ _getRentHistory ~ error:", error);
    return null;
  }
}

// Check if user is eligible for rent
export async function _isEligibleForRent(payload: {
  userAddress: string;
  propertyId: number;
}): Promise<{ isEligible: boolean; rentAmountToClaim: number } | null> {
  try {
    const rentContract = getRentContract();
    const rwaContract = getRwaContract();
    const isEligible = await rentContract.isEligibleForRent(
      payload.propertyId,
      payload.userAddress
    );
    if (!isEligible) {
      return { isEligible, rentAmountToClaim: 0 };
    }

    const { rentPerShare } = await _getRentDetails(payload.propertyId);
    const userShares = await _getUserRwaBalance({ ...payload, rwaContract });

    return { isEligible: true, rentAmountToClaim: userShares * rentPerShare };
  } catch (error) {
    console.log("🚀 ~ _isEligibleForRent ~ error:", error);
    return null;
  }
}

export async function _getRentOwner(): Promise<string | null> {
  try {
    const rentContract = getRentContract();
    const owner = await rentContract.owner();
    return owner;
  } catch (error) {
    return null;
  }
}
