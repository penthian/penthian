"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { formatValue } from "@/app/context/helper";
import { AgentAggregatedData } from "@/app/context/types";

interface Stat {
  title: string;
  value: number;
}

interface AgentStatsProps {
  agentAggregatedData: AgentAggregatedData;
  loading: boolean
}

const AgentStats = ({ agentAggregatedData, loading }: AgentStatsProps) => {

  const stats: Stat[] = [
    { title: "Total Revenue", value: agentAggregatedData.totalInvestment }, // Use aggregated total investment as total revenue
    { title: "Clients", value: agentAggregatedData.totalClients },
    { title: "Properties", value: agentAggregatedData.totalProperties },
    { title: "Profit", value: agentAggregatedData.totalCommissionFees }, // Use aggregated commission fees as profit
  ];

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 3xl:gap-6">
      {stats.map(({ title, value }) => {
        const isCurrency = title === "Total Revenue" || title === "Profit";
        const display = isCurrency ? formatValue(value) : value.toString();

        return (
          <Card key={title}>
            <CardContent className="space-y-4">
              <CardTitle className="text-lg xl:text-lg font-light text-[#292A36]">
                {title}
              </CardTitle>
              <CardDescription className="text-xl xl:text-2xl font-extrabold">
                {loading ? <Skeleton className="h-8 w-20" /> : display} 
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AgentStats;
