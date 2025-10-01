"use client";

import { Card, CardContent, CardDescription, CardTitle } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { formatValue } from "@/app/context/helper";

interface Stat {
  title: string;
  value: number;
}

const AdminStats: React.FC = () => {
  const {
    adminPrimarySalesDataLoading,
    adminPrimarySalesData: { stats },
  } = useBitStakeContext();

  // Define the stat tabs dynamically
  const statsTabs: Stat[] = [
    { title: "Total Revenue", value: stats.wholeInvestment + stats.wholeSecondaryInvestment },
    { title: "Clients", value: stats.wholeUniqueBuyers },
    { title: "Properties", value: stats.wholeUniqueProperties },
    { title: "Primary Market Earning", value: stats.wholeMarketFees },
    { title: "Secondary Market Earning", value: stats.wholeSecondaryMarketFees }, // Adjust or remove as needed
  ];

  // Render the stats cards
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-5 gap-4 3xl:gap-6">
      {statsTabs.map(({ title, value }) => {

        const isCurrency = [
          "Total Revenue",
          "Primary Market Earning",
          "Secondary Market Earning",
        ].includes(title);

        const display = isCurrency ? formatValue(value) : value.toString();

        return (
          <Card key={title}>
            <CardContent className="space-y-4">
              <CardTitle className="text-lg xl:text-lg font-light text-[#292A36]">{title}</CardTitle>
              <CardDescription className="text-xl xl:text-2xl font-extrabold">
                {adminPrimarySalesDataLoading ? <Skeleton className="h-8 w-20" /> : display}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStats;
