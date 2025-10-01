import { usdcABI } from "@/app/utils/ABIs";
import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import { ethers } from "ethers";
import { getCustomEthFrom, getCustomWeiFrom } from "./helper";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";
import { parse } from "path";
import { SpenderType } from "./types";

import { Interface } from "ethers/lib/utils";

const ifaceUsdcABI = new Interface(usdcABI);

export const getUsdcErrorMessage = (_error: any): string => {
  console.log("❌ Raw USDC error:", _error);

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
      const decoded = ifaceUsdcABI.parseError(encodedError);
      return mapUsdcCustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode custom USDC error:", decodeErr);
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
function mapUsdcCustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    ERC20InsufficientAllowance: "Insufficient allowance for the transaction.",
    ERC20InsufficientBalance:
      "Insufficient balance to complete the transaction.",
    ERC20InvalidApprover: "Invalid approver provided.",
    ERC20InvalidReceiver: "Invalid receiver address.",
    ERC20InvalidSender: "Invalid sender address.",
    ERC20InvalidSpender: "Invalid spender address.",
  };

  return map[name] || `Smart contract error: ${name}`;
}

export const getUSDCContract = (
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
    contract = new ethers.Contract(BITSTAKE_CONFIG.usdc, usdcABI, signer);
    return contract;
  }
  contract = new ethers.Contract(BITSTAKE_CONFIG.usdc, usdcABI, provider);
  return contract;
};

export async function approveUsdcSpender(payload: {
  amount: string;
  particleProvider: EVMProvider;
  spenderType: SpenderType;
}): Promise<any> {
  try {
    const spenderAddress = BITSTAKE_CONFIG[payload.spenderType];
    const usdcContract = getUSDCContract(true, payload.particleProvider);
    const amountInWei = getCustomWeiFrom(payload.amount, BITSTAKE_CONFIG.usdcDecimals);

    await usdcContract.callStatic.approve(spenderAddress, amountInWei);
    const tx = await usdcContract.approve(spenderAddress, amountInWei);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getUsdcErrorMessage(error));
  }
}

export async function getUsdcAllowance(payload: {
  owner: string;
  spenderType: SpenderType;
}): Promise<number> {
  try {
    const spenderAddress = BITSTAKE_CONFIG[payload.spenderType];
    const usdcContract = getUSDCContract(false);
    const allowance = await usdcContract.allowance(
      payload.owner,
      spenderAddress
    );
    return parseFloat(getCustomEthFrom(allowance, BITSTAKE_CONFIG.usdcDecimals));
  } catch (error) {
    throw new Error(getUsdcErrorMessage(error));
  }
}

export async function getUserUsdcBalance(payload: {
  user: string;
}): Promise<number> {
  try {
    const usdcContract = getUSDCContract();

    const res = await usdcContract.balanceOf(payload.user);
    return parseFloat(getCustomEthFrom(res, BITSTAKE_CONFIG.usdcDecimals));
  } catch (error) {
    throw new Error(getUsdcErrorMessage(error));
  }
}
