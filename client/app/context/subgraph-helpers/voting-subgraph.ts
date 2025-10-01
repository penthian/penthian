import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import axios from "axios";
import { ProposalDataType, VotedEvent } from "../types";
import { _getProposalData } from "../helper-voting";

export async function getUserVotedEvents(
  voter: string,
  _proposalId: number
): Promise<VotedEvent> {
  const query = `
    query GetVotedEvents($by: String!, $proposalId: String!) {
      voteds(where: { _by: $by, _proposalId: $proposalId }) {
        id
        _by
        _proposalId
        _inFavor
      }
    }
  `;

  const variables = {
    by: voter.toLowerCase(),
    proposalId: _proposalId.toString(),
  };

  try {
    const response = await axios.post(BITSTAKE_CONFIG.subgraphUrls.voting_url, {
      query,
      variables,
    });
    const events = response?.data?.data?.voteds || [];
    const votingEvent = events.length > 0 ? events[0] : null;
    return votingEvent;
  } catch (error) {
    throw error;
  }
}

export type ProposalStatusEvent = {
  _by: string;
  _proposalId: number;
  _endTime: number;
  blockTimestamp: number;
  _startTime: number;
  isEnded: boolean;
};

export type ProposalEventsType = {
  pastProposals: ProposalDataType[];
  activeProposals: ProposalDataType[];
};

export const getAllProposalStatusEvents = async (
): Promise<ProposalStatusEvent[]> => {
  try {
    const batchSize = 100;
    let allEvents: ProposalStatusEvent[] = [];
    let hasMore = true;
    let skip = 0;

    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current time in Unix timestamp

    while (hasMore) {

      const queryQl = ` 
        {
          proposalStatuses(first: ${batchSize}, skip: ${skip}, orderDirection: desc, orderBy: blockTimestamp) {
            _by
            _proposalId
            _endTime
            blockTimestamp
          }
        }
      `;

      try {
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.voting_url,
          { query: queryQl }
        );

        const eventsBatch = response.data?.data?.proposalStatuses || [];

        if (eventsBatch.length === 0) {
          hasMore = false;
        } else {
          eventsBatch.forEach((event: any) => {
            const normalizedEvent = {
              _by: event._by.toLowerCase(),
              _proposalId: Number(event._proposalId),
              _endTime: Number(event._endTime),
              blockTimestamp: Number(event.blockTimestamp),
              _startTime:
                Number(event._endTime) - BITSTAKE_CONFIG.votingDuration,
              isEnded: Number(event._endTime) < currentTimestamp,
            };
            if (normalizedEvent._endTime !== 0) {
              allEvents.push(normalizedEvent);
            }
          });

          skip += batchSize;

          if (eventsBatch.length < batchSize) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.log("Error fetching ProposalStatus events:", error);
        hasMore = false;
      }
    }

    return allEvents;
  } catch (error) {
    console.log("Error fetching all proposal status events:", error);
    return [];
  }
};


export const fetchProposalStatusEvents = async (
  proposedByAddress?: string
): Promise<ProposalEventsType> => {
  const allEvents = await getAllProposalStatusEvents();
  console.log("🚀 ~ fetchProposalStatusEvents ~ allEvents:", allEvents)
  // Now split into past and active proposals using async handling
  const activeProposals: ProposalDataType[] = [];
  const pastProposals: ProposalDataType[] = [];

  // Use Promise.all to handle asynchronous operations efficiently
  const promises = allEvents.map(async (event) => {
    const result = await _getProposalData(event, proposedByAddress);
    if (result) {
      if (event.isEnded) {
        pastProposals.push(result); // Add to past if endTime is less than current time
      } else {
        activeProposals.push(result); // Add to active if endTime is greater than current time
      }
    }
  });

  // Wait for all promises to resolve
  await Promise.all(promises);

  // Sort both arrays by proposalId in descending order
  activeProposals.sort((a, b) => b.proposalId - a.proposalId);
  pastProposals.sort((a, b) => b.proposalId - a.proposalId);

  // Return both arrays
  return {
    activeProposals,
    pastProposals,
  };
};
