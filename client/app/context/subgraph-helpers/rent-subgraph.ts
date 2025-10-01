import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import axios from "axios";
import { getRentContract } from "../helper-rent";
import { getRwaContract } from "../helper-rwa";
import { getCustomEthFrom, getEthFrom } from "../helper";
import {
  ClaimableRentsType,
  RentStatusEvent,
  RentWithdrawnEventFormatted,
  RentWithdrawnEventRaw,
} from "../types";

export async function _getClaimableRents(
  userAddress: string,
  propertyIds: {
    id: string;
    sharesOwned: number;
  }[]
): Promise<ClaimableRentsType[]> {
  try {
    const batchSize = 100;
    let skip = 0;
    let hasMore = true;
    let allEvents: RentStatusEvent[] = [];

    const formattedIds = propertyIds.map((prop) => `"${prop.id}"`).join(", ");

    while (hasMore) {
      const query = `
        query GetRentStatusEvents {
          rentStatuses(
            first: ${batchSize}, 
            skip: ${skip}, 
            where: { _propertyId_in: [${formattedIds}] },
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _propertyId
            _monthRent
            _status
            blockTimestamp
          }
        }
      `;

      try {
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.rent_url,
          { query }
        );

        const currentBatch: RentStatusEvent[] =
          response?.data?.data?.rentStatuses || [];

        allEvents.push(...currentBatch);

        if (currentBatch.length < batchSize) {
          hasMore = false;
        } else {
          skip += batchSize;
        }
      } catch (error) {
        console.log("❌ Subgraph fetch error:", error);
        break;
      }
    }

    // Deduplicate by _propertyId, keeping the latest one
    const seen = new Set<string>();
    const uniqueEvents: RentStatusEvent[] = [];

    for (const event of allEvents) {
      if (!seen.has(event._propertyId)) {
        seen.add(event._propertyId);
        const startTime = Number(event.blockTimestamp);
        const endTime = startTime + BITSTAKE_CONFIG.rentDuration;
        uniqueEvents.push({ ...event, startTime, endTime });
      }
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const filtered = uniqueEvents.filter(
      (event) =>
        Number(event._status) === 0 && event.endTime >= currentTimestamp
    );

    const rentContract = getRentContract();
    const rwaContract = getRwaContract();

    const resolved = await Promise.all(
      filtered.map(async (event) => {
        try {
          const rentDetails = await rentContract.getRentDetails(
            event._propertyId
          );
          console.log("🚀 ~ filtered.map ~ rentDetails:", rentDetails);
          const rentRemaining = Number(rentDetails._rentRemaining);
          if (rentRemaining === 0) {
            console.log(`Property ${event._propertyId} rent reset`);
            return null;
          }

          const lastClaimTime = Number(
            await rentContract.getRentHistory(userAddress, event._propertyId)
          );
          if (lastClaimTime > event.startTime) {
            console.log(`Property ${event._propertyId} rent withdrawn`);
            return null;
          }
          const holdingTime = Number(
            await rwaContract.getHoldingHistory(userAddress, event._propertyId)
          );

          if (holdingTime > event.startTime) {
            console.log(`Property ${event._propertyId} rent unavailable`);
            return null;
          }

          const userShares =
            propertyIds.find((prop) => prop.id === event._propertyId)
              ?.sharesOwned || 0;

          return {
            userShares,
            propertyId: event._propertyId,
            startTime: event.startTime,
            endTime: event.endTime,
            totalRent: parseFloat(getCustomEthFrom(rentDetails._totalRent,BITSTAKE_CONFIG.usdcDecimals)),
            rentRemaining: parseFloat(getCustomEthFrom(rentDetails._rentRemaining,BITSTAKE_CONFIG.usdcDecimals)),
            rentPerShare: parseFloat(getCustomEthFrom(rentDetails._rentPerShare,BITSTAKE_CONFIG.usdcDecimals)),
          };
        } catch (err) {
          console.log("❌ Rent resolution error:", err);
          return null;
        }
      })
    );

    return resolved.filter((item): item is ClaimableRentsType => item !== null);
  } catch (error) {
    console.log("🚀 ~ _getClaimableRents outer error:", error);
    return [];
  }
}

export const fetchRentWithdrawnEvents = async (address: string) => {
  const batchSize = 100;
  let allEvent: any = [];
  let hasMore = true;
  let skip = 0;

  while (hasMore) {
    // GraphQL query for fetching RentWithdrawn events in batches
    const queryQl = ` 
          {
            rentWithdrawns(first: ${batchSize}, skip: ${skip}, orderBy: blockTimestamp, orderDirection: desc,  where: { _by: "${address}" }) {
              _by
              _propertyId
              _rent
              blockTimestamp
            }
          }
        `;

    try {
      // Execute the query with axios
      const response = await axios.post(BITSTAKE_CONFIG.subgraphUrls.rent_url, {
        query: queryQl,
      });

      const eventsBatch = response.data?.data?.rentWithdrawns;

      if (!eventsBatch || eventsBatch.length === 0) {
        hasMore = false;
      } else {
        // Append events to the main array
        allEvent = [...allEvent, ...eventsBatch];

        // Update skip for the next batch
        skip += batchSize;

        // Check if the batch size is smaller than requested
        if (eventsBatch.length < batchSize) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.log("Error fetching RentWithdrawn events:", error);
      hasMore = false; // Stop fetching on error
    }
  }

  const formattedEvents: RentWithdrawnEventFormatted[] = (
    allEvent as RentWithdrawnEventRaw[]
  ).map((event, index) => {
    return {
      id: index + 1,
      propertyId: Number(event._propertyId),
      date: Number(event.blockTimestamp), // Keep timestamp in seconds
      payout: Number(getCustomEthFrom(event._rent,BITSTAKE_CONFIG.usdcDecimals)), // Convert rent from wei to ETH
    };
  });

  // Return events sorted by blockTimestamp (descending order)
  return formattedEvents;
};
