import { ethers } from "ethers";
import {
  approveUsdcSpender,
  getUsdcAllowance,
  getUserUsdcBalance,
} from "./helper-usdc";
import {
  getCustomEthFrom,
  getCustomWeiFrom,
  getEthFrom,
  getWeiFrom,
  NotifyError,
  NotifySuccess,
} from "./helper";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import { BITSTAKE_CONFIG } from "../utils/constants";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";
import { Interface } from "ethers/lib/utils";

const ifaceUniswapV2Router = new Interface(BITSTAKE_CONFIG.uniswapV2RouterABI);

export const getUniswapV2ErrorMessage = (_error: any): string => {
  console.log("❌ Uniswap V2 error:", _error);

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
      const decoded = ifaceUniswapV2Router.parseError(encodedError);
      return mapUniswapV2CustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode Uniswap V2 error:", decodeErr);
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

function mapUniswapV2CustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    InsufficientOutputAmount: "Insufficient output amount from the swap.",
    InsufficientLiquidity: "Insufficient liquidity in the pool.",
    InvalidPath: "The path provided for the swap is invalid.",
    UniswapV2RouterError: "Uniswap V2 Router error occurred.",
  };

  return map[name] || `Uniswap Router error: ${name}`;
}

// Address for the USDC and WETH contracts
const USDC_ADDRESS = BITSTAKE_CONFIG.usdc; // Replace with actual USDC contract address
const WETH_ADDRESS = BITSTAKE_CONFIG.uniswapV2Weth; // Replace with actual WETH contract address

export const getUniswapV2RouterContract = (
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
      BITSTAKE_CONFIG.uniswapV2Router,
      BITSTAKE_CONFIG.uniswapV2RouterABI,
      signer
    );
    return contract;
  }
  contract = new ethers.Contract(
    BITSTAKE_CONFIG.uniswapV2Router,
    BITSTAKE_CONFIG.uniswapV2RouterABI,
    provider
  );
  return contract;
};

export async function getUserEthBalance(payload: {
  user: string;
}): Promise<number> {
  try {
    // Get the provider for the user's Ethereum network
    const provider = new ethers.providers.JsonRpcProvider(
      BITSTAKE_CONFIG.rpcUrl
    );

    // Fetch the user's ETH balance
    const res = await provider.getBalance(payload.user);

    // Convert the balance from Wei to Ether (ETH) and return as a number
    return parseFloat(ethers.utils.formatEther(res));
  } catch (error) {
    throw new Error(`Error fetching ETH balance: ${error}`);
  }
}

export const swapUsdcToEth = async (
  amount: number,
  userAddress: string,
  particleProvider: EVMProvider
) => {
  console.log("🚀 ~ swapUsdcToEth ~ amount:", amount);
  try {
    const balance = await getUserUsdcBalance({
      user: userAddress,
    });
    console.log("🚀 ~ balance:", balance);
    if (amount > balance)
      throw new Error(`Insufficient USDC balance, required ${amount}`);

    const allowance = await getUsdcAllowance({
      owner: userAddress,
      spenderType: "uniswapV2Router",
    });
    console.log("🚀 ~ allowance:", allowance);

    const hasEnoughAllowance = allowance >= amount;
    console.log("🚀 ~ hasEnoughAllowance:", hasEnoughAllowance);
    if (!hasEnoughAllowance)
      await approveUsdcSpender({
        amount: String(amount),
        particleProvider: particleProvider,
        spenderType: "uniswapV2Router",
      });

    const uniswapV2RouterContract = getUniswapV2RouterContract(
      true,
      particleProvider
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 20 minutes from now
    const path = [USDC_ADDRESS, WETH_ADDRESS];

    const amountIn = getCustomWeiFrom(
      String(amount),
      BITSTAKE_CONFIG.usdcDecimals
    );
    console.log("🚀 ~ swapUsdcToEth ~ amountIn:", amountIn);
    const amountOutMin = 0;

    const tx = await uniswapV2RouterContract.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      path,
      userAddress,
      deadline
    );
    await tx.wait();

    NotifySuccess("Swap successful.");
  } catch (error) {
    console.log("Error swapping USDC to ETH:", error);
    NotifyError(getUniswapV2ErrorMessage(error)); // Using the error handler
  }
};

export const swapEthToUsdc = async (
  amount: number,
  userAddress: string,
  particleProvider: EVMProvider
) => {
  try {
    // Ensure the user has enough ETH to swap
    const balance = await getUserEthBalance({ user: userAddress });
    console.log("🚀 ~ balance:", balance);
    if (amount > balance) {
      throw new Error(`Insufficient ETH balance, required ${amount}`);
    }

    // Get Uniswap V2 Router Contract
    const uniswapV2RouterContract = getUniswapV2RouterContract(
      true,
      particleProvider
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 20 minutes from now
    const path = [WETH_ADDRESS, USDC_ADDRESS];

    // Get the minimum amount of USDC the user should receive
    const ethAmountIn = getWeiFrom(String(amount));

    const amountOutMin = 0;

    // Execute the swap
    const tx = await uniswapV2RouterContract.swapExactETHForTokens(
      amountOutMin,
      path,
      userAddress,
      deadline,
      {
        value: ethAmountIn, // ETH value
      }
    );

    await tx.wait();
    NotifySuccess("Swap successful.");
  } catch (error) {
    console.log("Error swapping ETH to USDC:", error);
    NotifyError(getUniswapV2ErrorMessage(error)); // Using the error handler
  }
};

export const getUniswapQuote = async (
  amount: number,
  selectedCrypto: "usdc" | "eth"
): Promise<string> => {
  try {
    const uniswapV2RouterContract = getUniswapV2RouterContract();

    let path: string[] = [];
    let amountIn: string = "";

    // If the selected crypto is USDC, the user is sending USDC and receiving ETH
    if (selectedCrypto === "usdc") {
      path = [USDC_ADDRESS, WETH_ADDRESS];
      amountIn = getCustomWeiFrom(String(amount), BITSTAKE_CONFIG.usdcDecimals); // USDC has 18/6 decimals
    } else {
      path = [WETH_ADDRESS, USDC_ADDRESS];
      amountIn = getWeiFrom(amount.toString()); // ETH has 18 decimals
    }

    // Get amounts out for the given path
    const amountsOut = await uniswapV2RouterContract.getAmountsOut(
      amountIn,
      path
    );

    const amountOut =
      selectedCrypto === "usdc"
        ? getEthFrom(amountsOut[1].toString())
        : getCustomEthFrom(
            amountsOut[1].toString(),
            BITSTAKE_CONFIG.usdcDecimals
          ); // Format output in 6 decimals (for USDC)
    return amountOut;
  } catch (error) {
    console.log("Error fetching quote:", error);
    return "0.0000"; // Default in case of error
  }
};
