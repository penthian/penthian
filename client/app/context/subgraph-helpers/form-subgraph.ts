import { BITSTAKE_CONFIG, ENVIRONMENT } from "@/app/utils/constants";
import {
  FormDetails,
  FormRequestEvent,
  FormRequestEventStatus,
  FormRequestEventStatusText,
  GetFormRequestEventStatusText,
  NftMetadata,
  PropertyRequest,
} from "../types";
import axios from "axios";
import { fetchNftMetadata } from "../helper";
import { _getRequestDetails } from "../helper-form";
import { dummyRequestedProperty } from "./dummyData";

export type FormRequestEventType = {
  _by: string;
  _requestId: string;
  _propertyId: string;
  _status: number;
};

export const getUserRequestedForms = async (
  userAddress: string
): Promise<PropertyRequest[]> => {
  try {
    if (ENVIRONMENT === "local") {
      return dummyRequestedProperty;
    }
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: FormRequestEventType[] = [];
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      const queryQl = `
        query GetRequestStatuses($userAddress: String!, $skip: Int!) {
          requestStatuses(
            where: { _by: $userAddress },
            first: ${batchSize},
            skip: ${skip},
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _by
            _requestId
            _status
            _propertyId
          }
        }
      `;

      try {
        // Make the POST request using axios
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.form_url,
          {
            query: queryQl,
            variables: {
              userAddress: userAddress.toLowerCase(),
              skip,
            },
          }
        );

        // Extract the data from the response
        const _100NewEvents: FormRequestEventType[] =
          response.data?.data?.requestStatuses;

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

    const seenRequestIds: Set<string> = new Set();
    const filteredForms: FormRequestEvent[] = [];

    allEvents.forEach((item) => {
      if (!seenRequestIds.has(item._requestId)) {
        seenRequestIds.add(item._requestId);
        filteredForms.push({
          _by: item._by,
          _requestId: item._requestId,
          _status: GetFormRequestEventStatusText[
            String(item._status) as FormRequestEventStatus
          ] as FormRequestEventStatusText,
          _propertyId: Number(item._propertyId),
        });
      }
    });

    const newData: PropertyRequest[] = await Promise.all(
      filteredForms.map(async (form) => {
        const formDetails: FormDetails = await _getRequestDetails({
          serialNumber: Number(form._requestId),
        });

        // const metadataGateWay: NftMetadata | null = await fetchNftMetadataViaGateway(
        //   formDetails.uri
        // );

        return {
          id: Number(form._requestId),
          status: form._status,
          acceptedPropertyId:
            form._status === "Accepted" ? form._propertyId : undefined,
          fractions: String(formDetails.totalShares),
          fractionsPrice: String(formDetails.pricePerShare),
          uri: formDetails.uri,
        };
      })
    );

    return newData;
  } catch (error) {
    console.log("🚀 ~ getUserRequestedForms ~ error:", error);
    return [];
  }
};

export const getAllRequestedFormsForAdmin = async (): Promise<
  FormRequestEventType[]
> => {
  if (ENVIRONMENT === "local") {
    return [];
  }
  try {
    const batchSize = 100; // Number of events to fetch per request
    let allEvents: FormRequestEventType[] = [];
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      const queryQl = `
        query GetRequestStatuses( $skip: Int!) {
          requestStatuses(
            first: ${batchSize},
            skip: ${skip},
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _by
            _requestId
            _status
            _propertyId
          }
        }
      `;

      try {
        // Make the POST request using axios
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.form_url,
          {
            query: queryQl,
            variables: {
              skip,
            },
          }
        );

        // Extract the data from the response
        const _100NewEvents: FormRequestEventType[] =
          response.data?.data?.requestStatuses;

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

    // Map to keep track of statuses associated with each _requestId
    const requestIdStatusMap: { [key: string]: Set<number> } = {};

    // Build the map
    for (const item of allEvents) {
      const requestId = item._requestId;
      const status = item._status;

      if (!requestIdStatusMap[requestId]) {
        requestIdStatusMap[requestId] = new Set();
      }
      requestIdStatusMap[requestId].add(status);
    }

    // Filter _requestIds that have only _status 1
    const validRequestIds = Object.keys(requestIdStatusMap).filter(
      (requestId) => {
        const statuses = requestIdStatusMap[requestId];
        return statuses.size === 1 && statuses.has(1);
      }
    );

    // Collect the objects with _status 1 for the valid _requestIds
    const result = allEvents.filter(
      (item) => validRequestIds.includes(item._requestId) && item._status === 1
    );

    return result;
  } catch (error) {
    console.log("🚀 ~ getUserRequestedForms ~ error:", error);
    return [];
  }
};
