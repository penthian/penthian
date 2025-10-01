import axios from "axios";
import {
  _getPendingSharesDetails,
  _getPrimarySale,
  _getPrimarySaleState,
} from "../helper-market";
import { _getPropertyDetails } from "../helper-rwa";
import {
  Activity,
  AuctionConcluded,
  AuctionCreated,
  FormRequestEvent,
  FormRequestEventStatus,
  FormRequestEventStatusText,
  GetFormRequestEventStatusText,
  GetPendingSharesDetailsOutput,
  NftMetadata,
  PrimarySaleStatusEvent,
  Property,
  PropertyAllSecondaryEvents,
  SecondaryListingsEvent,
  SecondarySaleStatusEvent,
  SecondarySharesBoughtEvent,
  SecondarySharesCanceledEvent,
  SecondarySharesListedEvent,
  UserPrimarySharesBoughtEvent,
  UserSecondaryListings,
} from "../types";
import { BITSTAKE_CONFIG, ENVIRONMENT } from "@/app/utils/constants";
import moment from "moment";
import { fetchNftMetadata } from "../helper";
import { getDeListedAndRefundedPropertyIds } from "./common";

export interface PlacedBidEvent {
  _bidder: string;
  _auctionId: string;
  _bid: string;
  transactionHash: string;
  blockTimestamp: string;
}

export type AdminSecondarySalesEventRaw = {
  _investment: string;
  _marketFees: string;
};
export type AdminSecondarySalesEvent = {
  investment: number;
  marketFees: number;
};

export type PrimarySharesBoughtEvent = {
  _buyer: string;
  _agent: string;
  _propertyId: string;
  _sharesBought: string;
  _investment: string;
  _marketFees: string;
  _commissionFees: string;
  blockTimestamp: string;
};

export type AgentPrimarySharesBought = {
  agent: string;
  buyer: string;
  propertyId: number;
  sharesBought: number;
  blockTimestamp: number;
  investment: number;
  marketFees: number;
  commissionFees: number;
};

export const getAgentsSalesData = async (
  agentAddress?: string
): Promise<PrimarySharesBoughtEvent[]> => {
  if (ENVIRONMENT === "local") {
    return [];
  }

  const _agentAddress = agentAddress?.toLowerCase();
  const invalidPropertyIds: string[] = (
    await getDeListedAndRefundedPropertyIds()
  ).map(String);
  // const invalidPropertyIds: string[] = []; // assume these will be populated if needed

  // console.log("🚀 ~ invalidPropertyIds:", invalidPropertyIds);
  // console.log("🚀 ~ _agentAddress:", _agentAddress);

  try {
    const batchSize = 100;
    let allEvents: PrimarySharesBoughtEvent[] = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      // Dynamically construct `where` clause string
      const whereClause = `
        where: {
          ${_agentAddress ? "_agent: $agent," : ""}
          ${
            invalidPropertyIds.length > 0
              ? "_propertyId_not_in: $excludedIds,"
              : ""
          }
        }
      `;

      const query = `
        query GetPrimarySharesBoughtEvents(
          $first: Int!, 
          $skip: Int!, 
            ${_agentAddress ? "$agent: String," : ""}
            ${invalidPropertyIds.length > 0 ? "$excludedIds: [String!]," : ""}
        ) {
          primarySharesBoughts(
            ${whereClause}
            first: $first,
            skip: $skip,
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _buyer
            _agent
            _propertyId
            _sharesBought
            _investment
            _marketFees
            _commissionFees
            blockTimestamp
          }
        }
      `;

      try {
        const variables: Record<string, any> = {
          first: batchSize,
          skip,
        };

        if (_agentAddress) variables.agent = _agentAddress;
        if (invalidPropertyIds.length > 0)
          variables.excludedIds = invalidPropertyIds;

        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query,
            variables,
          }
        );

        const newEvents: PrimarySharesBoughtEvent[] =
          response.data?.data?.primarySharesBoughts ?? [];

        // console.log("🚀 ~ PrimarySharesBought newEvents:", newEvents);

        if (newEvents.length === 0) {
          hasMore = false;
        } else {
          allEvents = [...allEvents, ...newEvents];
          if (newEvents.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
          }
        }
      } catch (error) {
        console.log("Error fetching PrimarySharesBought events:", error);
        hasMore = false;
      }
    }

    console.log("🚀 ~ getAgentsSalesData allEvents:", allEvents);
    return allEvents;
  } catch (err) {
    console.log("Unexpected error in getAgentsSalesData:", err);
    return [];
  }
};

export const getSecondarySalesData = async (): Promise<
  AdminSecondarySalesEventRaw[]
> => {
  if (ENVIRONMENT === "local") {
    return [];
  }

  const invalidPropertyIds: string[] = (
    await getDeListedAndRefundedPropertyIds()
  ).map(String);

  try {
    const batchSize = 100;
    let allEvents: AdminSecondarySalesEventRaw[] = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      // Dynamically construct `where` clause string
      const whereClause = `
        where: {
          ${
            invalidPropertyIds.length > 0
              ? "_propertyId_not_in: $excludedIds,"
              : ""
          }
        }
      `;

      const query = `
        query GetSecondarySharesBoughtEvents(
          $first: Int!, 
          $skip: Int!, 
          ${invalidPropertyIds.length > 0 ? "$excludedIds: [String!]," : ""}
        ) {
          secondarySharesBoughts(
            ${whereClause}
            first: $first,
            skip: $skip,
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _investment
            _marketFees
          }
        }
      `;

      try {
        const variables: Record<string, any> = {
          first: batchSize,
          skip,
        };

        if (invalidPropertyIds.length > 0)
          variables.excludedIds = invalidPropertyIds;

        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query,
            variables,
          }
        );

        const newEvents: AdminSecondarySalesEventRaw[] =
          response.data?.data?.secondarySharesBoughts ?? [];

        if (newEvents.length === 0) {
          hasMore = false;
        } else {
          allEvents = [...allEvents, ...newEvents];
          if (newEvents.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
          }
        }
      } catch (error) {
        console.log("Error fetching SecondarySharesBought events:", error);
        hasMore = false;
      }
    }

    console.log("🚀 ~ getSecondarySalesData allEvents:", allEvents);
    return allEvents;
  } catch (err) {
    console.log("Unexpected error in getSecondarySalesData:", err);
    return [];
  }
};

export const getUserClaimableShares = async (
  userAddress: string
): Promise<Property[]> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: Property[] = [];
    let hasMore = true;
    let skip = 0;

    // Fetch events in batches of 100 until no more events are available
    while (hasMore) {
      // Define the GraphQL query to fetch property IDs in batches
      const queryQl = `
        query MyQuery($userAddress: String!, $skip: Int!) {
          primarySharesBoughts(where: { _buyer: $userAddress }, first: ${batchSize}, skip: $skip) {
            _propertyId
          }
        }
      `;

      // Make the POST request to fetch the events
      const response = await axios.post(
        BITSTAKE_CONFIG.subgraphUrls.market_url,
        {
          query: queryQl,
          variables: {
            userAddress: userAddress.toLowerCase(),
            skip,
          },
        }
      );

      // Extract the events from the response
      const newEvents = response.data?.data?.primarySharesBoughts ?? [];
      console.log("🚀 ~ newEvents:", newEvents);

      // If no more events are returned, exit the loop
      if (!newEvents || newEvents.length === 0) {
        hasMore = false;
      } else {
        // Process unique property IDs from new events
        const uniqueIdsSet = new Set<number>(
          newEvents.map((item: { _propertyId: string }) =>
            Number(item._propertyId)
          )
        );

        // Fetch claimable shares for each unique property
        const data: (Property | null)[] = await Promise.all(
          Array.from(uniqueIdsSet).map(async (propertyId) => {
            const pendingDetails: GetPendingSharesDetailsOutput =
              await _getPendingSharesDetails({
                buyerAddress: userAddress,
                propertyId,
              });

            if (pendingDetails.shares > 0) {
              const propertyDetails = await _getPropertyDetails({
                propertyId,
              });
              const state = await _getPrimarySaleState({
                propertyId,
              });
              const saleDetails = await _getPrimarySale({ propertyId });

              const metadata: NftMetadata | null =
                propertyDetails !== null
                  ? await fetchNftMetadata(propertyDetails.uri)
                  : null;
              console.log("🚀 ~ Array.from ~ metadata:", {
                metadata,
                propertyDetails,
              });

              const propertyData: Property = {
                propertyId,
                propertyName: metadata?.name ?? "Name Not Found",
                fractionsBought: pendingDetails.shares,
                usdcSpent: pendingDetails.usdcSpent,
                ethSpent: pendingDetails.ethSpent,
                timeLeft: saleDetails.endTime,
                status: state,
              };

              return propertyData;
            }
            return null;
          })
        );

        // Filter out null values and append new data to allEvents
        allEvents = [
          ...allEvents,
          ...data.filter((p): p is Property => p !== null),
        ];

        // If less than batchSize events were returned, we are done
        if (newEvents.length < batchSize) {
          hasMore = false;
        }

        // Increase skip for the next batch
        skip += batchSize;
      }
    }

    return allEvents;
  } catch (error) {
    console.log("🚀 ~ getUserClaimableShares ~ error:", error);
    return [];
  }
};

export const _getAllSecondaryEvents = async (): Promise<
  SecondaryListingsEvent[]
> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: SecondaryListingsEvent[] = [];
    let hasMore = true;
    let skip = 0;

    // Sets to track unique sellers and property IDs
    const seenCombinations = new Set();

    while (hasMore) {
      const queryQl = `
        query GetRequestStatuses($skip: Int!) {
          secondarySharesListeds(
            first: ${batchSize},
            skip: ${skip},
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _seller
            _propertyId
          }
        }
      `;

      try {
        // Make the POST request using axios
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryQl,
            variables: {
              skip,
            },
          }
        );

        // Extract the data from the response
        const _100NewEvents: SecondaryListingsEvent[] =
          response.data?.data?.secondarySharesListeds;

        // If no more events are returned, exit the loop
        if (!_100NewEvents || _100NewEvents.length === 0) {
          hasMore = false;
        } else {
          // console.log("🚀 ~ _100NewEvents:", _100NewEvents);
          // Filter only unique sellers and property IDs

          _100NewEvents.forEach((event) => {
            const uniqueKey = `${event._seller}-${event._propertyId}`;

            if (!seenCombinations.has(uniqueKey)) {
              seenCombinations.add(uniqueKey);
              allEvents.push(event);
            }
          });

          // If we got less than batchSize, it means we reached the last batch
          if (_100NewEvents.length < batchSize) {
            hasMore = false;
          }

          // Increase skip value for the next batch
          skip += batchSize;
        }
      } catch (error) {
        // Handle errors
        console.log("Error fetching request statuses:", error);
        hasMore = false; // Stop fetching on error
      }
    }

    return allEvents; // Return the filtered array with unique sellers and property IDs
  } catch (error) {
    console.log("🚀  ~ error:", error);
    return [];
  }
};
//   _propertyId: number
// ): Promise<PropertyAllSecondaryEvents> => {
//   try {
//     const batchSize = 100;
//     let listedEvents: SecondarySharesListedEvent[] = [];
//     let boughtEvents: SecondarySharesBoughtEvent[] = [];

//     let hasMoreListed = true;
//     let hasMoreBought = true;

//     let skipListed = 0;
//     let skipBought = 0;

//     // Function to fetch SecondarySharesListed events
//     while (hasMoreListed) {
//       const queryListed = `
//        query GetListedEvents($skip: Int!, $propertyId: Int!) {
//   secondarySharesListeds(
//     first: ${batchSize},
//     skip: $skip,
//     where: { _propertyId: $propertyId },
//     orderBy: blockTimestamp,
//     orderDirection: desc
//   ) {
//     _seller
//     _propertyId
//     _sharesListed
//     blockTimestamp
//     transactionHash
//   }
// }`;
//       try {
//         const responseListed = await axios.post(BITSTAKE_CONFIG, {
//           query: queryListed,
//           variables: { skip: skipListed, propertyId: _propertyId },
//         });
//         const newListedEvents: SecondarySharesListedEvent[] =
//           responseListed.data?.data?.secondarySharesListeds || [];

//         if (newListedEvents.length === 0) {
//           hasMoreListed = false;
//         } else {
//           listedEvents = [...listedEvents, ...newListedEvents];
//           if (newListedEvents.length < batchSize) {
//             hasMoreListed = false;
//           }
//           skipListed += batchSize;
//         }
//       } catch (error) {
//         console.log("Error fetching listed events:", error);
//         hasMoreListed = false;
//       }
//     }

//     // Function to fetch SecondarySharesBought events
//     while (hasMoreBought) {
//       const queryBought = `
//         query GetBoughtEvents($skip: Int!, $propertyId: Int!) {
//   secondarySharesBoughts(
//     first: ${batchSize},
//     skip: $skip,
//     where: { _propertyId: $propertyId },
//     orderBy: blockTimestamp,
//     orderDirection: desc
//   ) {
//     _buyer
//     _propertyId
//     _sharesBought
//     blockTimestamp
//     transactionHash
//   }
// }`;
//       try {
//         const responseBought = await axios.post(BITSTAKE_CONFIG, {
//           query: queryBought,
//           variables: { skip: skipBought, propertyId: _propertyId },
//         });
//         const newBoughtEvents: SecondarySharesBoughtEvent[] =
//           responseBought.data?.data?.secondarySharesBoughts || [];

//         if (newBoughtEvents.length === 0) {
//           hasMoreBought = false;
//         } else {
//           boughtEvents = [...boughtEvents, ...newBoughtEvents];
//           if (newBoughtEvents.length < batchSize) {
//             hasMoreBought = false;
//           }
//           skipBought += batchSize;
//         }
//       } catch (error) {
//         console.log("Error fetching bought events:", error);
//         hasMoreBought = false;
//       }
//     }

//     return {
//       listedEvents,
//       boughtEvents,
//     };
//   } catch (error) {
//     console.log("Error in _getAllSecondaryEventsById:", error);
//     return {
//       listedEvents: [],
//       boughtEvents: [],
//     };
//   }
// };

export const _getAllSecondaryEventsById = async (
  _propertyId: number
): Promise<Activity[]> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100;
    let listedEvents: SecondarySharesListedEvent[] = [];
    let boughtEvents: SecondarySharesBoughtEvent[] = [];

    let hasMoreListed = true;
    let hasMoreBought = true;

    let skipListed = 0;
    let skipBought = 0;

    // Fetch SecondarySharesListed events
    while (hasMoreListed) {
      const queryListed = `
        query GetListedEvents($skip: Int!, $propertyId: Int!) {
          secondarySaleStatuses(
            first: ${batchSize},
            skip: $skip,
            where: { _propertyId: $propertyId, _status: 0 },
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _seller
            _propertyId
            _status
            blockTimestamp
            transactionHash
          }
        }
      `;
      try {
        const responseListed = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryListed,
            variables: { skip: skipListed, propertyId: _propertyId },
          }
        );
        const newListedEvents: SecondarySharesListedEvent[] =
          responseListed.data?.data?.secondarySaleStatuses || [];

        if (newListedEvents.length === 0) {
          hasMoreListed = false;
        } else {
          listedEvents = [...listedEvents, ...newListedEvents];
          if (newListedEvents.length < batchSize) {
            hasMoreListed = false;
          }
          skipListed += batchSize;
        }
      } catch (error) {
        console.log("Error fetching listed events:", error);
        hasMoreListed = false;
      }
    }

    // Fetch SecondarySharesBought events
    while (hasMoreBought) {
      const queryBought = `
        query GetBoughtEvents($skip: Int!, $propertyId: Int!) {
          secondarySharesBoughts(
            first: ${batchSize},
            skip: $skip,
            where: { _propertyId: $propertyId },
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _buyer
            _propertyId
            _sharesBought
            blockTimestamp
            transactionHash
          }
        }
      `;
      try {
        const responseBought = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryBought,
            variables: { skip: skipBought, propertyId: _propertyId },
          }
        );
        const newBoughtEvents: SecondarySharesBoughtEvent[] =
          responseBought.data?.data?.secondarySharesBoughts || [];

        if (newBoughtEvents.length === 0) {
          hasMoreBought = false;
        } else {
          boughtEvents = [...boughtEvents, ...newBoughtEvents];
          if (newBoughtEvents.length < batchSize) {
            hasMoreBought = false;
          }
          skipBought += batchSize;
        }
      } catch (error) {
        console.log("Error fetching bought events:", error);
        hasMoreBought = false;
      }
    }

    // Transform to Activity array
    return transformToActivity(listedEvents, boughtEvents);
  } catch (error) {
    console.log("Error in _getAllSecondaryEventsById:", error);
    return [];
  }
};

// Convert block timestamp to human-readable relative time (e.g., "12 days ago")
const convertToRelativeTime = (unixTimeInSeconds: string) => {
  const timestampInMilliseconds = parseInt(unixTimeInSeconds) * 1000;
  return moment(timestampInMilliseconds).fromNow(); // Use moment.js to get "X days ago"
};

const transformToActivity = (
  listedEvents: SecondarySharesListedEvent[],
  boughtEvents: SecondarySharesBoughtEvent[]
): Activity[] => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  const activities: Activity[] = [];

  // Map listed events to "Sell" activities
  listedEvents.forEach((event) => {
    activities.push({
      event: "Sell",
      userWalletAddress: event._seller,
      // shares: `${event._sharesListed} Shares`, // Adjust this format as needed
      date: event.blockTimestamp, // Keep blockTimestamp for sorting
      txHash: event.transactionHash,
    });
  });

  // Map bought events to "Buy" activities
  boughtEvents.forEach((event) => {
    activities.push({
      event: "Buy",
      userWalletAddress: event._buyer,
      // shares: `${event._sharesBought} Shares`, // Adjust this format as needed
      date: event.blockTimestamp, // Keep blockTimestamp for sorting
      txHash: event.transactionHash,
    });
  });

  activities.sort((a, b) => {
    return parseInt(b.date) - parseInt(a.date); // Sort descending by date
  });

  // Convert date to relative time after sorting
  activities.forEach((activity) => {
    activity.date = convertToRelativeTime(activity.date);
  });

  return activities;
};

export const getAllOnGoingPrimaryListing = async (): Promise<
  PrimarySaleStatusEvent[]
> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: PrimarySaleStatusEvent[] = [];
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      const queryQl = `
        query GetRequestStatuses( $skip: Int!) {
          primarySaleStatuses(
            first: ${batchSize},
            skip: ${skip},
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {

            _status
            _propertyId
          }
        }
      `;

      try {
        // Make the POST request using axios
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryQl,
            variables: {
              skip,
            },
          }
        );

        // Extract the data from the response
        const _100NewEvents: PrimarySaleStatusEvent[] =
          response.data?.data?.primarySaleStatuses;

        // If no more events are returned, exit the loop
        if (!_100NewEvents || _100NewEvents.length === 0) {
          hasMore = false;
        } else {
          if (_100NewEvents.length < batchSize) {
            hasMore = false; // Less than batchSize means this was the last batch
          }
          allEvents = [..._100NewEvents, ...allEvents];

          // Increase skip value for the next batch
          skip += batchSize;
        }
      } catch (error) {
        // Handle errors
        console.log("Error fetching request statuses:", error);
        hasMore = false; // Stop fetching on error
      }
    }

    // Map to keep track of statuses associated with each _propertyId
    const requestIdStatusMap: { [key: string]: Set<number> } = {};

    // Build the map
    for (const item of allEvents) {
      const propertyId = item._propertyId;
      const status = item._status;

      if (!requestIdStatusMap[propertyId]) {
        requestIdStatusMap[propertyId] = new Set();
      }
      requestIdStatusMap[propertyId].add(status);
    }

    // Filter _propertyId that have only _status 1
    const validRequestIds = Object.keys(requestIdStatusMap).filter(
      (requestId) => {
        const statuses = requestIdStatusMap[requestId];
        return statuses.size === 1 && statuses.has(1);
      }
    );

    // Collect the objects with _status 1 for the valid _propertyId
    const result = allEvents.filter(
      (item) => validRequestIds.includes(item._propertyId) && item._status === 1
    );

    return result;
  } catch (error) {
    console.log("🚀 ~ getUserRequestedForms ~ error:", error);
    return [];
  }
};

export const getAllOnGoingSecondaryListing = async (): Promise<
  SecondarySaleStatusEvent[]
> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: SecondarySaleStatusEvent[] = [];
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      const queryQl = `
        query GetRequestStatuses( $skip: Int!) {
          secondarySaleStatuses(
            first: ${batchSize},
            where: { _status: 0 },
            skip: ${skip},
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _status
            _listingId
          }
        }
      `;

      try {
        // Make the POST request using axios
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryQl,
            variables: {
              skip,
            },
          }
        );

        // Extract the data from the response
        const _100NewEvents: SecondarySaleStatusEvent[] =
          response.data?.data?.secondarySaleStatuses;

        // If no more events are returned, exit the loop
        if (!_100NewEvents || _100NewEvents.length === 0) {
          hasMore = false;
        } else {
          if (_100NewEvents.length < batchSize) {
            hasMore = false; // Less than batchSize means this was the last batch
          }
          allEvents = [..._100NewEvents, ...allEvents];

          // Increase skip value for the next batch
          skip += batchSize;
        }
      } catch (error) {
        // Handle errors
        console.log("Error fetching request statuses:", error);
        hasMore = false; // Stop fetching on error
      }
    }
    console.log(allEvents);

    // Assuming 'allEvents' has been filled with data from the function
    const uniqueEventsMap = new Map<string, SecondarySaleStatusEvent>();

    // Loop through all events and populate the map with the first occurrence
    for (const event of allEvents) {
      if (!uniqueEventsMap.has(event._listingId)) {
        uniqueEventsMap.set(event._listingId, event);
      }
    }

    // Convert the map to an array and filter out events with _status = 0
    const filteredEvents = Array.from(uniqueEventsMap.values());
    return filteredEvents;
  } catch (error) {
    console.log("🚀 ~ getUserRequestedForms ~ error:", error);
    return [];
  }
};

export const getUserSecondaryListings = async (
  userAddress: string
): Promise<UserSecondaryListings[]> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: UserSecondaryListings[] = [];
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      const queryQl = `
        query GetRequestStatuses($userAddress: String!, $skip: Int!) {
          secondarySaleStatuses(
            where: { _seller: $userAddress , _status: 0 },
            first: ${batchSize},
            skip: ${skip},
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _status
            _listingId
            _propertyId
          }
        }
      `;

      try {
        // Make the POST request using axios
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryQl,
            variables: {
              userAddress: userAddress.toLowerCase(),
              skip,
            },
          }
        );

        // Extract the data from the response
        const _100NewEvents: UserSecondaryListings[] =
          response.data?.data?.secondarySaleStatuses;

        // If no more events are returned, exit the loop
        if (!_100NewEvents || _100NewEvents.length === 0) {
          hasMore = false;
        } else {
          if (_100NewEvents.length < batchSize) {
            hasMore = false; // Less than batchSize means this was the last batch
          }
          allEvents = [..._100NewEvents, ...allEvents];

          // Increase skip value for the next batch
          skip += batchSize;
        }
      } catch (error) {
        // Handle errors
        console.log("Error fetching request statuses:", error);
        hasMore = false; // Stop fetching on error
      }
    }

    // Assuming 'allEvents' has been filled with data from the function
    const uniqueEventsMap = new Map<string, UserSecondaryListings>();

    // Loop through all events and populate the map with the first occurrence
    for (const event of allEvents) {
      if (!uniqueEventsMap.has(event._listingId)) {
        uniqueEventsMap.set(event._listingId, event);
      }
    }
    console.log("🚀 ~ uniqueEventsMap:", {allEvents,uniqueEventsMap});

    // Convert the map to an array and filter out events with _status = 0
    const filteredEvents = Array.from(uniqueEventsMap.values());
    console.log(
      "🚀 ~ getUserSecondaryListings filteredEvents:",
      filteredEvents
    );
    return filteredEvents;
  } catch (error) {
    console.log("🚀 ~ getUserRequestedForms ~ error:", error);
    return [];
  }
};

const getAllAuctionConcluded = async (): Promise<Set<string>> => {
  const concludedIds = new Set<string>();
  let hasMore = true;
  let skip = 0;

  while (hasMore) {
    const query = `
      {
        auctionConcludeds(first: 100, skip: ${skip}) {
          _auctionId
        }
      }
    `;

    try {
      const response = await axios.post(
        BITSTAKE_CONFIG.subgraphUrls.market_url,
        { query }
      );
      const items: AuctionConcluded[] = response.data.data.auctionConcludeds;

      if (items.length === 0) {
        hasMore = false;
      } else {
        items.forEach((item) => concludedIds.add(item._auctionId));
        skip += 100;
      }
    } catch (err) {
      console.log("Failed to fetch auctionConcludeds", err);
      break;
    }
  }

  return concludedIds;
};

export const getAuctions = async (): Promise<AuctionCreated[]> => {
  const concludedIds = await getAllAuctionConcluded();

  const activeAuctions: AuctionCreated[] = [];
  let hasMore = true;
  let skip = 0;

  while (hasMore) {
    const idsArray = Array.from(concludedIds);
    // GraphQL usually limits "not_in" to 1000 values, slice if needed
    const idChunks = idsArray.slice(0, 1000);

    const notClause = idChunks.length
      ? `where: { _auctionId_not_in: [${idChunks
          .map((id) => `"${id}"`)
          .join(",")}] }`
      : "";

    const query = `
      {
        auctionCreateds(first: 100, skip: ${skip}, ${notClause}) {
          id
          _seller
          _auctionId
          _propertyId
          _endTime
          _noOfShares
          _startTime
          blockTimestamp
          transactionHash
        }
      }
    `;

    try {
      const response = await axios.post(
        BITSTAKE_CONFIG.subgraphUrls.market_url,
        { query }
      );
      const items: AuctionCreated[] = response.data.data.auctionCreateds;

      if (items.length === 0) {
        hasMore = false;
      } else {
        activeAuctions.push(...items);
        skip += 100;
      }
    } catch (err) {
      console.log("Failed to fetch auctionCreateds", err);
      break;
    }
  }

  // Sort by blockTimestamp DESC
  return activeAuctions.sort(
    (a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp)
  );
};

export const getAllBidsInAuction = async (
  auctionId: number
): Promise<PlacedBidEvent[]> => {
  const bids: PlacedBidEvent[] = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const query = `
      {
        placedBids(
          first: 100,
          skip: ${skip},
          where: { _auctionId: "${auctionId}" }
        ) {
          _bidder
          _auctionId
          _bid
          transactionHash
          blockTimestamp
        }
      }
    `;
    const res = await axios.post(BITSTAKE_CONFIG.subgraphUrls.market_url, {
      query,
    });
    const items: PlacedBidEvent[] = res.data.data.placedBids;
    if (items.length === 0) hasMore = false;
    else {
      bids.push(...items);
      skip += 100;
    }
  }

  return bids;
};
