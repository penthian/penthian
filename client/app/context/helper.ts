import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  AdminAggregatedAgentData,
  AdminPrimarySalesStats,
  AgentAggregatedData,
  AgentGroupedData,
  NftMetadata,
} from "./types";
import {
  AdminSecondarySalesEvent,
  AgentPrimarySharesBought,
} from "./subgraph-helpers/market-subgraph";
// import { pinata } from "./pinataSdk";

export const groupAndAggregateAdminAgentData = (
  allAgentPrimarySaleEvents: AgentPrimarySharesBought[],
  wholeSecondaryInvestment: number,
  wholeSecondaryMarketFees: number,
  totalProperties: number
): {
  agentData: AdminAggregatedAgentData[];
  stats: AdminPrimarySalesStats;
} => {
  // Create a map to store data by agent
  const agentDataMap: { [key: string]: any } = {};
  const wholeUniqueBuyers = new Set<string>();
  // const _wholeUniqueProperties = new Set<number>();
  let wholeInvestment = 0;
  let wholeMarketFees = 0;

  // Process each event
  allAgentPrimarySaleEvents.forEach(
    ({ agent, buyer, propertyId, investment, marketFees, commissionFees }) => {
      // Check and add to global stats if not already added
      if (!wholeUniqueBuyers.has(buyer)) {
        wholeUniqueBuyers.add(buyer);
      }
      // if (!_wholeUniqueProperties.has(propertyId)) {
      //   _wholeUniqueProperties.add(propertyId);
      // }
      wholeInvestment += investment;
      wholeMarketFees += marketFees;

      // Initialize agent data if not already present
      const agentData =
        agentDataMap[agent] ||
        (agentDataMap[agent] = {
          uniqueBuyers: new Set<string>(),
          uniqueProperties: new Set<number>(),
          totalInvestment: 0,
          totalCommission: 0,
        });

      // Check and add buyer and property to agent-specific sets if not already added
      if (!agentData.uniqueBuyers.has(buyer)) {
        agentData.uniqueBuyers.add(buyer);
      }
      if (!agentData.uniqueProperties.has(propertyId)) {
        agentData.uniqueProperties.add(propertyId);
      }

      // Accumulate investment and market fees
      agentData.totalInvestment += investment;
      agentData.totalCommission += commissionFees;
    }
  );

  // Convert agent data to an array
  const aggregatedData: AdminAggregatedAgentData[] = Object.keys(
    agentDataMap
  ).map((agent) => {
    const data = agentDataMap[agent];
    return {
      agent,
      uniqueBuyersCount: data.uniqueBuyers.size,
      uniquePropertiesCount: data.uniqueProperties.size,
      totalInvestment: data.totalInvestment,
      totalCommission: data.totalCommission,
    };
  });

  return {
    agentData: aggregatedData,
    stats: {
      wholeUniqueBuyers: wholeUniqueBuyers.size,
      wholeUniqueProperties: totalProperties,
      wholeInvestment,
      wholeMarketFees,
      wholeSecondaryInvestment,
      wholeSecondaryMarketFees,
    },
  };
};

export const aggregateAgentData = (
  agentData: AgentPrimarySharesBought[]
): { groupedData: AgentGroupedData[]; aggregatedData: AgentAggregatedData } => {
  const groupedByPropertyId: {
    [propertyId: number]: { [buyer: string]: AgentPrimarySharesBought[] };
  } = {};

  agentData.forEach((event) => {
    const { propertyId, buyer } = event;

    if (!groupedByPropertyId[propertyId]) {
      groupedByPropertyId[propertyId] = {};
    }

    if (!groupedByPropertyId[propertyId][buyer]) {
      groupedByPropertyId[propertyId][buyer] = [];
    }

    groupedByPropertyId[propertyId][buyer].push(event);
  });

  let totalClients = 0;
  let totalInvestment = 0;
  let totalCommissionFees = 0;

  const groupedData = Object.keys(groupedByPropertyId).map((propertyId) => {
    const buyersData = groupedByPropertyId[Number(propertyId)];
    let propertyInvestment = 0;
    let propertyCommissionFees = 0;
    let propertyClients = 0;

    // Calculate for this property
    Object.values(buyersData).forEach((buyerData) => {
      propertyClients += 1;
      buyerData.forEach((event) => {
        propertyInvestment += event.investment;
        propertyCommissionFees += event.commissionFees;
      });
    });

    // Add to overall totals
    totalClients += propertyClients;
    totalInvestment += propertyInvestment;
    totalCommissionFees += propertyCommissionFees;

    return {
      propertyId: Number(propertyId),
      groupedByBuyer: buyersData,
    };
  });

  return {
    groupedData,
    aggregatedData: {
      totalClients,
      totalInvestment,
      totalCommissionFees,
      totalProperties: groupedData.length,
    },
  };
};

export const addSpaceBeforeCapitalLetters = (input: string): string => {
  if (input.includes("__")) {
    input = input.split("__")[1];
    return input.replace(/([A-Z])/g, " $1").trim();
  }
  return input.replace(/([A-Z])/g, " $1").trim();
};

//================================== FORMATTERS ================================
export const getEthFrom = (wei: string): string => {
  return ethers.utils.formatEther(wei).toString();
};
export const getWeiFrom = (eth: string): string => {
  return ethers.utils.parseEther(eth).toString();
};
export const getCustomWeiFrom = (eth: string, decimals: number): string => {
  return ethers.utils.parseUnits(eth, decimals).toString();
};
export const getCustomEthFrom = (eth: string, decimals: number): string => {
  return ethers.utils.formatUnits(eth, decimals).toString();
};

export function FormateBalance(balance: string): string {
  // Ensure balance is a string representation of a number
  let num = balance.includes(".") ? balance.split(".")[0] : balance;
  const length = num.length;

  const formats = [
    { suffix: "Z", divisor: 18 }, // Zillion
    { suffix: "Q", divisor: 15 }, // Quadrillion
    { suffix: "T", divisor: 12 }, // Trillion
    { suffix: "B", divisor: 9 }, // Billion
    { suffix: "M", divisor: 6 }, // Million
    { suffix: "K", divisor: 3 }, // Thousand
  ];

  // Iterate through each format to find the appropriate one
  for (const { suffix, divisor } of formats) {
    if (length > divisor) {
      const index = length - divisor;
      const formatted = parseFloat(
        num.slice(0, index) + "." + num.slice(index, index + 2)
      );
      return `${formatted}${suffix}`;
    }
  }

  // If no suffix was applicable, return the original number formatted to remove unnecessary decimals
  return parseFloat(balance).toString();
}

export function getDiscounts(amount: number): number {
  const discountSlabs = [10000, 1000, 100];
  const discountLimits = [3, 2, 1];

  const index = discountSlabs.findIndex((slab) => amount >= slab);
  return index !== -1 ? discountLimits[index] : 0;
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function getCurrentTimeInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function formatUnixTimestampToDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const formattedDate = date.toLocaleDateString("en-US", dateOptions);
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

  return `${formattedDate} | ${formattedTime}`;
}

export function truncateAmount(value: string, decimals = 3) {
  const parts = value.split(".");
  if (parts.length === 2 && parts[1].length > decimals) {
    return Number(`${parts[0]}.${parts[1].substring(0, decimals - 1)}`);
  }
  return Number(value);
}

// //======================== toasts =================

type Id = { current: string | null };

let notifySuccessToastId: Id = { current: null };
let errorToastId: Id = { current: null };

// Function to notify success, avoiding duplicate toasts
export const NotifySuccess = (msg: string) => {
  // Check if there's an active success toast
  if (notifySuccessToastId.current) {
    toast.dismiss(notifySuccessToastId.current); // Dismiss the current toast
  }

  // Show a new success toast and store its ID
  notifySuccessToastId.current = toast.success(msg,{
    duration: 5000, // Set a longer duration for error messages
  });
};

// Function to notify error, avoiding duplicate toasts
export const NotifyError = (msg: string) => {
  // Check if there's an active error toast
  if (errorToastId.current) {
    toast.dismiss(errorToastId.current); // Dismiss the current toast
  }

  // Show a new error toast and store its ID
  errorToastId.current = toast.error(msg,{
    duration: 5000, // Set a longer duration for error messages
  });
};

export async function fetchNftMetadata(
  uri: string
): Promise<NftMetadata | null> {
  try {
    const response = await axios.get<NftMetadata>(uri);
    return response.data;
  } catch (error) {
    console.log("Error fetching NFT metadata:", error);
    return null;
  }
}

// export async function fetchNftMetadataViaGateway(
//   uri: string
// ): Promise<NftMetadata | null> {
//   try {
//     const response = await pinata.gateways.get(
//       "QmTTa8DQ7bac5f5XwG4vJQdaKsxiePi32EGx6bd8W8WGpQ"
//     );
//     console.log("🚀 ~ fetchNftMetadataViaGateway response:", response)
//     return response as any;
//   } catch (error) {
//     console.log("Error fetching NFT metadata via gateway:", error);
//     return null;
//   }
// }

export const HandleTxError = (error: any) => {
  NotifyError(error.message || error.reason || "Something went wrong!!!");
};

export const shortenWalletAddress = (
  address: string,
  startLength: number = 4,
  endLength: number = 4
): string => {
  if (address.length <= startLength + endLength) {
    return address; // Return the address as is if it's already short
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export function isWhiteListed(address: string) {
  return isWhiteListed;
}

export const formatValue = (value: number): string => {
  const abs = Math.abs(value);
  let suffix = "";
  let scaled = value;

  if (abs >= 1e12) {
    suffix = "T";
    scaled = value / 1e12;
  } else if (abs >= 1e9) {
    suffix = "B";
    scaled = value / 1e9;
  } else if (abs >= 1e6) {
    suffix = "M";
    scaled = value / 1e6;
  } else if (abs >= 1e3) {
    suffix = "K";
    scaled = value / 1e3;
  }

  const str = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  return `$${str}${suffix}`;
};

export const DELAY = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};


type DebouncedFunction = (...args: any[]) => void;

export function debounce<T extends DebouncedFunction>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;

  return function (...args: any[]) {
    // Clear the previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout to call the function after the delay
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  } as T;
}
