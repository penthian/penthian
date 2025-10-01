"use client";

import UserDashboard from "@/app/components/UserDashboard";
import AgentStats from "./AgentStats";
import AgentTable from "./AgentTable";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import RentSetting from "../admin-setting/rent-settings/RentSetting";
import PageLoader from "@/app/components/page-loader";

const Page = () => {
  const { userAccess, agentData, agentDataLoading } = useBitStakeContext();


  if (userAccess.isAgent) {
    return (
      <UserDashboard>
        <div className="space-y-6">
          <AgentStats agentAggregatedData={agentData.agentAggregatedData} loading={agentDataLoading} />
          <AgentTable agentGroupedData={agentData.agentGroupedData} loading={agentDataLoading} />
          <RentSetting />
        </div>
      </UserDashboard>
    );
  } else {
    return (
      <UserDashboard>
        <div className="flex items-center justify-center h-80 text-xl font-bold">
          Only Agent can view this page
        </div>
      </UserDashboard>
    );
  }
};

export default Page;
