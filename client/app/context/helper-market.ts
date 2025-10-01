import {
  BITSTAKE_CONFIG,
  DEFAULT_IMAGES,
  MARKET_BASE
} from "@/app/utils/constants";
import { ethers } from "ethers";
import {
  ZERO_ADDRESS,
  fetchNftMetadata,
  getCurrentTimeInSeconds,
  getCustomEthFrom,
  getCustomWeiFrom,
  getEthFrom,
} from "./helper";
import {
  AgentPropertyCommission,
  AuctionDetail,
  AuctionListingType,
  ConcludablePrimaryListing,
  getAuctionState,
  GetPendingSharesDetailsOutput,
  ListedPropertyData,
  NftMetadata,
  PrimaryListing,
  PrimarySaleState,
  PrimarySaleStatus,
  Purchase,
  SecondaryListing,
  UserPropertyData,
} from "./types";
import {
  _getPropertyDetails,
  _getTotalProperties,
  _getUserRwaBalance,
  _getUserRwaBalanceBatch,
  getRwaContract,
} from "./helper-rwa";
import axios from "axios";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";
import {
  approveUsdcSpender,
  getUsdcAllowance,
  getUSDCContract,
  getUserUsdcBalance,
} from "./helper-usdc";
import { url } from "inspector";
import { Interface } from "ethers/lib/utils";

const ifaceMarketABI = new Interface(BITSTAKE_CONFIG.marketABI); // If needed, replace with dynamic ABI

export const getMarketErrorMessage = (_error: any): string => {
  console.log("❌ Raw error:", _error);

  // 1. Handle user rejection
  const msg = _error?.message?.toLowerCase();
  if (msg?.includes("user rejected") || msg?.includes("user denied")) {
    return "Transaction rejected by user.";
  }

  // 2. Handle known Ethers errors with message
  if (_error?.reason) {
    return _error.reason;
  }

  if (_error?.log?.message) {
    return _error.log.message;
  }

  // 3. Handle custom Solidity errors with encoded data
  const encodedError =
    _error?.data?.originalError?.data || // for some wallet providers
    _error?.data?.data || // for some raw JSON-RPC errors
    _error?.log?.data || // fallback for others
    _error?.data;

  if (encodedError && typeof encodedError === "string") {
    try {
      const decoded = ifaceMarketABI.parseError(encodedError);
      return mapMarketCustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode custom error:", decodeErr);
    }
  }

  // 4. Revert reason via Ethers V5
  if (_error?.receipt?.reason) {
    return _error.receipt.reason;
  }

  // 5. JSON-RPC message fallback
  if (_error?.log?.message) {
    return _error.log.message;
  }
  // 6. error message
  if (_error?.message) {
    return _error.message;
  }

  // 7. Generic fallback
  return "An unknown error occurred during transaction.";
};

function mapMarketCustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    NftMarketplace__ActionRestricted: "Action is restricted.",
    NftMarketplace__AlreadyListed: "This property is already listed.",
    NftMarketplace__AuctionAlreadyConcluded: "Auction has already concluded.",
    NftMarketplace__AuctionHasCancelled: "Auction was cancelled.",
    NftMarketplace__AuctionHasStarted: "Auction has already started.",
    NftMarketplace__AuctionNotExpired: "Auction has not expired yet.",
    NftMarketplace__AuctionNotFound: "Auction not found.",
    NftMarketplace__AuctionNotStartedYet: "Auction has not started yet.",
    NftMarketplace__CantBuyYourListing: "You cannot buy your own listing.",
    NftMarketplace__CantPlaceBid: "Auction ended, You cannot place a bid.",
    NftMarketplace__InvalidAddress: "The address provided is invalid.",
    NftMarketplace__InvalidAgent: "Invalid agent.",
    NftMarketplace__InvalidAmount: "Invalid amount.",
    NftMarketplace__InvalidBid: `Your bid is too low.`, // optionally add args
    NftMarketplace__InvalidBipsValue: "Invalid basis point value.",
    NftMarketplace__InvalidCurrency: "Invalid currency provided.",
    NftMarketplace__InvalidDuration: "Invalid auction duration.",
    NftMarketplace__InvalidFeeAmount: "Platform fee is invalid.",
    NftMarketplace__InvalidPrice: "Price provided is invalid.",
    NftMarketplace__InvalidReferral: "Invalid referral address.",
    NftMarketplace__InvalidReferralBips: "Invalid referral basis points.",
    NftMarketplace__NoCommissionAvailable: "No commission available.",
    NftMarketplace__NotApproved: "You haven't approved this contract.",
    NftMarketplace__NotEligible: "You are not eligible to claim.",
    NftMarketplace__NotEnoughBalance: "You don't have enough token balance.",
    NftMarketplace__NotEnoughSharesAvailable: "Not enough shares available.",
    NftMarketplace__PrimarySaleAlreadyConcluded:
      "Primary sale has already concluded.",
    NftMarketplace__PrimarySaleEnded: "Primary sale has ended.",
    NftMarketplace__PrimarySaleNotEndedYet: "Primary sale hasn't ended yet.",
    NftMarketplace__PropertyDoesNotExists: "Property does not exist.",
    NftMarketplace__PropertyIsDelisted: "Property has been delisted.",
    NftMarketplace__SaleNotEndedYet: "Sale is still ongoing.",
    NftMarketplace__SaleNotFound: "Sale not found.",
    NftMarketplace__SameAction: "Same action already performed.",
    NftMarketplace__SellPriceTooLow: "Listing price is too low.",
    NftMarketplace__TransferFailed: "Transfer failed. Check balance or gas.",
    NftMarketplace__YouAreNotOwner: "Only the owner can perform this action.",
    NftMarketplace__YouAreNotWhitelistedAgent:
      "You are not a whitelisted agent.",
    OwnableInvalidOwner: "Invalid owner.",
    OwnableUnauthorizedAccount: "Unauthorized account.",
  };

  return map[name] || `Smart contract error: ${name}`;
}

export const getMarketContract = (
  signer = false,
  particleProvider?: EVMProvider
): ethers.Contract => {
  let contract;
  if (signer) {
    let ethersProvider;

    if (isSocialAuthType(getLatestAuthType()) && particleProvider) {
      ethersProvider = new ethers.providers.Web3Provider(particleProvider);
    } else {
      //gets here
      ethersProvider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
    }

    const signer = ethersProvider.getSigner();

    contract = new ethers.Contract(
      BITSTAKE_CONFIG.market,
      BITSTAKE_CONFIG.marketABI,
      signer
    );

    return contract;
  }
  const rpcProvider = new ethers.providers.JsonRpcProvider(
    BITSTAKE_CONFIG.rpcUrl
  );
  contract = new ethers.Contract(
    BITSTAKE_CONFIG.market,
    BITSTAKE_CONFIG.marketABI,
    rpcProvider
  );
  return contract;
};

export async function _secondarySale(payload: {
  propertyId: number;
  noOfShares: number;
  pricePerShare: string;
  listingPricePerShare: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    console.log(
      "🚀 ~ payload:",
      payload,
      payload.propertyId,
      payload.noOfShares,
      getCustomWeiFrom(payload.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
    );

    const _propertyId = payload.propertyId;
    const _pricePerShare = Number(payload.pricePerShare);
    const _listingPricePerShare = payload.listingPricePerShare;
    const listingType = "listing";
    const noShares = payload.noOfShares;

    await _enforceMinListingPrice(
      _propertyId,
      _pricePerShare,
      _listingPricePerShare,
      noShares,
      listingType
    );
    await marketplaceContract.callStatic.secondarySale(
      payload.propertyId,
      payload.noOfShares,
      getCustomWeiFrom(payload.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
    );
    const tx = await marketplaceContract.secondarySale(
      payload.propertyId,
      payload.noOfShares,
      getCustomWeiFrom(payload.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}
export async function _changePlatformFeePercentage(payload: {
  newPercentage: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);

    console.log("marketContract", await marketContract.owner());
    await marketContract.callStatic.changePlateFormFee(payload.newPercentage);
    const tx = await marketContract.changePlateFormFee(payload.newPercentage);
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _getDefaultReferralBips(): Promise<number | null> {
  try {
    const marketContract = getMarketContract();
    const referralBips = Number(await marketContract.getDefaultReferralBips());
    return (referralBips / MARKET_BASE) * 100;
  } catch (error) {
    return null;
  }
}

export async function _changeDefaultReferralBips(payload: {
  newReferralBips: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);

    console.log("marketContract", await marketContract.owner());
    await marketContract.callStatic.changeDefaultReferralBips(
      payload.newReferralBips
    );
    const tx = await marketContract.changeDefaultReferralBips(
      payload.newReferralBips
    );
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _getExclusiveReferralBips(
  agentAddress: string
): Promise<number | null> {
  try {
    const marketContract = getMarketContract();
    const referralBips = Number(
      await marketContract.getExclusiveReferralBips(agentAddress)
    );
    return (referralBips / MARKET_BASE) * 100;
  } catch (error) {
    return null;
  }
}

export async function _addExclusiveReferralBips(payload: {
  agentAddress: string;
  newReferralBips: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);

    console.log("marketContract", await marketContract.owner());
    await marketContract.callStatic.addExclusiveReferralBips(
      payload.agentAddress,
      payload.newReferralBips
    );
    const tx = await marketContract.addExclusiveReferralBips(
      payload.agentAddress,
      payload.newReferralBips
    );
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _updateAgentWhitelistStatus(payload: {
  _agent: string;
  _makeAgent: boolean;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);

    await marketContract.callStatic.updateAgentWhitelistStatus(
      payload._agent,
      payload._makeAgent
    );
    const tx = await marketContract.updateAgentWhitelistStatus(
      payload._agent,
      payload._makeAgent
    );
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _updateBlacklist(payload: {
  _user: string;
  _makeBlacklist: boolean;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);

    const _isBlacklisted = await marketContract.isBlacklisted(payload._user);

    if (_isBlacklisted === payload._makeBlacklist) {
      throw new Error(
        `User is already ${
          payload._makeBlacklist ? "blacklisted" : "not blacklisted"
        }`
      );
    }

    await marketContract.callStatic.updateBlacklist(
      [payload._user],
      payload._makeBlacklist
    );
    const tx = await marketContract.updateBlacklist(
      [payload._user],
      payload._makeBlacklist
    );
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _changeBidIncreamentPercentage(payload: {
  newPercentage: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);
    await marketContract.callStatic.setMinBidIncrementBips(
      payload.newPercentage
    );
    const tx = await marketContract.setMinBidIncrementBips(
      payload.newPercentage
    );
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}
export async function _changeFloorPricePercentage(payload: {
  newPercentage: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, payload.particleProvider);
    await marketContract.callStatic.setMinListingPriceBips(
      payload.newPercentage
    );
    const tx = await marketContract.setMinListingPriceBips(
      payload.newPercentage
    );
    await tx.wait();

    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}
export async function _createAuction({
  propertyId,
  noOfShares,
  basePrice,
  startTime,
  endTime,
  listingPricePerShare,
  particleProvider,
}: {
  propertyId: number;
  noOfShares: number;
  basePrice: string;
  startTime: number;
  endTime: number;
  listingPricePerShare: number;
  particleProvider: EVMProvider;
}) {
  try {
    const contract = getMarketContract(true, particleProvider);
    const weiPrice = getCustomWeiFrom(basePrice, BITSTAKE_CONFIG.usdcDecimals);

    console.log(
      "asdasd: ",
      propertyId,
      noOfShares,
      weiPrice,
      startTime,
      endTime
    );

    const _pricePerShare = Number(basePrice) / noOfShares;
    const _listingPricePerShare = listingPricePerShare;
    const listingType = "auction";
    const noShares = noOfShares;

    await _enforceMinListingPrice(
      propertyId,
      _pricePerShare,
      _listingPricePerShare,
      noShares,
      listingType
    );

    // static call to validate params
    await contract.callStatic.createAuction(
      propertyId,
      noOfShares,
      weiPrice,
      startTime,
      endTime
    );

    // actual transaction
    const tx = await contract.createAuction(
      propertyId,
      noOfShares,
      weiPrice,
      startTime,
      endTime
    );

    await tx.wait();
    return tx;
  } catch (err) {
    throw new Error(getMarketErrorMessage(err));
  }
}
export async function _getAuctionDetail({
  auctionId,
  account,
  particleProvider,
}: {
  auctionId: number;
  account: `0x${string}` | undefined;
  particleProvider: EVMProvider;
}): Promise<AuctionDetail | null> {
  try {
    const contract = getMarketContract();
    const auctionData = await contract.getAuctionDetails(auctionId);

    const {
      propertyId,
      noOfShares,
      basePrice,
      startTime,
      endTime,
      highestBid,
      highestBidder,
      seller,
      status,
    } = auctionData;

    const isHighestBidder = account
      ? account.toLowerCase() === highestBidder.toLowerCase()
      : false;
    const isSeller = account
      ? account.toLowerCase() === seller.toLowerCase()
      : false;

    const _basePrice = parseFloat(
      getCustomEthFrom(String(basePrice), BITSTAKE_CONFIG.usdcDecimals)
    );
    const _highestBid = parseFloat(
      getCustomEthFrom(String(highestBid), BITSTAKE_CONFIG.usdcDecimals)
    );

    const details: AuctionDetail = {
      propertyId: Number(propertyId),
      noOfShares: Number(noOfShares),
      basePrice: _basePrice,
      startTime: Number(startTime),
      endTime: Number(endTime),
      highestBid: _highestBid,
      highestBidder,
      seller,
      isSeller,
      isHighestBidder,
      status: getAuctionState(Number(status)),
    };

    return details;
  } catch (err) {
    return null;
  }
}

export async function _concludeAuction({
  auctionId,
  particleProvider,
}: {
  auctionId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, particleProvider);
    await marketContract.callStatic.concludeAuction(auctionId);
    const tx = await marketContract.concludeAuction(auctionId);
    await tx.wait();
    return tx;
  } catch (err) {
    throw new Error(getMarketErrorMessage(err));
  }
}

export async function _getBidAmount({
  auctionId,
  particleProvider,
}: {
  auctionId: number;
  particleProvider: EVMProvider;
}) {
  const marketContract = getMarketContract(false, particleProvider);
  const auctionDetails = await marketContract.getAuctionDetails(auctionId);
  let baseBidAmount = parseFloat(
    String(ethers.utils.formatEther(auctionDetails.basePrice))
  );
  const auctionDetails_highestBid = parseFloat(
    String(ethers.utils.formatEther(auctionDetails.highestBid))
  );
  const bidPlaced = auctionDetails_highestBid > 0;
  if (bidPlaced) {
    const minBidIncrementBips = Number(
      await marketContract.getMinBidIncrementBips()
    );
    baseBidAmount =
      auctionDetails_highestBid +
      (auctionDetails_highestBid * minBidIncrementBips) / MARKET_BASE;
  }
  const baseBidAmount_wei = String(
    ethers.utils.parseEther(String(baseBidAmount))
  );

  return {
    bidAmount: baseBidAmount,
    bidAmountWei: baseBidAmount_wei,
  };
}

export async function _placeBid({
  auctionId,
  accountAddress,
  bidPrice,
  particleProvider,
}: {
  auctionId: number;
  accountAddress: string;
  bidPrice: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, particleProvider);
    const { bidAmount } = await _getBidAmount({ auctionId, particleProvider });

    const userBidAmount = parseFloat(bidPrice);

    if (userBidAmount < bidAmount)
      throw new Error(`Bid Price has to be greater or equal to ${bidAmount}`);

    const balance = await getUserUsdcBalance({ user: accountAddress });
    if (userBidAmount > balance)
      throw new Error(`Insufficient USDC balance, required ${balance}`);

    const allowance = await getUsdcAllowance({
      owner: accountAddress,
      spenderType: "market",
    });
    if (userBidAmount > allowance)
      await approveUsdcSpender({
        amount: bidPrice,
        particleProvider,
        spenderType: "market",
      });
    const bidAmountWei = getCustomWeiFrom(bidPrice, BITSTAKE_CONFIG.usdcDecimals);

    await marketContract.callStatic.placeBid(auctionId, bidAmountWei);
    const tx = await marketContract.placeBid(auctionId, bidAmountWei);
    await tx.wait();
    return tx;
  } catch (err) {
    throw new Error(getMarketErrorMessage(err));
  }
}
export async function _cancelAuction({
  auctionId,
  particleProvider,
}: {
  auctionId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketContract = getMarketContract(true, particleProvider);
    await marketContract.callStatic.cancelAuction(auctionId);
    const tx = await marketContract.cancelAuction(auctionId);
    await tx.wait();
    return tx;
  } catch (err) {
    throw new Error(getMarketErrorMessage(err));
  }
}

// Update secondary sale
export async function _updateSecondarySale(payload: {
  propertyId: number;
  listingId: number;
  noOfShares: number;
  pricePerShare: string;
  listingPricePerShare: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );

    const _propertyId = payload.propertyId;
    const _pricePerShare = Number(payload.pricePerShare);
    const _listingPricePerShare = payload.listingPricePerShare;
    const listingType = "update listing";
    const noShares = payload.noOfShares;

    await _enforceMinListingPrice(
      _propertyId,
      _pricePerShare,
      _listingPricePerShare,
      noShares,
      listingType
    );

    await marketplaceContract.callStatic.updateSecondarySale(
      payload.listingId,
      payload.noOfShares,
      payload.pricePerShare !== "0"
        ? getCustomWeiFrom(payload.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
        : 0
    );
    const tx = await marketplaceContract.updateSecondarySale(
      payload.listingId,
      payload.noOfShares,
      payload.pricePerShare !== "0"
        ? getCustomWeiFrom(payload.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
        : 0
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

// Bulk buy secondary sale
export async function _bulkBuySecondarySale(payload: {
  properties: Purchase[];
  recipient: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    await marketplaceContract.callStatic.bulkBuySecondarySale(
      payload.properties,
      payload.recipient
    );
    const tx = await marketplaceContract.bulkBuySecondarySale(
      payload.properties,
      payload.recipient
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

// Buy primary shares
export async function _buyPrimarySharesByWert(payload: {
  recipient: string;
  currency: string;
  pricePerShare: number;
  propertyId: number;
  sharesToBuy: number;
  referralAddress: string;
  particleProvider: EVMProvider;
}) {
  try {
    let _value = "0";

    if (payload.currency.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
      const quote = await _getQuote({
        sharesToBuy: payload.sharesToBuy,
        pricePerShare: payload.pricePerShare,
      });
      // console.log("🚀 ~ quote:", quote);

      _value = quote;
    }

    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    await marketplaceContract.callStatic.buyPrimaryShares(
      payload.recipient,
      payload.currency,
      payload.propertyId,
      payload.sharesToBuy,
      payload.referralAddress,
      {
        value: _value,
      }
    );
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}
// Buy primary shares
export async function _buyPrimaryShares(payload: {
  recipient: string;
  currency: string;
  pricePerShare: number;
  propertyId: number;
  sharesToBuy: number;
  referralAddress: string;
  particleProvider: EVMProvider;
}) {
  try {
    console.log("payload", payload);

    let _value = "0";

    if (payload.currency.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
      const quote = await _getQuote({
        sharesToBuy: payload.sharesToBuy,
        pricePerShare: payload.pricePerShare,
      });
      // console.log("🚀 ~ quote:", quote);

      _value = quote;
    }

    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );

    await marketplaceContract.callStatic.buyPrimaryShares(
      payload.recipient,
      payload.currency,
      payload.propertyId,
      payload.sharesToBuy,
      payload.referralAddress,
      {
        value: _value,
      }
    );
    const tx = await marketplaceContract.buyPrimaryShares(
      payload.recipient,
      payload.currency,
      payload.propertyId,
      payload.sharesToBuy,
      payload.referralAddress,
      {
        value: _value,
      }
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _claimReferralCommission(payload: {
  propertyId: number;
  particleProvider: EVMProvider;
}) {
  try {
    console.log("payload", payload);

    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );

    await marketplaceContract.callStatic.claimReferralCommission(
      payload.propertyId
    );
    const tx = await marketplaceContract.claimReferralCommission(
      payload.propertyId
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

// Buy secondary shares
export async function _buySecondaryShares(payload: {
  property: Purchase;
  recipient: string;
  pricePerShare: number;
  currency: string;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    await marketplaceContract.callStatic.buySecondaryShares(
      payload.property,
      payload.recipient,
      payload.currency,
      {
        value:
          payload.currency.toLowerCase() === ZERO_ADDRESS.toLowerCase()
            ? await _getQuote({
                sharesToBuy: payload.property.sharesToBuy,
                pricePerShare: payload.pricePerShare,
              })
            : 0,
      }
    );
    const tx = await marketplaceContract.buySecondaryShares(
      payload.property,
      payload.recipient,
      payload.currency,
      {
        value:
          payload.currency.toLowerCase() === ZERO_ADDRESS.toLowerCase()
            ? await _getQuote({
                sharesToBuy: payload.property.sharesToBuy,
                pricePerShare: payload.pricePerShare,
              })
            : 0,
      }
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

// Cancel secondary sale
export async function _cancelSecondarySale(payload: {
  listingId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    await marketplaceContract.callStatic.cancelSecondarySale(payload.listingId);
    const tx = await marketplaceContract.cancelSecondarySale(payload.listingId);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

// Claim pending shares or funds
export async function _claimPendingSharesOrFunds(payload: {
  propertyId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    await marketplaceContract.callStatic.claimPendingSharesOrFunds(
      payload.propertyId
    );
    const tx = await marketplaceContract.claimPendingSharesOrFunds(
      payload.propertyId
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _concludePrimarySale(payload: {
  propertyId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const marketplaceContract = getMarketContract(
      true,
      payload.particleProvider
    );
    await marketplaceContract.callStatic.concludePrimarySale(
      payload.propertyId
    );
    const tx = await marketplaceContract.concludePrimarySale(
      payload.propertyId
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

// Get primary sale listing details
export async function _getPrimarySale(payload: {
  propertyId: number;
}): Promise<PrimaryListing> {
  try {
    const marketplaceContract = getMarketContract();
    const saleDetails = await marketplaceContract.getPrimarySale(
      payload.propertyId
    );
    const listing = {
      seller: saleDetails.seller,
      endTime: Number(saleDetails.endTime),
      sharesMinimumWorth: parseFloat(
        getCustomEthFrom(saleDetails.sharesMinimumWorth, BITSTAKE_CONFIG.usdcDecimals)
      ),
      totalShares: Number(saleDetails.totalShares),
      sharesRemaining: Number(saleDetails.sharesRemaining),
      usdcReceived: parseFloat(
        getCustomEthFrom(saleDetails.usdcReceived, BITSTAKE_CONFIG.usdcDecimals)
      ),
      ethReceived: parseFloat(getEthFrom(saleDetails.ethReceived)),
    };
    return listing;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _getQuote(payload: {
  sharesToBuy: number;
  pricePerShare: number;
}): Promise<string> {
  try {
    const marketplaceContract = getMarketContract();
    const quote = await marketplaceContract.getQuote(
      ZERO_ADDRESS,
      payload.sharesToBuy,
      getCustomWeiFrom(String(payload.pricePerShare), BITSTAKE_CONFIG.usdcDecimals)
    );

    return quote.toString();
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _getPrimarySaleState(payload: {
  propertyId: number;
}): Promise<PrimarySaleStatus> {
  try {
    const marketplaceContract = getMarketContract();
    const state = Number(
      await marketplaceContract.getPrimarySaleState(payload.propertyId)
    );

    let status: PrimarySaleStatus;

    switch (state) {
      case PrimarySaleState.None:
        status = "none";
        break;
      case PrimarySaleState.OnGoing:
        status = "ongoing";
        break;
      case PrimarySaleState.Claim:
        status = "claim";
        break;
      case PrimarySaleState.Refund:
        status = "refund";
        break;
      default:
        status = "none";
    }

    return status;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export const _displayPrimarySaleStatus = (
  status: PrimarySaleStatus
): string => {
  // Capitalize and space the status
  return status
    .split(/(?=[A-Z])/)
    .join(" ") // Insert spaces before uppercase letters
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

// Get secondary listing
export async function _getSecondaryListing(payload: {
  listingId: number;
}): Promise<SecondaryListing | null> {
  try {
    const marketplaceContract = getMarketContract();
    const saleDetails = await marketplaceContract.getSecondaryListing(
      payload.listingId
    );

    const sharesRemaining = Number(saleDetails.sharesRemaining);
    const propertyId = Number(saleDetails.propertyId);
    if (sharesRemaining > 0) {
      const details = await _getPropertyDetails({
        propertyId: propertyId,
      });

      const metadata: NftMetadata | null =
        details !== null ? await fetchNftMetadata(details.uri) : null;

      const validMetadata = {
        description: metadata?.description || "----",
        image: metadata?.image || DEFAULT_IMAGES[0],
        images: metadata?.images || DEFAULT_IMAGES,
        name: metadata?.name || "----",
        attributes: metadata?.attributes || [],
      };
      const listing = {
        listingId: payload.listingId,
        propertyId: propertyId,
        seller: saleDetails.seller,
        pricePerShare: parseFloat(
          getCustomEthFrom(String(saleDetails.pricePerShare), BITSTAKE_CONFIG.usdcDecimals)
        ),
        sharesRemaining: sharesRemaining,
        totalOwners: details?.totalOwners || 0,
        totalShares: details?.totalShares || 0,
        totalPrice:
          details === null ? 0 : details.totalShares * details.pricePerShare,
        description: validMetadata.description,
        image: validMetadata.image,
        images: validMetadata.images,
        name: validMetadata.name,
        attributes: validMetadata.attributes,
        uri: details?.uri || "",
        aprBips: details?.aprBips || 0,
      };
      return listing;
    } else return null;
  } catch (error) {
    return null;
  }
}

// Get auction listing
export async function _getAuctionListing(payload: {
  listingId: number;
}): Promise<AuctionListingType | null> {
  try {
    const marketplaceContract = getMarketContract();
    const saleDetails = await marketplaceContract.getAuctionListing(
      payload.listingId
    );
    if (saleDetails.sharesRemaining > 0) {
      const details = await _getPropertyDetails({
        propertyId: saleDetails.propertyId,
      });
      const metadata: NftMetadata | null =
        details !== null ? await fetchNftMetadata(details.uri) : null;

      const validMetadata = {
        description: metadata?.description || "----",
        image: metadata?.image || DEFAULT_IMAGES[0],
        images: metadata?.images || DEFAULT_IMAGES,
        name: metadata?.name || "----",
        attributes: metadata?.attributes || [],
      };
      const listing = {
        listingId: payload.listingId,
        propertyId: Number(saleDetails.propertyId),
        seller: saleDetails.seller,
        pricePerShare: parseFloat(
          getCustomEthFrom(saleDetails.pricePerShare, BITSTAKE_CONFIG.usdcDecimals)
        ),
        sharesRemaining: saleDetails.sharesRemaining,
        totalOwners: details?.totalOwners || 0,
        totalShares: details?.totalShares || 0,
        totalPrice:
          details === null ? 0 : details.totalShares * details.pricePerShare,
        description: validMetadata.description,
        image: validMetadata.image,
        images: validMetadata.images,
        name: validMetadata.name,
        attributes: validMetadata.attributes,
        basePrice: parseFloat(
          getCustomEthFrom(saleDetails.basePrice, BITSTAKE_CONFIG.usdcDecimals)
        ),
        highestBid: parseFloat(
          getCustomEthFrom(saleDetails.highestBid, BITSTAKE_CONFIG.usdcDecimals)
        ),
        highestBidTxHash: saleDetails.highestBidTxHash || "",
      };
      return listing;
    } else return null;
  } catch (error) {
    return null;
  }
}

// Get pending shares details
export async function _getPendingSharesDetails(payload: {
  buyerAddress: string;
  propertyId: number;
}): Promise<GetPendingSharesDetailsOutput> {
  try {
    const marketplaceContract = getMarketContract();
    const pendingDetails: any =
      await marketplaceContract.getPendingSharesDetails(
        payload.buyerAddress,
        payload.propertyId
      );

    const pendingShares = {
      shares: Number(pendingDetails.shares),
      usdcSpent: parseFloat(
        getCustomEthFrom(pendingDetails.usdcSpent, BITSTAKE_CONFIG.usdcDecimals)
      ),
      ethSpent: parseFloat(getEthFrom(pendingDetails.ethSpent)),
    };

    return pendingShares;
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}

export async function _getUserProperty(payload: {
  userAddress: string;
  propertyId: number;
  rwaContract: ethers.Contract;
}): Promise<UserPropertyData | undefined> {
  try {
    const userBalance = await _getUserRwaBalance({
      rwaContract: payload.rwaContract,
      userAddress: payload.userAddress,
      propertyId: payload.propertyId,
    });

    if (userBalance > 0) {
      const details = await _getPropertyDetails({
        propertyId: payload.propertyId,
      });
      // console.log("🚀 ~ details:", payload.propertyId, details);

      if (details === null) return;

      const metadata: NftMetadata | null =
        details !== null ? await fetchNftMetadata(details.uri) : null;

      const validMetadata = {
        description: metadata?.description || "----",
        image: metadata?.image || DEFAULT_IMAGES[0],
        images: metadata?.images || DEFAULT_IMAGES,
        name: metadata?.name || "----",
        attributes: metadata?.attributes || [],
      };
      const property = {
        propertyId: payload.propertyId,
        pricePerShare: details?.pricePerShare || 0,

        totalOwners: details?.totalOwners || 0,
        totalShares: details?.totalShares || 0,
        totalPrice:
          details === null ? 0 : details.totalShares * details.pricePerShare,
        sharesOwned: userBalance,
        description: validMetadata.description,
        image: validMetadata.image,
        images: validMetadata.images,
        name: validMetadata.name,
        attributes: validMetadata.attributes,
        aprBips: details?.aprBips || 0,
        uri: details?.uri || "",
      };
      return property;
    }
  } catch (error) {
    throw new Error(getMarketErrorMessage(error));
  }
}
export async function _getUserProperties(payload: {
  userAddress: string;
}): Promise<UserPropertyData[]> {
  try {
    const totalProperties = await _getTotalProperties();
    const rwaContract = getRwaContract();

    // Get user balances for all properties
    const userBalances = await _getUserRwaBalanceBatch({
      userAddress: payload.userAddress,
      rwaContract,
      totalProperties,
    });

    console.log("🚀 ~ _getUserProperties ~ userBalances:", userBalances);

    // Filter out entries where the balance is 0 or less
    const propertiesWithBalance = userBalances.filter(
      (balance) => balance.balance > 0
    );

    // Fetch the property data in parallel
    const allPropertiesPromises = propertiesWithBalance.map((balance) =>
      _getUserProperty({
        rwaContract,
        userAddress: payload.userAddress,
        propertyId: balance.propertyId,
      })
    );

    // Wait for all properties to be fetched
    const allProperties = await Promise.all(allPropertiesPromises);

    // Return the resolved property data
    return allProperties.filter(
      (property) => property !== undefined
    ) as UserPropertyData[];
  } catch (error) {
    console.log("Error fetching user properties:", error);
    return [];
  }
}

export async function _getPrimaryListedProperty(payload: {
  propertyId: number;
}): Promise<ListedPropertyData | null> {
  try {
    const listing = await _getPrimarySale({ propertyId: payload.propertyId });

    const details = await _getPropertyDetails({
      propertyId: payload.propertyId,
    });
    if (listing.seller === ZERO_ADDRESS || details === null) {
      return null;
    }
    const metadata: NftMetadata | null = await fetchNftMetadata(details.uri);

    const validMetadata = {
      description: metadata?.description || "----",
      image: metadata?.image || DEFAULT_IMAGES[0],
      images: metadata?.images || DEFAULT_IMAGES,
      name: metadata?.name || "----",
      attributes: metadata?.attributes || [],
    };

    const property = {
      propertyId: payload.propertyId,
      owner: details.owner,
      pricePerShare: details.pricePerShare,
      sharesRemaining: listing.sharesRemaining,
      endTime: listing.endTime,
      totalOwners: details.totalOwners,
      totalShares: details.totalShares,
      uri: details.uri,
      totalPrice: details.totalShares * details.pricePerShare,
      description: validMetadata.description,
      image: validMetadata.image,
      images: validMetadata.images,
      name: validMetadata.name,
      attributes: validMetadata.attributes,
      aprBips: details.aprBips,
    };
    return property;
  } catch (error) {
    return null;
  }
}

export async function _getConcludablePrimaryListings(): Promise<
  ConcludablePrimaryListing[]
> {
  try {
    const totalProperties = await _getTotalProperties();

    let properties: ConcludablePrimaryListing[] = [];
    for (let _id = totalProperties; _id >= 1; _id--) {
      const listing = await _getPrimarySale({ propertyId: _id });

      if (
        listing.seller !== ZERO_ADDRESS &&
        (listing.sharesRemaining == 0 ||
          listing.endTime <= getCurrentTimeInSeconds())
      ) {
        const property: ConcludablePrimaryListing = {
          propertyId: _id,
          sharesMinimumWorth: listing.sharesMinimumWorth,
          totalFractions: listing.totalShares,
          sharesRemaining: listing.sharesRemaining,
          fractionSold: listing.totalShares - listing.sharesRemaining,
          ethReceived: listing.ethReceived,
          usdcReceived: listing.usdcReceived,
        };

        properties.push(property);
      }
    }
    return properties;
  } catch (error) {
    console.log("🚀 ~ _getConcludablePrimaryListings : error:", error);
    return [];
  }
}

export async function _getMarketOwner(): Promise<string | null> {
  try {
    const marketContract = getMarketContract();
    const owner = await marketContract.owner();
    return owner;
  } catch (error) {
    return null;
  }
}

export async function _getPlatformFeePercentage(): Promise<number | null> {
  try {
    const marketContract = getMarketContract();
    const feeBips = Number(await marketContract.getPlatformFee());
    return (feeBips / MARKET_BASE) * 100;
  } catch (error) {
    return null;
  }
}

export async function _getAgentClaimableCommission(
  agentAddress: string,
  propertyId: number
): Promise<AgentPropertyCommission | null> {
  try {
    const marketContract = getMarketContract();
    const commissionRaw = await marketContract.getReferralCommission(
      agentAddress,
      propertyId
    );
    return {
      commissionInETH: parseFloat(getEthFrom(commissionRaw.commissionInETH)),
      commissionInUSDC: parseFloat(getCustomEthFrom(commissionRaw.commissionInUSDC,BITSTAKE_CONFIG.usdcDecimals)),
    };
  } catch (error) {
    return null;
  }
}

export async function _getMinBidIncrementBipsPercentage(): Promise<
  number | null
> {
  try {
    const marketContract = getMarketContract();
    const feeBips = Number(await marketContract.getMinBidIncrementBips());
    return (feeBips / MARKET_BASE) * 100;
  } catch (error) {
    return null;
  }
}

export async function _getMinListingPriceBipsPercentage(): Promise<
  number | null
> {
  try {
    const marketContract = getMarketContract();
    const feeBips = Number(await marketContract.getMinListingPriceBips());
    console.log("🚀 ~ getMinListingPriceBips feeBips:", feeBips);
    return (feeBips / MARKET_BASE) * 100;
  } catch (error) {
    return null;
  }
}
export async function _getValidAndWhitelistedAgent(
  _agent: string | null,
  _connectedAddress: string
): Promise<string> {
  if (_agent == null) {
    return ZERO_ADDRESS;
  }
  const isValid = ethers.utils.isAddress(_agent);
  if (!isValid) {
    throw new Error("Invalid referral link, invalid referral address");
  }
  if (_agent.toLowerCase() === _connectedAddress.toLowerCase()) {
    throw new Error("Invalid referral link, you cannot refer yourself");
  }
  const marketContract = getMarketContract();
  const isAgentWhitelisted = await marketContract.isAgentWhitelisted(_agent);
  console.log("🚀 ~ isAgentWhitelisted:", isAgentWhitelisted);
  if (!isAgentWhitelisted) {
    throw new Error("Invalid referral link,not whitelisted");
  }
  return _agent;
}

export async function _isUserWhitelistedAgent(_user: string): Promise<boolean> {
  try {
    const marketContract = getMarketContract();
    const isUserWhitelistedAgent = await marketContract.isAgentWhitelisted(
      _user
    );
    console.log("🚀 ~ isUserWhitelistedAgent:", isUserWhitelistedAgent);
    return isUserWhitelistedAgent;
  } catch (error) {
    console.log("Error checking if user is whitelisted agent:", error);
    return false;
  }
}
export async function _isUserBlacklisted(_user: string): Promise<boolean> {
  try {
    const marketContract = getMarketContract();
    const _isBlacklisted = await marketContract.isBlacklisted(_user);
    console.log("🚀 ~ _isBlacklisted:", _isBlacklisted);
    return _isBlacklisted;
  } catch (error) {
    console.log("Error checking if user is whitelisted agent:", error);
    return false;
  }
}

export async function _enforceMinListingPrice(
  _propertyId: number,
  _pricePerShare: number,
  _listingPricePerShare: number,
  noShares: number,
  listingType: "listing" | "auction" | "update listing"
): Promise<void> {
  const marketContract = getMarketContract();
  const feeBips = Number(await marketContract.getMinListingPriceBips());

  const minAllowedPrice = (_listingPricePerShare * feeBips) / MARKET_BASE;

  if (minAllowedPrice > _pricePerShare) {
    throw new Error(
      `Minimum ${listingType} price should be ${
        listingType === "auction" ? minAllowedPrice * noShares : minAllowedPrice
      }`
    );
  }
}
