
import { ProposalStateKey } from "./helper-voting";
import { AgentPrimarySharesBought } from "./subgraph-helpers/market-subgraph";

export type PrimarySaleStatus = "none" | "ongoing" | "claim" | "refund";
export type AdminAggregatedAgentData = {
  agent: string;
  uniqueBuyersCount: number;
  uniquePropertiesCount: number;
  totalInvestment: number;
  totalCommission: number;
};
export type AdminPrimarySalesStats = {
  wholeUniqueBuyers: number;
  wholeUniqueProperties: number;
  wholeInvestment: number;
  wholeMarketFees: number;
  wholeSecondaryInvestment: number;
  wholeSecondaryMarketFees: number;
};

export type AgentPropertyCommission = {
  commissionInETH: number;
  commissionInUSDC: number;
};

export type AgentGroupedData = {
  propertyId: number;
  groupedByBuyer: {
    [buyer: string]: AgentPrimarySharesBought[];
  };
};

export type AgentAggregatedData = {
  totalInvestment: number;
  totalClients: number;
  totalProperties: number;
  totalCommissionFees: number;
};

export type FormDetails = {
  owner: string;
  status: FormRequestEventStatus;
  pricePerShare: number;
  totalShares: number;
  aprBips: number;
  saleTime: number;
  registrationFeesPaid: number;
  uri: string;
};

export type PrimaryListing = {
  seller: string;
  endTime: number;
  sharesMinimumWorth: number;
  totalShares: number;
  sharesRemaining: number;
  usdcReceived: number;
  ethReceived: number;
};

export type SecondaryListing = {
  listingId: number;
  propertyId: number;
  seller: string;
  pricePerShare: number;
  sharesRemaining: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  description: string;
  image: string;
  images: string[];
  name: string;
  aprBips: number;
  attributes: Attribute[];
  uri: string;
};

export type AuctionListingType = {
  listingId: number;
  propertyId: number;
  seller: string;
  pricePerShare: number;
  sharesRemaining: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  description: string;
  image: string;
  images: string[];
  name: string;
  attributes: Attribute[];
  basePrice: number;
  highestBid: number;
  highestBidTxHash: string;
};

export type Purchase = {
  listingId: number;
  sharesToBuy: number;
};

export type GetPendingSharesDetailsOutput = {
  shares: number;
  usdcSpent: number;
  ethSpent: number;
};

export type PinataResponse = {
  success: boolean;
  pinataURL?: string;
  message?: string;
};
export type PropertyDetails = {
  owner: string;
  pricePerShare: number;
  totalOwners: number;
  totalShares: number;
  aprBips: number;
  uri: string;
};
export type ListedPropertyData = {
  propertyId: number;
  owner: string;
  pricePerShare: number;
  sharesRemaining: number;
  endTime: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  description: string;
  uri?: string;
  image: string;
  images: string[];
  name: string;
  aprBips: number;
  attributes: Attribute[];
};
export type ListedProperty = {
  propertyId: number;
  owner: string;
  pricePerShare: number;
  sharesRemaining: number;
  endTime: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  uri: string;
};
export type ProposalDetails = {
  propertyId: number;
  proposer: string;
  endTime: number;
  startTime: number;
  votesInFavour: number;
  votesInAgainst: number;
  description: string;
  status: ProposalStateKey;
};
export type ProposalDataType = {
  proposalId: number;
  proposalData: ProposalDetails | null;
  propertyData: PropertyDetails | null;
  metadata: NftMetadata | null;
  userVotesStatus: UserVotesStatusType | null;
};
export type ClaimableRentsType = {
  userShares: number;
  propertyId: string;
  startTime: number;
  endTime: number;
  totalRent: number;
  rentRemaining: number;
  rentPerShare: number;
};

export type RentWithdrawnEventRaw = {
  _by: string;
  _propertyId: string;
  _rent: string;
  blockTimestamp: string;
};

export type RentWithdrawnEventFormatted = {
  id: number;
  propertyId: number;
  date: number;
  payout: number;
};
export interface RentStatusEvent {
  _propertyId: string;
  _monthRent: string;
  _status: number;
  blockTimestamp: string;
  startTime: number;
  endTime: number;
}
export type UserVotesStatusType = {
  votedAs: "yes" | "no" | "not_voted";
  canVote: boolean;
};

export type SpenderType = "market" | "voting" | "rent" | "form" | "uniswapV2Router"; //!keep values same as keys from config

export type VotedEvent = {
  id: string;
  _by: string;
  _proposalId: string;
  _inFavor: boolean;
};

export type UserPropertyData = {
  propertyId: number;
  pricePerShare: number;
  sharesOwned: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  description: string;
  image: string;
  images: string[];
  name: string;
  attributes: Attribute[];
  aprBips: number;
  uri: string;
  sharesRemaining?: number;
};

export type FormRequestedType = {
  serialNo: number;
  fractions: number;
  fractionPrice: number;
  uri: string;
  // name: string;
  // city: string;
  // country: string;
  // propertyType: string;
  // homeType: string;
  // description: string;
};

export type FormAgentType = {
  propertyId: number;
  claimAmount: number;
};

export type FormAdminType = {
  walletAddress: string;
  totalRevenue: number;
  clients: number;
  properties: number;
  commission: number;
};

export type FormRentType = {
  userShares: number;
  propertyId: string; // or number, depending on your data
  startTime: number; // Unix timestamp in seconds
  endTime: number;
  totalRent: number;
  rentRemaining: number;
  rentPerShare: number;
};

export type Attribute = {
  trait_type: string;
  value: string;
};
export type FormInputType = { label: string; value: string };

export type SecondaryListingPayload = {
  propertyId: number;
  seller: string;
};

export type DocumentInfo = {
  fileName: string;
  url: string;
};

export type NftMetadata = {
  name: string;
  description: string;
  image: string;
  view3d?: string;
  images: string[];
  documents?: DocumentInfo[];
  attributes: Attribute[];
  transactionBreakdown: BreakdownField[];
  rentalBreakdown: BreakdownField[];
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type RequestFormData = {
  name: string;
  description: string;
  city: string;
  country: string;
  homeType: string;
  propertyType: string;
  fractions: string;
  fractionPrice: string;
  days: number;
  hours: number;
  minutes: number;
  view3d?: string;
  latitude?: number;
  longitude?: number;
  aprBips: number;
};

export type BreakdownField = { key: string; value: string };

export type Product = {
  listingId: number;
  propertyId: number;
  name: string;
  pricePerShare: number;
  image: string;
  quantity: number; // Optional quantity field
  seller: string;
  sharesRemaining: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  description: string;
  images: string[];
  attributes: Attribute[];
};

export type AuctionProduct = {
  auctionId: number;
  propertyId: number;
  name: string;
  owner?: string;
  pricePerShare: number;
  image: string;
  quantity: number; // Optional quantity field
  seller: string;
  sharesRemaining?: number;
  totalOwners: number;
  totalShares: number;
  totalPrice: number;
  description: string;
  images: string[];
  attributes: Attribute[];
  startTime: number;
  endTime: number;
  id: number;
  noOfShares: number;
  uri: string;
  basePrice: number;
  highestBid: number;
  highestBidder: string;
  status: AuctionState;
  isSeller: boolean;
  isHighestBidder: boolean;
  view3d?: string;
  documents?: DocumentInfo[];
  transactionBreakdown: BreakdownField[];
  rentalBreakdown: BreakdownField[];
  location?: {
    latitude: number;
    longitude: number;
  };
  aprBips: number;
};

export type FormRequestEventStatus = "0" | "1" | "2" | "3";
export type FormRequestEventStatusText =
  | "None"
  | "Pending"
  | "Accepted"
  | "Rejected";
export const GetFormRequestEventStatusText = {
  "0": "None",
  "1": "Pending",
  "2": "Accepted",
  "3": "Rejected",
};
export enum PrimarySaleState {
  None, // 0
  OnGoing, // 1
  Claim, // 2
  Refund, // 3
}
export type FormRequestEvent = {
  _by: string;
  _requestId: string;
  _status: FormRequestEventStatusText;
  _propertyId: number;
};

export type SecondaryListingsEvent = {
  _seller: string;
  _propertyId: string;
};

export type PropertyRequest = {
  id: number;
  status: FormRequestEventStatusText;
  fractions: string;
  fractionsPrice: string;
  acceptedPropertyId?: number;
  uri: string;
};
export type UserPrimarySharesBoughtEvent = {
  _propertyId: string;
};

export type Property = {
  propertyId: number;
  propertyName: string;
  fractionsBought: number;
  usdcSpent: number;
  ethSpent: number;
  timeLeft: number;
  status: PrimarySaleStatus;
};

export type ConcludablePrimaryListing = {
  propertyId: number;
  sharesMinimumWorth: number;
  totalFractions: number;
  sharesRemaining: number;
  fractionSold: number;
  ethReceived: number;
  usdcReceived: number;
};

export type SecondarySharesListedEvent = {
  _seller: string;
  _propertyId: string;
  // _status: string;
  // _sharesBought: string;
  blockTimestamp: string; // Timestamp in Unix format
  transactionHash: string; // Transaction hash
};

export type Activity = {
  event: "Sell" | "Buy" | "Bid";
  userWalletAddress: string;
  date: string;
  txHash: string;
};

export type SecondarySharesBoughtEvent = {
  _buyer: string;
  _propertyId: string;
  // _sharesBought: string;
  blockTimestamp: string; // Timestamp in Unix format
  transactionHash: string; // Transaction hash
};

export type SecondarySharesCanceledEvent = {
  _seller: string;
  _propertyId: number;
  blockTimestamp: string;
};

export type PropertyAllSecondaryEvents = {
  listedEvents: SecondarySharesListedEvent[];
  boughtEvents: SecondarySharesBoughtEvent[];
};
export type PrimarySaleStatusEvent = {
  _propertyId: string;
  _status: number;
};
export type SecondarySaleStatusEvent = {
  _listingId: string;
  _status: number;
};
export type UserSecondaryListings = {
  _propertyId: string;
  _listingId: string;
  _status: number;
};
export type AuctionCreated = {
  id: string;
  _seller: string;
  _auctionId: string;
  _propertyId: string;
  _endTime: string;
  _noOfShares: string;
  _startTime: string;
  blockTimestamp: string;
  transactionHash: string;
};

export type AuctionConcluded = {
  _auctionId: string;
};

export type AuctionState =
  | "not_started"
  | "on_going"
  | "cancelled"
  | "ended"
  | "concluded";

export function getAuctionState(code: number): AuctionState {

  const states: AuctionState[] = [
    "not_started",
    "on_going",
    "cancelled",
    "ended",
    "concluded",
  ];

  if (!Number.isInteger(code) || code < 0 || code >= states.length) {
    throw new Error(`Invalid AuctionState code: ${code}`);
  }

  return states[code];
}

export type AuctionDetail = {
  propertyId: number;
  noOfShares: number;
  basePrice: number;
  startTime: number;
  endTime: number;
  highestBid: number;
  highestBidder: string;
  seller: string;
  status: AuctionState;
  isSeller: boolean;
  isHighestBidder: boolean;
};


export interface VotingRequirement {
  id: string;
  text: string;
  completed?: boolean;
}

export interface VoteResults {
  yes: number;
  no: number;
  total: number;
}

export interface Creator {
  id: string;
  name: string;
  avatar?: string;
}

export interface VotingProposal {
  id: string;
  title: string;
  description: string;
  location?: string;
  image: string;
  creator: Creator;
  endTime: string; // ISO date string
  requirements: VotingRequirement[];
  voteResults?: VoteResults;
  userVote?: "yes" | "no" | null;
  status: "active" | "completed" | "expired";
}
