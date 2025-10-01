import { BITSTAKE_CONFIG, ENVIRONMENT } from "@/app/utils/constants";
import axios from "axios";

export const getDeListedAndRefundedPropertyIds = async (): Promise<
  number[]
> => {
  try {
    if (ENVIRONMENT === "local") {
      return [];
    }

    const batchSize = 100;
    let skipDelisted = 0;
    let skipRefunded = 0;
    let hasMoreDelisted = true;
    let hasMoreRefunded = true;
    const delistedIds: number[] = [];
    const refundedIds: number[] = [];

    // Fetch PropertyDelisted events
    while (hasMoreDelisted) {
      const queryDelisted = `
        query GetPropertyDelisted($first: Int!, $skip: Int!) {
          propertyDelisteds(
            first: $first,
            skip: $skip,
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _propertyId
          }
        }
      `;

      try {
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.rwa_url,
          {
            query: queryDelisted,
            variables: { first: batchSize, skip: skipDelisted },
          }
        );

        const events = response.data?.data?.propertyDelisteds ?? [];

        if (events.length === 0) {
          hasMoreDelisted = false;
        } else {
          delistedIds.push(...events.map((e: any) => Number(e._propertyId)));
          skipDelisted += batchSize;
          if (events.length < batchSize) hasMoreDelisted = false;
        }
      } catch (error) {
        console.log("Error fetching PropertyDelisted events:", error);
        hasMoreDelisted = false;
      }
    }

    // Fetch PrimarySaleStatus events with _status == "Refunded"
    while (hasMoreRefunded) {
      const queryRefunded = `
        query GetPrimarySaleStatus($first: Int!, $skip: Int!) {
          primarySaleStatuses(
            where: { _status: 3 },
            first: $first,
            skip: $skip,
            orderBy: blockTimestamp,
            orderDirection: desc
          ) {
            _propertyId
          }
        }
      `;

      try {
        const response = await axios.post(
          BITSTAKE_CONFIG.subgraphUrls.market_url,
          {
            query: queryRefunded,
            variables: { first: batchSize, skip: skipRefunded },
          }
        );

        const events = response.data?.data?.primarySaleStatuses ?? [];

        if (events.length === 0) {
          hasMoreRefunded = false;
        } else {
          refundedIds.push(...events.map((e: any) => Number(e._propertyId)));
          skipRefunded += batchSize;
          if (events.length < batchSize) hasMoreRefunded = false;
        }
      } catch (error) {
        console.log("Error fetching PrimarySaleStatus events:", error);
        hasMoreRefunded = false;
      }
    }

    console.log(
      "🚀 ~ getDeListedAndRefundedPropertyIds ~ delistedIds:",
      delistedIds
    );
    console.log(
      "🚀 ~ getDeListedAndRefundedPropertyIds ~ refundedIds:",
      refundedIds
    );
    const merged = Array.from(new Set([...delistedIds, ...refundedIds]));
    return merged;
  } catch (error) {
    console.log("🚀 ~ getDeListedAndRefundedPropertyIds ~ error:", error);
    return [];
  }
};
