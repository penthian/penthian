import { formABI } from "@/app/utils/ABIs";
import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import { BigNumber, ethers } from "ethers";
import { fetchNftMetadata, getCustomEthFrom, getEthFrom } from "./helper";
import {
  FormDetails,
  FormRequestedType,
  FormRequestEventStatus,
} from "./types";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";
import { getAllRequestedFormsForAdmin } from "./subgraph-helpers/form-subgraph";
import { Interface } from "ethers/lib/utils";
import {
  approveUsdcSpender,
  getUsdcAllowance,
  getUserUsdcBalance,
} from "./helper-usdc";

const ifaceFormABI = new Interface(formABI);

export const getFormErrorMessage = (_error: any): string => {
  console.log("❌ Raw form error:", _error);

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
      const decoded = ifaceFormABI.parseError(encodedError);
      return mapFormCustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode custom form error:", decodeErr);
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

function mapFormCustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    InvalidForm: "The form is invalid.",
    InvalidThreshold: "The threshold specified is invalid.",
    InvalidTime: "The time specified is invalid.",
    OwnableInvalidOwner: "Invalid owner address provided.",
    OwnableUnauthorizedAccount:
      "You are not authorized to perform this action.",
  };

  return map[name] || `Smart contract error: ${name}`;
}

export const getFormContract = (
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
    contract = new ethers.Contract(BITSTAKE_CONFIG.form, formABI, signer);
    return contract;
  }
  contract = new ethers.Contract(BITSTAKE_CONFIG.form, formABI, provider);
  return contract;
};

export async function _registerProperty(payload: {
  owner: string;
  pricePerShareInWei: string;
  totalShares: number;
  saleTime: number;
  aprBips: number; //1000 max for 100% then 100 ==> 10%
  uri: string;
  particleProvider: EVMProvider;
}) {
  try {
    const registrationFees = await _getRegistrationFees();
    console.log("🚀 ~ registrationFees:", registrationFees);
    if (registrationFees === null || registrationFees <= 0)
      throw new Error("Failed to fetch registration fee");

    const balance = await getUserUsdcBalance({
      user: payload.owner,
    });
    console.log("🚀 ~ balance:", balance);
    if (registrationFees > balance)
      throw new Error(
        `Insufficient USDC balance, required ${registrationFees}`
      );

    const allowance = await getUsdcAllowance({
      owner: payload.owner,
      spenderType: "form",
    });
    console.log("🚀 ~ allowance:", allowance);

    const hasEnoughAllowance = allowance >= registrationFees;
    console.log("🚀 ~ hasEnoughAllowance:", hasEnoughAllowance);
    if (!hasEnoughAllowance)
      await approveUsdcSpender({
        amount: String(registrationFees),
        particleProvider: payload.particleProvider,
        spenderType: "form",
      });

    const inputForm = {
      owner: payload.owner,
      pricePerShare: payload.pricePerShareInWei,
      totalShares: payload.totalShares,
      saleTime: payload.saleTime,
      aprBips: payload.aprBips,
      uri: payload.uri,
    };

    const formContract = getFormContract(true, payload.particleProvider);
    await formContract.callStatic.registerProperty(inputForm);

    const tx = await formContract.registerProperty(inputForm);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getFormErrorMessage(error));
  }
}

// Validate a form request
export async function _validateForm(payload: {
  requestNo: number;
  hardCapPercent: number;
  action: boolean;
  particleProvider: EVMProvider;
}) {
  try {
    const formContract = getFormContract(true, payload.particleProvider);
    await formContract.callStatic.validateForms(
      payload.requestNo,
      payload.hardCapPercent,
      payload.action
    );
    const tx = await formContract.validateForms(
      payload.requestNo,
      payload.hardCapPercent,
      payload.action
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getFormErrorMessage(error));
  }
}

export async function _changeRegistrationFees(payload: {
  newPropertyListingFeeWei: string;
  particleProvider: EVMProvider;
}) {
  console.log("🚀 ~ _changeRegistrationFees ~ payload:", payload)
  try {
    const formContract = getFormContract(true, payload.particleProvider);
    await formContract.callStatic.changeRegistrationFees(payload.newPropertyListingFeeWei);
    const tx = await formContract.changeRegistrationFees(payload.newPropertyListingFeeWei);
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getFormErrorMessage(error));
  }
}

export async function _changeIsPaused(payload: {
  pause: boolean;
  particleProvider: EVMProvider;
}) {
  try {
    const formContract = getFormContract(true, payload.particleProvider);
    await formContract.callStatic.changeIsPaused(payload.pause);
    const tx = await formContract.changeIsPaused(payload.pause);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getFormErrorMessage(error));
  }
}
export async function _getRequestDetails(payload: {
  serialNumber: number;
}): Promise<FormDetails> {
  try {
    const formContract = getFormContract();

    const details = await formContract.getRequests(payload.serialNumber);

    // address owner; /// @dev Address of the property owner
    // Status status; /// @dev Current status of the form
    // uint256 pricePerShare; /// @dev Price per share of the property
    // uint256 totalShares; /// @dev Total shares of the property
    // uint256 aprBips; /// @dev The annual percentage rate (APR) for the property in basis points
    // uint256 saleTime; /// @dev Duration of the sale in seconds
    // uint256 registrationFeesPaid;
    // string uri; /// @dev URI for the property's metadata

    const formDetails: FormDetails = {
      owner: details.owner.toLowerCase(),
      status: String(details.status) as FormRequestEventStatus,
      pricePerShare: parseFloat(
        getCustomEthFrom(details.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
      ),
      totalShares: Number(details.totalShares),
      aprBips: Number(details.aprBips),
      saleTime: Number(details.saleTime),
      registrationFeesPaid: parseFloat(
        getCustomEthFrom(details.registrationFeesPaid.toString(),BITSTAKE_CONFIG.usdcDecimals)
      ),
      uri: details.uri,
    };

    return formDetails;
  } catch (error) {
    throw new Error(getFormErrorMessage(error));
  }
}
export async function _getTotalRequests(): Promise<number> {
  try {
    const formContract = getFormContract();
    const totalRequests = await formContract.getTotalRequests();
    return Number(totalRequests);
  } catch (error) {
    return 0;
  }
}
export async function _getFormOwner(): Promise<string | null> {
  try {
    const formContract = getFormContract();
    const owner = await formContract.owner();
    return owner;
  } catch (error) {
    return null;
  }
}

export async function _getRegistrationFees(): Promise<number | null> {
  try {
    const formContract = getFormContract();
    const registrationFees = await formContract.getRegistrationFees();
    return parseFloat(getCustomEthFrom(registrationFees.toString(),BITSTAKE_CONFIG.usdcDecimals));
  } catch (error) {
    return null;
  }
}
export async function _getIsRequestPaused(): Promise<boolean> {
  try {
    const formContract = getFormContract();
    const isPaused = await formContract.getIsPaused();
    return isPaused as boolean;
  } catch (error) {
    return false;
  }
}

export async function getAllFormRequests(): Promise<FormRequestedType[]> {
  try {
    // const formContract = getFormContract();
    // let totalRequests = await formContract.getTotalRequests(); // Assuming this gets total requests count
    // totalRequests = Number(totalRequests);
    // console.log("🚀 ~ getAllFormRequests ~ totalRequests:", totalRequests)
    const pendingForms = await getAllRequestedFormsForAdmin();
    // console.log("🚀 ~ getAllFormRequests ~ pendingForms:", pendingForms)

    let result: FormRequestedType[] = [];

    for (const form of pendingForms) {
      const id = Number(form._requestId);
      const request = await _getRequestDetails({ serialNumber: id }); // Assuming getRequests returns the form details

      if (request.status == "1") {
        // const metadata = await fetchNftMetadata(request.uri);

        const formDetails: FormRequestedType = {
          serialNo: id,
          fractions: request.totalShares, // Assuming totalShares refers to fractions
          fractionPrice: request.pricePerShare,
          uri: request.uri,
          // name: metadata?.name ?? "--", // Adjust based on your contract response
          // description: metadata?.description ?? "--", // Add the correct property key
          // city: metadata?.attributes ? metadata?.attributes[0].value : "--",
          // country: metadata?.attributes ? metadata?.attributes[1].value : "--",
          // propertyType: metadata?.attributes
          //   ? metadata?.attributes[2].value
          //   : "--", // Add the correct property key
          // homeType: metadata?.attributes ? metadata?.attributes[3].value : "--", // Add the correct property key
        };
        result.push(formDetails);
      }
    }
    // console.log("🚀 ~ getAllFormRequests ~ result:", result)

    return result;
  } catch (error) {
    console.log("🚀 ~ getAllFormRequests ~ error:", error);

    return [];
  }
}
