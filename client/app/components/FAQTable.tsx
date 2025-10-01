// PropertyActivityTable.tsx
import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TiArrowUnsorted } from "react-icons/ti";
import Image from "next/image";
import { shortenWalletAddress } from "../context/helper";
import { BITSTAKE_CONFIG } from "../utils/constants";
import { Skeleton } from "./ui/Skeleton";
import { Activity } from "../context/types";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface PropertyActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

const iconMap: Record<Activity["event"], string> = {
  Sell: "/assets/icons/cart.svg",
  Buy: "/assets/icons/coins.svg",
  Bid: "/assets/dark-hammer.svg",
};

const PropertyActivityTable: React.FC<PropertyActivityProps> = ({
  activities,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={cn(`um_transition`)}>
      <CardContent>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-lg font-bold flex items-center gap-1">
            <TiArrowUnsorted className="text-xl" />
            Activity
          </h3>
          <MdKeyboardArrowDown
            className={`text-2xl transform transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>

        {isOpen && (
          <div className="overflow-auto">
            {isLoading ? (
              <Skeleton className="w-full h-20" />
            ) : activities.length > 0 ? (
              <table className="w-full mt-4">
                <thead>
                  <tr className="border-b border">
                    <th className="p-4 text-sm font-bold text-start">
                      Event
                    </th>
                    <th className="p-4 text-sm font-bold text-center">
                      User
                    </th>
                    <th className="p-4 text-sm font-bold text-end">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act, i) => (
                    <tr
                      key={i}
                      className="text-[15px] text-grey-2 border-b border"
                    >
                      <td className="p-4 flex items-center justify-start gap-1.5">
                        <Image
                          src={iconMap[act.event]}
                          alt={`${act.event} icon`}
                          width={20}
                          height={20}
                        />
                        {act.event}
                      </td>
                      <td className="p-4 text-center">
                        <a
                          href={`${BITSTAKE_CONFIG.explorerBaseUrl}/tx/${act.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5"
                        >
                          {shortenWalletAddress(act.userWalletAddress, 6, 4)}
                          <Image
                            src="/assets/icons/exit.svg"
                            alt="external link"
                            width={16}
                            height={16}
                          />
                        </a>

                      </td>
                      <td className="p-4 text-right">
                        {act.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4 text-grey-6">
                No activity data available.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyActivityTable;
