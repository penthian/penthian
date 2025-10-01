"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { useAccount } from "wagmi";
import { getUserRequestedForms } from "./subgraph-helpers/form-subgraph";
import {
  FormRequestedType,
  SecondaryListing,
  PropertyRequest,
  ConcludablePrimaryListing,
  SecondarySaleStatusEvent,
  UserSecondaryListings,
  AuctionCreated,
  UserPropertyData,
  ClaimableRentsType,
  RentWithdrawnEventFormatted,
  AgentGroupedData,
  AgentAggregatedData,
  AdminAggregatedAgentData,
  AdminPrimarySalesStats,
} from "./types";
import { _getFormOwner, getAllFormRequests } from "./helper-form";
import {
  _getConcludablePrimaryListings,
  _getMarketOwner,
  _getSecondaryListing,
  _getUserProperties,
  _isUserBlacklisted,
  _isUserWhitelistedAgent,
} from "./helper-market";
import { EVMProvider } from "@particle-network/auth-core-modal/dist/context/evmProvider";
import { useEthereum } from "@particle-network/auth-core-modal";
import {
  _getAllSecondaryEvents,
  AgentPrimarySharesBought,
  getAgentsSalesData,
  getAllOnGoingPrimaryListing,
  getAllOnGoingSecondaryListing,
  getAuctions,
  getSecondarySalesData,
  getUserSecondaryListings,
} from "./subgraph-helpers/market-subgraph";
import { _getTotalProperties } from "./helper-rwa";
import { _getTotalProposals, _getVotingOwner } from "./helper-voting";
import {
  aggregateAgentData,
  getCustomEthFrom,
  getEthFrom,
  groupAndAggregateAdminAgentData,
} from "./helper";
import {
  fetchProposalStatusEvents,
  ProposalEventsType,
} from "./subgraph-helpers/voting-subgraph";
import { _getRentOwner } from "./helper-rent";
import {
  _getClaimableRents,
  fetchRentWithdrawnEvents,
} from "./subgraph-helpers/rent-subgraph";
import { usePathname } from "next/navigation";
import { BITSTAKE_CONFIG } from "../utils/constants";
import PageLoader from "../components/page-loader";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../components/ui/card";
import { ConnectWalletButton } from "../components/ConnectWalletButton";
import Section from "../components/layout/section-box";
import {
  getLatestAuthType,
  isSocialAuthType,
} from "@particle-network/auth-core";
import KYCModal from "../components/KYCModal";
import { useKYCModal } from "./KYCModalContext";

export type AppViewType =
  | "LOADING"
  | "USER"
  | "ADMIN"
  | "BLACKLISTED"
  | "NOT_CONNECTED";

interface BitStakeContextType {
  isFormOwner: boolean;
  isRentOwner: boolean;
  isVotingOwner: boolean;
  isMarketOwner: boolean;
  allFormRequested: FormRequestedType[];
  allFormRequestedLoading: boolean;
  userRequestedForms: PropertyRequest[];
  userRequestedFormsLoading: boolean;
  setUserRequestedFormsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  getAllSecondaryListingsData: (
    payload: SecondarySaleStatusEvent[]
  ) => Promise<SecondaryListing[]>;
  refreshAllRequestedForms: (_isFormOwner: boolean) => Promise<void>;
  refreshConcludeableListings: (_isFormOwner: boolean) => Promise<void>;
  concludableProperties: ConcludablePrimaryListing[];
  concludablePropertiesLoading: boolean;
  handleRefreshUserRequestedForms: (account: string) => Promise<void>;
  particleProvider: EVMProvider;
  allSecondaryListingEvents: SecondarySaleStatusEvent[];
  allSecondaryListingEventLoading: boolean;
  totalPrimaryListings: number[];
  totalPrimaryListingsLoading: boolean;
  userSecondaryListingsLoading: boolean;
  setTotalPrimaryListingsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  userSecondaryListings: UserSecondaryListings[];
  handleRefreshUserSecondaryListings: (account: string) => Promise<void>;
  handleRefreshAllSecondaryListings: () => Promise<void>;
  handleRefreshAuctions: () => Promise<void>;
  allAuctionEvents: AuctionCreated[];
  allAuctionEventsLoading: boolean;

  handleRefreshAllProposals: (
    voterAddress: `0x${string}` | undefined
  ) => Promise<void>;
  handleRefreshAdminProposals: (_isVotingOwner: boolean) => Promise<void>;
  proposals: ProposalEventsType | null;
  proposalsLoading: boolean;
  adminProposals: ProposalEventsType | null;
  adminProposalsLoading: boolean;
  setProposalsLoading: (value: React.SetStateAction<boolean>) => void;

  isMarketOwnerLoading: boolean;
  isFormOwnerLoading: boolean;
  isRentOwnerLoading: boolean;
  isVotingOwnerLoading: boolean;
  userProperties: UserPropertyData[];
  userPropertiesLoading: boolean;
  userRents: ClaimableRentsType[];
  userPastRents: RentWithdrawnEventFormatted[];
  userRentsLoading: boolean;
  userPastRentsLoading: boolean;
  handleRefreshUserRents: (connectedAddress?: string) => Promise<void>;
  userAccess: {
    isAgent: boolean;
    isBlacklist: boolean;
  };
  agentDataLoading: boolean;
  agentData: {
    agentGroupedData: AgentGroupedData[];
    agentAggregatedData: AgentAggregatedData;
  };
  isAnyOneAdmin: boolean;
  adminPrimarySalesDataLoading: boolean;
  adminPrimarySalesData: {
    agentData: AdminAggregatedAgentData[];
    stats: AdminPrimarySalesStats;
  };
  isAdminPage: boolean;
  userAccessLoading: boolean;
  accountLoading: boolean;
  account: `0x${string}` | undefined;
}

const BitStakeContext = createContext<BitStakeContextType | undefined>(
  undefined
);

// Create a provider component
export const BitStakeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  //============================================= STATE HOOKS =================================================
  const { address: account, status } = useAccount();
  const { kycStatus } = useKYCModal();
  const [accountLoading, setAccountLoading] = useState(true);

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/dashboard/admin-setting");
  const isLandingPage = pathname === "/";
  const isUserPage = !isAdminPage && !isLandingPage;

  // console.log("user routes:",{
  //   isAdminPage,
  //   isLandingPage,
  //   isUserPage,
  //   pathname,
  // })

  const { provider: particleProvider } = useEthereum();
  const [proposals, setProposals] = useState<ProposalEventsType | null>(null);
  const [proposalsLoading, setProposalsLoading] = useState(true);

  const [adminProposals, setAdminProposals] =
    useState<ProposalEventsType | null>(null);
  const [adminProposalsLoading, setAdminProposalsLoading] = useState(true);

  const [userProperties, setUserProperties] = useState<UserPropertyData[]>([]);
  const [userPropertiesLoading, setUserPropertiesLoading] =
    useState<boolean>(true);

  const [userRents, setUserRents] = useState<ClaimableRentsType[]>([]);
  const [userPastRents, setUserPastRents] = useState<
    RentWithdrawnEventFormatted[]
  >([]);
  const [userRentsLoading, setUserRentsLoading] = useState<boolean>(true);
  const [userPastRentsLoading, setUserPastRentsLoading] =
    useState<boolean>(true);

  const [userSecondaryListingsLoading, setUserSecondaryListingsLoading] =
    useState(false);

  const [userAccessLoading, setUserAccessLoading] = useState(true);
  const [userAccess, setUserAccess] = useState({
    isAgent: false,
    isBlacklist: false,
  });

  const [agentDataLoading, setAgentDataLoading] = useState(true);
  const [agentData, setAgentData] = useState<{
    agentGroupedData: AgentGroupedData[];
    agentAggregatedData: AgentAggregatedData;
  }>({
    agentGroupedData: [],
    agentAggregatedData: {
      totalProperties: 0,
      totalClients: 0,
      totalInvestment: 0,
      totalCommissionFees: 0,
    },
  });

  const [isFormOwnerLoading, setIsFormOwnerLoading] = useState(true);
  const [isFormOwner, setIsFormOwner] = useState(false);

  const [isRentOwnerLoading, setIsRentOwnerLoading] = useState(true);
  const [isRentOwner, setIsRentOwner] = useState(false);

  const [isVotingOwnerLoading, setIsVotingOwnerLoading] = useState(true);
  const [isVotingOwner, setIsVotingOwner] = useState(false);

  const [isMarketOwnerLoading, setIsMarketOwnerLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  const [allFormRequested, setAllFormRequested] = useState<FormRequestedType[]>(
    []
  );
  const [allFormRequestedLoading, setAllFormRequestedLoading] =
    useState<boolean>(true);

  const [adminPrimarySalesDataLoading, setAdminPrimarySalesDataLoading] =
    useState<boolean>(true);
  const [adminPrimarySalesData, setAdminPrimarySalesData] = useState<{
    agentData: AdminAggregatedAgentData[];
    stats: AdminPrimarySalesStats;
  }>({
    agentData: [],
    stats: {
      wholeUniqueBuyers: 0,
      wholeUniqueProperties: 0,
      wholeInvestment: 0,
      wholeMarketFees: 0,
      wholeSecondaryInvestment: 0,
      wholeSecondaryMarketFees: 0,
    },
  });

  const [userRequestedForms, setUserRequestedForms] = useState<
    PropertyRequest[]
  >([]);
  const [userRequestedFormsLoading, setUserRequestedFormsLoading] =
    useState<boolean>(true);

  const [allAuctionEvents, setAllAuctionEvents] = useState<AuctionCreated[]>(
    []
  );
  const [allAuctionEventsLoading, setAllAuctionEventsLoading] =
    useState<boolean>(true);
  const [allSecondaryListingEvents, setAllSecondaryListingEvents] = useState<
    SecondarySaleStatusEvent[]
  >([]);
  const [userSecondaryListings, setUserSecondaryListings] = useState<
    UserSecondaryListings[]
  >([]);
  const [allSecondaryListingEventLoading, setAllSecondaryListingEventLoading] =
    useState<boolean>(true);

  const [totalPrimaryListings, setTotalPrimaryListings] = useState<number[]>(
    []
  );
  const [totalPrimaryListingsLoading, setTotalPrimaryListingsLoading] =
    useState<boolean>(true);

  const [concludableProperties, setConcludableProperties] = useState<
    ConcludablePrimaryListing[]
  >([]);
  const [concludablePropertiesLoading, setConcludablePropertiesLoading] =
    useState<boolean>(false);

  const [appViewType, setAppViewType] = useState<AppViewType>("LOADING");

  const isAnyOneAdmin =
    isFormOwner || isRentOwner || isVotingOwner || isMarketOwner;
  //============================================= HANDLER =================================================

  const handleRefreshAllProposals = async (
    voterAddress: `0x${string}` | undefined
  ) => {
    if (!voterAddress) {
      setProposalsLoading(false);
      return;
    }
    setProposalsLoading(true);
    const _proposals = await fetchProposalStatusEvents(voterAddress);
    setProposals(_proposals);
    setProposalsLoading(false);
  };

  const handleRefreshAdminProposals = async (_isVotingOwner: boolean) => {
    if (!_isVotingOwner) {
      setAdminProposalsLoading(false);
      return;
    }
    setAdminProposalsLoading(true);
    const _adminProposals = await fetchProposalStatusEvents();
    setAdminProposals(_adminProposals);
    setAdminProposalsLoading(false);
  };

  const handleRefreshUserRequestedForms = async (account: string) => {
    const userForms = await getUserRequestedForms(account);

    setUserRequestedForms(userForms);
  };

  const handleRefreshUserSecondaryListings = async (account: string) => {
    setUserSecondaryListingsLoading(true);
    const listings = await getUserSecondaryListings(account);
    setUserSecondaryListings(listings);
    setUserSecondaryListingsLoading(false);
  };
  const handleRefreshAllSecondaryListings = async () => {
    const _allSecondaryListingEvents = await getAllOnGoingSecondaryListing();
    setAllSecondaryListingEvents(_allSecondaryListingEvents);
  };
  const handleRefreshAuctions = async () => {
    const auctions = await getAuctions();
    setAllAuctionEvents(auctions);
  };

  //============================================= EFFECTS =================================================

  useEffect(() => {
    if (isSocialAuthType(getLatestAuthType())) {
      setAccountLoading(false);
      return;
    }
    setAccountLoading(status === "connecting" || status === "reconnecting");
  }, [status]);

  useEffect(() => {
    (async () => {
      await handleRefreshAllProposals(account);
    })();
  }, [account]);

  useEffect(() => {
    (async () => {
      await handleRefreshAdminProposals(isVotingOwner);
    })();
  }, [isVotingOwner]);

  useEffect(() => {
    (async () => {
      setAllAuctionEventsLoading(true);
      await handleRefreshAuctions();
      setAllAuctionEventsLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setAllSecondaryListingEventLoading(true);
      await handleRefreshAllSecondaryListings();
      setAllSecondaryListingEventLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setTotalPrimaryListingsLoading(true);
      const allOnGoingPrimaryListing = await getAllOnGoingPrimaryListing();
      setTotalPrimaryListings(
        allOnGoingPrimaryListing.map((property) => Number(property._propertyId))
      );
      setTotalPrimaryListingsLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setUserSecondaryListingsLoading(true);
      if (account) {
        await handleRefreshUserSecondaryListings(account);
      }
      setUserSecondaryListingsLoading(false);
    })();
  }, [account]);

  useEffect(() => {
    const fetchUserAccess = async (_account: `0x${string}` | undefined) => {
      setUserAccessLoading(true);

      if (!_account) {
        setUserAccessLoading(false);
        setUserAccess({ isAgent: false, isBlacklist: false });
        return;
      }

      try {
        const [isAgent, isBlacklist] = await Promise.all([
          _isUserWhitelistedAgent(_account),
          _isUserBlacklisted(_account),
        ]);

        setUserAccess({ isAgent, isBlacklist });
      } catch (error) {
        console.log("Failed to fetch user access:", error);

        setUserAccess({ isAgent: false, isBlacklist: false });
      } finally {
        setUserAccessLoading(false);
      }
    };
    fetchUserAccess(account);
  }, [account]);

  useEffect(() => {
    if (userAccessLoading) return;
    if (account && userAccess.isAgent) {
      (async () => {
        setAgentDataLoading(true);

        const agentEvents = await getAgentsSalesData(account);
        const agentFormData: AgentPrimarySharesBought[] = agentEvents.map(
          (event) => ({
            agent: event._agent.toLowerCase(),
            buyer: event._buyer.toLowerCase(),
            propertyId: Number(event._propertyId),
            sharesBought: Number(event._sharesBought),
            blockTimestamp: Number(event.blockTimestamp),
            investment: parseFloat(
              getCustomEthFrom(event._investment, BITSTAKE_CONFIG.usdcDecimals)
            ),
            marketFees: parseFloat(
              getCustomEthFrom(event._marketFees, BITSTAKE_CONFIG.usdcDecimals)
            ),
            commissionFees: parseFloat(
              getCustomEthFrom(
                event._commissionFees,
                BITSTAKE_CONFIG.usdcDecimals
              )
            ),
          })
        );
        const { groupedData, aggregatedData } =
          aggregateAgentData(agentFormData);

        setAgentData({
          agentGroupedData: groupedData,
          agentAggregatedData: aggregatedData,
        });
        setAgentDataLoading(false);
      })();
    } else {
      setAgentData({
        agentGroupedData: [],
        agentAggregatedData: {
          totalClients: 0,
          totalProperties: 0,
          totalInvestment: 0,
          totalCommissionFees: 0,
        },
      });
      setAgentDataLoading(false);
    }
  }, [userAccess.isAgent, account, userAccessLoading]);

  useEffect(() => {
    if (!account) {
      setIsFormOwner(false);
      setIsRentOwner(false);
      setIsVotingOwner(false);
      setIsMarketOwner(false);
      return;
    }

    const fetchOwnershipStatuses = async () => {
      setIsFormOwnerLoading(true);
      setIsRentOwnerLoading(true);
      setIsVotingOwnerLoading(true);
      setIsMarketOwnerLoading(true);

      try {
        const [
          formOwnerAddress,
          rentOwnerAddress,
          votingOwnerAddress,
          marketOwnerAddress,
        ] = await Promise.all([
          _getFormOwner(),
          _getRentOwner(),
          _getVotingOwner(),
          _getMarketOwner(),
        ]);

        const normalizedAccount = account.toLowerCase();

        setIsFormOwner(formOwnerAddress?.toLowerCase() === normalizedAccount);

        setIsRentOwner(rentOwnerAddress?.toLowerCase() === normalizedAccount);

        setIsVotingOwner(
          votingOwnerAddress?.toLowerCase() === normalizedAccount
        );

        setIsMarketOwner(
          marketOwnerAddress?.toLowerCase() === normalizedAccount
        );
      } catch (error) {
        console.log("Failed to fetch owner addresses:", error);
        // fallback values
        setIsFormOwner(false);
        setIsRentOwner(false);
        setIsVotingOwner(false);
        setIsMarketOwner(false);
      } finally {
        setIsFormOwnerLoading(false);
        setIsRentOwnerLoading(false);
        setIsVotingOwnerLoading(false);
        setIsMarketOwnerLoading(false);
      }
    };

    fetchOwnershipStatuses();
  }, [account, status]);

  useEffect(() => {
    (async () => {
      if (accountLoading) return;

      setUserPropertiesLoading(true);
      if (account) {
        const properties = await _getUserProperties({
          userAddress: account,
        });
        setUserProperties(properties);
      } else {
        setUserProperties([]);
      }
      setUserPropertiesLoading(false);
    })();
  }, [account, accountLoading]);

  const handleRefreshUserRents = async (connectedAddress?: string) => {
    if (userPropertiesLoading) {
      setUserRentsLoading(true);
      setUserPastRentsLoading(true);
      return;
    }
    if (!connectedAddress) {
      setUserRentsLoading(false);
      setUserPastRentsLoading(false);
      setUserRents([]);
      setUserPastRents([]);
      return;
    }
    if (userProperties.length === 0) {
      setUserRentsLoading(false);
      setUserPastRentsLoading(false);
      setUserRents([]);
      setUserPastRents([]);
      return;
    }

    const userPropertiesIds = userProperties.map((property) => ({
      id: String(property.propertyId),
      sharesOwned: property.sharesOwned,
    }));
    setUserRentsLoading(true);
    setUserPastRentsLoading(true);
    const rents = await _getClaimableRents(connectedAddress, userPropertiesIds);
    const pastRents = await fetchRentWithdrawnEvents(connectedAddress);
    setUserRents(rents);
    setUserPastRents(pastRents);
    setUserRentsLoading(false);
    setUserPastRentsLoading(false);
  };

  useEffect(() => {
    (async () => {
      await handleRefreshUserRents(account);
    })();
  }, [userProperties, userPropertiesLoading, account]);

  const refreshAllRequestedForms = async (_isFormOwner: boolean) => {
    setAllFormRequestedLoading(true);
    if (_isFormOwner) {
      const data = await getAllFormRequests();
      setAllFormRequested(data);
    }
    setAllFormRequestedLoading(false);
  };

  const refreshConcludeableListings = async (_isFormOwner: boolean) => {
    setConcludablePropertiesLoading(true);
    if (_isFormOwner) {
      const data = await _getConcludablePrimaryListings();
      setConcludableProperties(data);
    }
    setConcludablePropertiesLoading(false);
  };

  useEffect(() => {
    refreshAllRequestedForms(isFormOwner);
    refreshConcludeableListings(isFormOwner);
  }, [isFormOwner]);

  const refreshAdminPrimarySalesData = async () => {
    setAdminPrimarySalesDataLoading(true);
    const allAgentPrimarySaleEventsRaw = await getAgentsSalesData();
    const secondarySalesDataRaw = await getSecondarySalesData();
    const allAgentPrimarySaleEvents: AgentPrimarySharesBought[] =
      allAgentPrimarySaleEventsRaw.map((event) => ({
        agent: event._agent.toLowerCase(),
        buyer: event._buyer.toLowerCase(),
        propertyId: Number(event._propertyId),
        sharesBought: Number(event._sharesBought),
        blockTimestamp: Number(event.blockTimestamp),
        investment: parseFloat(
          getCustomEthFrom(event._investment, BITSTAKE_CONFIG.usdcDecimals)
        ),
        marketFees: parseFloat(
          getCustomEthFrom(event._marketFees, BITSTAKE_CONFIG.usdcDecimals)
        ),
        commissionFees: parseFloat(
          getCustomEthFrom(event._commissionFees, BITSTAKE_CONFIG.usdcDecimals)
        ),
      }));

    let totalSecondaryInvestment = 0;
    let totalSecondaryMarketFees = 0;

    // Iterate over each raw event and accumulate the values
    secondarySalesDataRaw.forEach((event) => {
      totalSecondaryInvestment += parseFloat(
        getCustomEthFrom(event._investment, BITSTAKE_CONFIG.usdcDecimals)
      );
      totalSecondaryMarketFees += parseFloat(
        getCustomEthFrom(event._marketFees, BITSTAKE_CONFIG.usdcDecimals)
      );
    });

    const totalProperties = await _getTotalProperties();

    const stats = groupAndAggregateAdminAgentData(
      allAgentPrimarySaleEvents,
      totalSecondaryInvestment,
      totalSecondaryMarketFees,
      totalProperties
    );
    setAdminPrimarySalesData(stats);
    setAdminPrimarySalesDataLoading(false);
  };

  useEffect(() => {
    if (isAnyOneAdmin) {
      refreshAdminPrimarySalesData();
    }
  }, [isAnyOneAdmin]);

  const getAllSecondaryListingsData = async (
    payload: SecondarySaleStatusEvent[]
  ): Promise<SecondaryListing[]> => {
    try {
      let allListings = [];
      for (let i = 0; i < payload.length; i++) {
        const _details = await _getSecondaryListing({
          listingId: Number(payload[i]._listingId),
        });
        if (_details) allListings.push(_details);
      }

      return allListings;
    } catch (error) {
      return [];
    }
  };

  const contextValues = {
    account,
    isFormOwner,
    isRentOwner,
    isVotingOwner,
    isMarketOwner,
    allFormRequested,
    allFormRequestedLoading,
    userRequestedForms,
    userRequestedFormsLoading,
    setUserRequestedFormsLoading,
    getAllSecondaryListingsData,
    refreshAllRequestedForms,
    refreshConcludeableListings,
    handleRefreshUserRequestedForms,
    concludableProperties,
    concludablePropertiesLoading,
    particleProvider,
    allSecondaryListingEvents,
    allSecondaryListingEventLoading,
    totalPrimaryListings,
    totalPrimaryListingsLoading,
    setTotalPrimaryListingsLoading,
    userSecondaryListings,
    handleRefreshUserSecondaryListings,
    handleRefreshAllSecondaryListings,
    handleRefreshAuctions,
    allAuctionEvents,
    allAuctionEventsLoading,
    userSecondaryListingsLoading,

    handleRefreshAllProposals,
    handleRefreshAdminProposals,
    proposals,
    proposalsLoading,
    adminProposals,
    adminProposalsLoading,
    setProposalsLoading,

    isFormOwnerLoading,
    isRentOwnerLoading,
    isVotingOwnerLoading,
    isMarketOwnerLoading,
    userProperties,
    userPropertiesLoading,
    userRents,
    userRentsLoading,
    userPastRents,
    userPastRentsLoading,
    handleRefreshUserRents,
    userAccess,
    agentDataLoading,
    agentData,
    isAnyOneAdmin,
    adminPrimarySalesDataLoading,
    adminPrimarySalesData,
    isAdminPage,
    userAccessLoading,
    accountLoading,
  };

  // console.log("accountLoading || userAccessLoading", {
  //   accountLoading,
  //   userAccessLoading,
  // });

  if (accountLoading || userAccessLoading) {
    return (
      <>
        {/* <p>hi</p> */}
        <PageLoader />
      </>
    );
  } else if (!account) {
    return (
      <BitStakeContext.Provider value={contextValues}>
        <div className="w-full min-h-screen h-full flex items-center justify-center bg-black relative">
          <div className="hidden xl:flex flex-col items-center h-screen justify-center rounded-r-4xl max-w-sm 3xl:max-w-lg w-full bg-cream -mr-6 z-20">
            <Card className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 lg:static lg:top-auto lg:left-auto lg:transform-none flex flex-col gap-4 items-center justify-center full lg:mx-4 ">
              <CardContent className="flex flex-col items-center justify-items-center gap-2 3xl:px-8">
                <h2 className="text-xl sm:text-2xl 3xl:text-3xl font-medium text-center">
                  Please connect your wallet
                </h2>
                <br />
                <div className="w-full flex items-center justify-center">
                  <ConnectWalletButton />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 xl:hidden xl:top-auto xl:left-auto xl:transform-none flex flex-col gap-4 items-center justify-center full max-w-sm w-full xl:mx-4 z-20">
            <CardContent className="flex flex-col items-center justify-items-center gap-2 3xl:px-8">
              <h2 className="text-xl sm:text-2xl 3xl:text-3xl font-medium text-center">
                Please connect your wallet
              </h2>
              <br />
              <div className="w-full flex items-center justify-center">
                <ConnectWalletButton />
              </div>
            </CardContent>
          </Card>

          <Section
            imageSrc={"/assets/login-bg.png"}
            mobileSrc="/assets/login-bg.png"
            className="min-h-screen justify-start xl:justify-center p-8 z-10"
          >
            <div className="w-full flex justify-center items-center">
              <Link
                href="/"
                className="max-w-[200px] sm:max-w-xs 3xl:max-w-sm w-full flex justify-center"
              >
                <Image
                  src="/assets/logo.svg"
                  alt="Logo"
                  width={1000}
                  height={200}
                  className="hidden sm:block h-auto w-full object-contain"
                />
                <Image
                  src="/assets/logo.svg"
                  alt="Logo"
                  width={150}
                  height={30}
                  className="block sm:hidden h-auto w-full object-contain"
                />
              </Link>
            </div>
          </Section>
        </div>
      </BitStakeContext.Provider>
    );
  } else if (account && kycStatus !== "completed") {
    return (<KYCModal />)
  }
  else if (userAccess.isBlacklist) {
    return (
      <BitStakeContext.Provider value={contextValues}>
        <div className="w-full min-h-screen flex items-center justify-center">
          <Card className="max-w-96 flex flex-col gap-4 items-center justify-center">
            <CardContent className="flex flex-col items-center justify-items-center gap-4">
              <h2 className="text-xl font-medium">You are Blacklist User</h2>
              <p className="text-xl font-medium">Change the Wallet</p>
              <div className="w-full flex items-center justify-center">
                <ConnectWalletButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </BitStakeContext.Provider>
    );
  } else {
    return (
      <BitStakeContext.Provider value={contextValues}>
        {children}
      </BitStakeContext.Provider>
    );
  }
};

// Create a custom hook to use the BitStakeContext
export const useBitStakeContext = () => {
  const context = useContext(BitStakeContext);
  if (!context) {
    throw new Error(
      "useBitStakeContext must be used within a BitstakeProvider"
    );
  }
  return context;
};
