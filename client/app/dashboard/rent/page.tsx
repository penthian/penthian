// app/rent/page.tsx
"use client";

import React from "react";
import UserDashboard from "@/app/components/UserDashboard";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { Card, CardContent } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import ClaimableRentTable from "./claimable-rent-table";
import ClaimedRentTable from "./claimed-rent-table";
import { Skeleton } from "@/app/components/ui/Skeleton";

const Page: React.FC = () => {
  const { userRents, userRentsLoading, userPastRents, userPastRentsLoading } = useBitStakeContext();

  return (
    <UserDashboard>
      <Card>
        <CardContent>
          <Tabs defaultValue="claimable" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="claimable">Claimable Rent</TabsTrigger>
              <TabsTrigger value="claimed">Claimed Rent</TabsTrigger>
            </TabsList>

            <TabsContent value="claimable" className="space-y-6">
              {userRentsLoading ? (
                // <RentTableSkeleton />
                <Skeleton className="h-56 w-full" />
              ) : (
                <ClaimableRentTable rows={userRents} />
              )}
            </TabsContent>

            <TabsContent value="claimed" className="space-y-6">
              {userPastRentsLoading ? (
                // <PastRentTableSkeleton />
                <Skeleton className="h-56 w-full" />
              ) : (
                <ClaimedRentTable rows={userPastRents} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </UserDashboard>
  );
};

export default Page;
