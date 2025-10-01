"use client";

import { useBitStakeContext } from "@/app/context/BitstakeContext";
import RentSetting from "./RentSetting";
import AdminDashboard from "@/app/components/AdminDashboard";

const Page = () => {
  const {
    isRentOwner,
  } = useBitStakeContext();
  return (
    <AdminDashboard>
      {isRentOwner ? (
        <div className="w-full space-y-6">
          <RentSetting />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[45dvh] text-bold text-xl">
          Only Rent Owner is allowed.
        </div>
      )}
    </AdminDashboard>
  );
};

export default Page;
