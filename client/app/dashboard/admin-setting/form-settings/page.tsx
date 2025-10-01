"use client";

import { useBitStakeContext } from "@/app/context/BitstakeContext";
import PropertyRequests from "./PropertyRequests";
import AdminDashboard from "@/app/components/AdminDashboard";
import ListingFee from "./PlatformFee";
import DelistProperty from "./DelistProperty";

const FormSettings = () => {
  const { isFormOwner } =
    useBitStakeContext();

  return (
    <AdminDashboard>
      {isFormOwner ? (
        <div className="w-full space-y-6">
          <PropertyRequests />
          <ListingFee/>
          <DelistProperty/>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[45dvh] text-bold text-xl">
          Only Form Owner is allowed.
        </div>
      )}
    </AdminDashboard>
  );
};

export default FormSettings;
