import { ethers } from "ethers";
import {
  BITSTAKE_CONFIG,
  DEFAULT_IMAGES,
} from "@/app/utils/constants";
import {
  fetchNftMetadata,
  getCustomEthFrom,
  getCustomWeiFrom,
  getEthFrom,
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
import { _getPropertyDetails, getRwaContract } from "./helper-rwa";
import {
  NftMetadata,
  PropertyDetails,
  ProposalDataType,
  ProposalDetails,
  UserVotesStatusType,
} from "./types";
import {
  getUserVotedEvents,
  ProposalStatusEvent,
} from "./subgraph-helpers/voting-subgraph";

import { Interface } from "ethers/lib/utils";

const ifaceVotingABI = new Interface(BITSTAKE_CONFIG.votingABI);

export const getVotingErrorMessage = (_error: any): string => {
  console.log("❌ Raw voting error:", _error);

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
      const decoded = ifaceVotingABI.parseError(encodedError);
      return mapVotingCustomErrorName(decoded.name, decoded.args);
    } catch (decodeErr) {
      console.warn("⚠️ Unable to decode custom voting error:", decodeErr);
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
function mapVotingCustomErrorName(name: string, args: any): string {
  const map: Record<string, string> = {
    AlreadyVoted: "You have already voted on this proposal.",
    CantDeleteProposal: "You cannot delete this proposal.",
    InvalidFees: "Invalid fees specified.",
    ProposalHasEnded: "This proposal has already ended.",
    ProposalNotFound: "Proposal not found.",
    YouAreNotEligible: "You are not eligible to vote on this proposal.",
    YouCantVote: "You cannot vote on this proposal.",
    OwnableInvalidOwner: "Invalid owner address provided.",
    OwnableUnauthorizedAccount:
      "You are not authorized to perform this action.",
  };

  return map[name] || `Smart contract error: ${name}`;
}

export const getVotingContract = (
  signer = false,
  particleProvider?: EVMProvider
) => {
  const provider = new ethers.providers.JsonRpcProvider(BITSTAKE_CONFIG.rpcUrl);
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
      BITSTAKE_CONFIG.voting,
      BITSTAKE_CONFIG.votingABI,
      signer
    );
    return contract;
  }
  contract = new ethers.Contract(
    BITSTAKE_CONFIG.voting,
    BITSTAKE_CONFIG.votingABI,
    provider
  );
  return contract;
};

// ============================= WRITE FUNCTIONS ============================= //

export async function _createProposal(payload: {
  propertyId: number;
  description: string;
  connectedAddress: string;
  particleProvider: EVMProvider;
}) {
  try {
    const contract = getVotingContract(true, payload.particleProvider);

    const proposalFee = await _getProposalFees();
    console.log("🚀 ~ proposalFee:", proposalFee);
    if (proposalFee === null || proposalFee <= 0)
      throw new Error("Failed to fetch proposal fee");

    const balance = await getUserUsdcBalance({
      user: payload.connectedAddress,
    });
    console.log("🚀 ~ balance:", balance);
    if (proposalFee > balance)
      throw new Error(`Insufficient USDC balance, required ${proposalFee}`);

    const allowance = await getUsdcAllowance({
      owner: payload.connectedAddress,
      spenderType: "voting",
    });
    console.log("🚀 ~ allowance:", allowance);

    const hasEnoughAllowance = allowance >= proposalFee;
    console.log("🚀 ~ hasEnoughAllowance:", hasEnoughAllowance);
    if (!hasEnoughAllowance)
      await approveUsdcSpender({
        amount: String(proposalFee),
        particleProvider: payload.particleProvider,
        spenderType: "voting",
      });

    const encoded = await contract.encodeString(payload.description);
    console.log("🚀 ~ encoded:", encoded);
    await contract.callStatic.addProposal(payload.propertyId, encoded);
    const tx = await contract.addProposal(payload.propertyId, encoded);
    await tx.wait();
    return tx;
  } catch (error: any) {
    // console.log("🚀 ~ error:", error)
    // console.log("🚀 ~ error.message:", error.message)
    // console.log("🚀 ~ error.reason:", error.reason)
    throw new Error(getVotingErrorMessage(error));
  }
}

export async function _getUserVoteStatus(payload: {
  proposalId: number;
  propertyId: number;
  proposalStartTime: number;
  isEnded: boolean;
  isProposer: boolean;
  voterAddress?: string;
}): Promise<UserVotesStatusType> {
  try {
    if (!payload.voterAddress) {
      return {
        votedAs: "not_voted",
        canVote: false,
      };
    }
    if (payload.isProposer) {
      return {
        votedAs: "yes",
        canVote: false,
      };
    }

    if (payload.isEnded) {
      return {
        votedAs: "not_voted",
        canVote: false,
      };
    }

    const votingContract = getVotingContract();
    const rwaContract = getRwaContract();

    const hasVoted = (await votingContract.hasVoted(
      payload.voterAddress,
      payload.proposalId
    )) as boolean;

    console.log("🚀 ~ _getUserVoteStatus ~ hasVoted:", {
      proposalId: payload.proposalId,
      voterAddress: payload.voterAddress,
      hasVoted,
    });

    if (!hasVoted) {
      const data = await rwaContract.getHoldingHistory(
        payload.voterAddress,
        payload.propertyId
      );
      const holdingTime = Number(data);
      const canVote =
        holdingTime > 0 && payload.proposalStartTime > holdingTime;

      if (!canVote) {
        throw new Error("Not eligible to vote on this proposal");
      }

      return {
        votedAs: "not_voted",
        canVote,
      };
    }

    const votingHistory = await getUserVotedEvents(
      payload.voterAddress,
      payload.proposalId
    );

    return {
      votedAs: votingHistory._inFavor ? "yes" : "no",
      canVote: false,
    };
  } catch (error) {
    throw error;
  }
}

export async function _castVote(payload: {
  proposalId: number;
  inFavor: boolean;
  propertyId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const contract = getVotingContract(true, payload.particleProvider);

    await contract.callStatic.vote(payload.proposalId, payload.inFavor);
    const tx = await contract.vote(payload.proposalId, payload.inFavor);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getVotingErrorMessage(error));
  }
}

export async function _deleteActiveProposal(payload: {
  proposalId: number;
  particleProvider: EVMProvider;
}) {
  try {
    const contract = getVotingContract(true, payload.particleProvider);
    await contract.callStatic.deleteProposal(payload.proposalId);
    const tx = await contract.deleteProposal(payload.proposalId);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getVotingErrorMessage(error));
  }
}

export async function _changeProposalFee(payload: {
  newFee: string;
  particleProvider: EVMProvider;
}) {
  try {
    const contract = getVotingContract(true, payload.particleProvider);
    const feeInWei = getCustomWeiFrom(payload.newFee, BITSTAKE_CONFIG.usdcDecimals);
    await contract.callStatic.changeProposalFee(feeInWei);
    const tx = await contract.changeProposalFee(feeInWei);
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(getVotingErrorMessage(error));
  }
}

// ============================= READ FUNCTIONS ============================= //

export async function _getProposalDetails(
  proposalId: number
): Promise<ProposalDetails | null> {
  try {
    const contract = getVotingContract();
    const res = await contract.getProposal(proposalId);
    if (Number(res._status) === 0) {
      return null; // Proposal not found
    }

    return {
      propertyId: Number(res._propertyId),
      proposer: String(res._proposer).toLowerCase(),
      endTime: Number(res._endTime),
      startTime: Number(res._endTime) - BITSTAKE_CONFIG.votingDuration,
      votesInFavour: Number(res._votesInFavour),
      votesInAgainst: Number(res._votesInAgainst),
      description: String(await contract.decodeString(res._description)),
      status: getProposalState(Number(res._status)),
    };
  } catch (error) {
    console.log("🚀 ~ _getProposal ~ error:", error);
    return null;
  }
}

export async function _getProposalData(
  event: ProposalStatusEvent,
  voter?: string
): Promise<ProposalDataType | null> {
  try {
    const proposalData = await _getProposalDetails(event._proposalId);

    if (proposalData === null) return null;

    const _isProposer = voter
      ? voter.toLowerCase() === proposalData.proposer.toLowerCase()
      : false;

    const userVotesStatus: UserVotesStatusType = await _getUserVoteStatus({
      proposalId: event._proposalId,
      propertyId: proposalData.propertyId,
      proposalStartTime: event._startTime,
      voterAddress: voter,
      isEnded: event.isEnded,
      isProposer: _isProposer,
    });

    let propertyData: PropertyDetails | null = null;

    try {
      propertyData = await _getPropertyDetails({
        propertyId: proposalData.propertyId,
      });
    } catch (error) {
      console.log("🚀 ~ _getProposalData _getPropertyDetails ~ error:", error);
    }

    if (propertyData === null)
      return {
        proposalId: event._proposalId,
        proposalData: proposalData,
        userVotesStatus: userVotesStatus,
        propertyData: null,
        metadata: null,
      };

    let metadata: NftMetadata | null = null;
    try {
      metadata = await fetchNftMetadata(propertyData.uri);
    } catch (error) {
      console.log("🚀 ~ _getProposalData fetchNftMetadata ~ error:", error);
    }

    if (metadata === null) {
      return {
        proposalId: event._proposalId,
        proposalData: proposalData,
        propertyData: propertyData,
        userVotesStatus: userVotesStatus,
        metadata: null,
      };
    }

    return {
      proposalId: event._proposalId,
      proposalData,
      propertyData,
      userVotesStatus: userVotesStatus,
      metadata,
    };
  } catch (error) {
    return null;
  }
}

export async function _getVotingHistory(payload: {
  user: string;
  proposalId: number;
}): Promise<number | null> {
  try {
    const contract = getVotingContract();
    const timestamp = await contract.getVotingHistory(
      payload.user,
      payload.proposalId
    );
    return Number(timestamp);
  } catch (error) {
    console.log("🚀 ~ _getVotingHistory ~ error:", error);
    return null;
  }
}

export async function _hasVoted(payload: {
  user: string;
  proposalId: number;
}): Promise<boolean | null> {
  try {
    const contract = getVotingContract();
    return await contract.hasVoted(payload.user, payload.proposalId);
  } catch (error) {
    console.log("🚀 ~ _hasVoted ~ error:", error);
    return null;
  }
}

export async function _getProposalFees(): Promise<number | null> {
  try {
    const contract = getVotingContract();
    const fees = await contract.getProposalFees();
    return parseFloat(getCustomEthFrom(fees.toString(),BITSTAKE_CONFIG.usdcDecimals));
  } catch (error) {
    console.log("🚀 ~ _getProposalFees ~ error:", error);
    return null;
  }
}

export async function _getTotalProposals(): Promise<number | null> {
  try {
    const contract = getVotingContract();
    const total = await contract.totalProposals();
    return Number(total);
  } catch (error) {
    return null;
  }
}

export async function _getVotingOwner(): Promise<string | null> {
  try {
    const votingContract = getVotingContract();
    const owner = await votingContract.owner();
    return owner;
  } catch (error) {
    return null;
  }
}

export enum ProposalState {
  not_found = 0,
  on_going = 1,
  passed = 2,
  failed = 3,
}
export type ProposalStateKey = keyof typeof ProposalState;
export function getProposalState(state: number): ProposalStateKey {
  return ProposalState[state] as ProposalStateKey;
}
