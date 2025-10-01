// "use client";

// import { useState, useEffect, Dispatch, SetStateAction } from "react";
// import { Card, CardContent } from "@/app/components/ui/card";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/app/components/ui/avatar";

// import {
//   MapPin,
//   ThumbsUp,
//   ThumbsDown,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Loader,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   ClaimableRentsType,
//   ProposalDataType,
//   ProposalDetails,
//   UserPropertyData,
//   UserVotesStatusType,
//   VotingProposal,
// } from "@/app/context/types";
// import { Badge } from "@/app/components/ui/badge";
// import { Button } from "@/app/components/ui/button";
// import { Separator } from "@/app/components/ui/separator";
// import Image from "next/image";
// import {
//   _castVote,
//   _getProposalData,
//   _getUserVoteStatus,
// } from "@/app/context/helper-voting";
// import { _getUserProperty } from "@/app/context/helper-market";
// import { getRwaContract } from "@/app/context/helper-rwa";
// import {
//   NotifyError,
//   NotifySuccess,
//   shortenWalletAddress,
//   ZERO_ADDRESS,
// } from "@/app/context/helper";
// import { BITSTAKE_CONFIG } from "@/app/utils/constants";
// import { useAccount } from "wagmi";
// import { useBitStakeContext } from "@/app/context/BitstakeContext";
// import { _withdrawRent } from "@/app/context/helper-rent";

// export interface ClaimRentCardProps {
//   rent: ClaimableRentsType;
// }

// export function ClaimRentCard({ rent }: ClaimRentCardProps) {
//   const { handleRefreshUserRents, particleProvider } = useBitStakeContext();
//   const { address: account } = useAccount();

//   const [isClaimingRent, setIsClaimingRent] = useState(false);

//   const handleClaimRent = async () => {
//     setIsClaimingRent(true);

//     try {
//       if (!account) return NotifyError("Connect wallet to vote");
//       // Simulate a vote cast action
//       console.log(`Claiming rent of property ${rent.propertyId}`);

//       const payload = {
//         propertyId: Number(rent.propertyId),
//         particleProvider: particleProvider,
//       };
//       await _withdrawRent(payload);
//       NotifySuccess("Rent claimed successfully");
//       await handleRefreshUserRents(account);
//     } catch (error: any) {
//       NotifyError(error.reason || error.message || "Something went wrong");
//     } finally {
//       setIsClaimingRent(false);
//     }
//   };

//   return (
//     <div className="flex flex-col xl:flex-row w-full xl:gap-4">

//       <p></p>
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         onClick={handleClaimRent}
//         disabled={isClaimingRent}
//       >
//         {isClaimingRent ? (
//           <Loader />
//         ) : (
//           `Claim Property ${rent.propertyId} rent ${rent.rentPerShare*rent.userShares} USDC`
//         )}
//       </button>
//     </div>
//   );
// }
