// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { IoIosArrowForward } from "react-icons/io";
// import { IoIosArrowBack } from "react-icons/io";
// import { useAccount } from "wagmi";
// import { useBitStakeContext } from "@/app/context/BitstakeContext";
// import { useKYCModal } from "@/app/context/KYCModalContext";
// import { Property } from "@/app/context/types";
// import { getUserClaimableShares } from "@/app/context/subgraph-helpers/market-subgraph";
// import { _claimPendingSharesOrFunds } from "@/app/context/helper-market";
// import {
//   HandleTxError,
//   NotifySuccess,
//   truncateAmount,
// } from "@/app/context/helper";
// import UserDashboard from "@/app/components/UserDashboard";
// import Loader from "@/app/components/Loader";
// import { Skeleton } from "@/app/components/ui/Skeleton";
// import Link from "next/link";

// const rowsPerPageOptions = [5, 10, 15];

// const PendingShares: React.FC = () => {
//   const { particleProvider } = useBitStakeContext();
//   const { address: account } = useAccount();
//   const { kycStatus, openModal } = useKYCModal();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [loadingPropertyId, setLoadingPropertyId] = useState<number | null>(
//     null
//   );
//   const [tableData, setTableData] = useState<Property[]>([]); //DUMMY_TABLE_DATA
//   const [tableDataLoading, setTableDataLoading] = useState<boolean>(false);

//   const fetchData = async () => {
//     if (account) {
//       const newTableData = await getUserClaimableShares(account);
//       setTableData(newTableData);
//     }
//   };
//   useEffect(() => {
//     (async () => {
//       setTableDataLoading(true);
//       await fetchData();
//       setTableDataLoading(false);
//     })();
//   }, [account]);

//   const totalPages = Math.ceil(tableData.length / rowsPerPage);
//   const totalRows = tableData.length;

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   const handleRowsPerPageChange = (
//     event: React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     setRowsPerPage(Number(event.target.value));
//     setCurrentPage(1); // Reset to first page when changing rows per page
//   };

//   const paginatedData = tableData.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   // To calculate the range of rows being shown
//   const fromRow = (currentPage - 1) * rowsPerPage + 1;
//   const toRow = Math.min(currentPage * rowsPerPage, totalRows);

//   //============================ HANDLES
//   const handleClaimProperty = async (propertyId: number) => {
//     try {
//       if (!account) throw new Error("Please connect wallet ");
//       if (kycStatus !== "completed") {
//         await openModal(account);
//         throw new Error("Complete KYC in order to continue");
//       }

//       setLoadingPropertyId(propertyId);

//       const tx = await _claimPendingSharesOrFunds({
//         propertyId,
//         particleProvider,
//       });
//       if (tx) {
//         NotifySuccess("Primary Shares Claimed Successfully");
//         await fetchData();
//       }

//       console.log("🚀 ~ handleSubmit ~ tx:", tx);
//     } catch (error: any) {
//       HandleTxError(error);
//     } finally {
//       setLoadingPropertyId(null);
//     }
//   };

//   console.log({ paginatedData });
//   return (
//     <UserDashboard>
//       <div>
//         <div className="px-4 py-6">
//           <div className="overflow-x-auto mt-12">
//             <table className="min-w-full bg-white">
//               <thead>
//                 <tr className="border-b border-l border-r lg:text-wrap text-nowrap">
//                   <th className="px-6 py-3 text-left text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                     Property Name
//                   </th>
//                   <th className="px-6 py-3 text-center text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                     Fractions Bought
//                   </th>
//                   <th className="px-6 py-3 text-center">
//                     <div className="flex items-center gap-2.5 text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                       <Image
//                         src="/assets/USDC.svg"
//                         alt="USDC"
//                         width={24}
//                         height={24}
//                       />
//                       USDC Spent
//                     </div>
//                   </th>
//                   <th className="px-6 py-3 text-center">
//                     <div className="flex items-center gap-2.5 text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                       <Image
//                         src="/assets/eth.svg"
//                         alt="ETH"
//                         width={24}
//                         height={24}
//                       />
//                       ETH Spent
//                     </div>
//                   </th>
//                   <th className="px-6 py-3 text-center text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-center text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                     Action
//                   </th>
//                   <th className="px-6 py-3 text-center text-black text-base leading-2xl tracking-[0.17px] font-medium">
//                     Details
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedData.map((property, index) => (
//                   <tr key={index} className="border-b border-l border-r">
//                     <td className="px-6 py-4 text-left flex items-center text-black text-sm leading-2xl tracking-[0.17px] font-normal">
//                       {property.propertyName}
//                     </td>
//                     <td className="px-6 py-4 text-center text-black text-sm leading-2xl tracking-[0.17px] font-normal">
//                       {property.fractionsBought.toLocaleString()}
//                     </td>
//                     <td className="px-8 py-4 text-black text-center text-sm leading-2xl tracking-[0.17px] font-normal">
//                       {truncateAmount(
//                         String(property.usdcSpent)
//                       ).toLocaleString()}
//                     </td>
//                     <td className="px-8 py-4 text-black text-center text-sm leading-2xl tracking-[0.17px] font-normal">
//                       {truncateAmount(String(property.ethSpent), 6)}
//                     </td>
//                     {/* <td className="px-6 py-4 text-black text-sm leading-2xl tracking-[0.17px] font-normal">
//                       <CountdownTimer endTime={property.timeLeft} />
//                     </td> */}
//                     <td className="px-6 text-center py-4">
//                       <span
//                         className={`px-3 py-1 text-sm leading-2xl tracking-[0.17px] font-normal rounded-full 
//                         ${property.status === "None"
//                             ? "bg-gray-200 text-gray-700"
//                             : property.status === "OnGoing"
//                               ? "bg-blue-200 text-blue-700"
//                               : property.status === "Claim"
//                                 ? "bg-green-200 text-green-700"
//                                 : property.status === "Refund"
//                                   ? "bg-red-200 text-red-700"
//                                   : "bg-gray-200 text-gray-700"
//                           }`}
//                       >
//                         {property.status}
//                       </span>
//                     </td>

//                     <td className="px-6 flex items-center justify-center py-4">
//                       <button
//                         onClick={() => handleClaimProperty(property.propertyId)}
//                         disabled={
//                           loadingPropertyId === property.propertyId ||
//                           property.status === "OnGoing"
//                         }
//                         className={`text-white rounded-full w-16 cursor-pointer py-[6px] flex items-center justify-center ${currentPage === totalPages
//                             ? "bg-primary hover:bg-primary/90"
//                             : "text-gray-400"
//                           }`}
//                       >
//                         {loadingPropertyId === property.propertyId ? (
//                           <Loader />
//                         ) : (
//                           "Claim"
//                         )}
//                       </button>
//                     </td>
//                     <td className="px-6 text-center py-4">
//                       <button
//                         disabled={property.status !== "OnGoing"}
//                         className="bg-[#2892F3] text-white px-4 py-2 rounded-[10px] text-sm font-bold "
//                       >
//                         <Link
//                           href={`/dashboard/primary-marketplace/productdetail/${property.propertyId}`}
//                         >
//                           View
//                         </Link>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {tableDataLoading ? (
//               <div className="border-b p-2 border-l grid-rows-1 grid grid-col-7 gap-10 border-r">
//                 <Skeleton className="h-20" />
//               </div>
//             ) : (
//               paginatedData.length == 0 && (
//                 <div className="border-b border-l p-2 py-8 grid-rows-1 place-content-center grid grid-col-7 gap-10 border-r">
//                   No Pending Shares Available
//                 </div>
//               )
//             )}

//             {/* Pagination Controls */}
//             <div className="w-full flex justify-between sm:flex-row flex-col gap-5 mb-5 items-center mt-4">
//               <div className="flex items-center">
//                 <span className="mr-2">Rows per page:</span>
//                 <select
//                   value={rowsPerPage}
//                   onChange={handleRowsPerPageChange}
//                   className="outline-none p-1 border border-gray-300 rounded"
//                 >
//                   {rowsPerPageOptions.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex items-center gap-3">
//                 <span>
//                   {fromRow}-{toRow} of {totalRows}
//                 </span>

//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className={`pr-2 ${currentPage === 1
//                         ? "text-gray-400 cursor-not-allowed"
//                         : "text-blue-500"
//                       }`}
//                   >
//                     <IoIosArrowBack />
//                   </button>
//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className={` ${currentPage === totalPages
//                         ? "text-gray-400 cursor-not-allowed"
//                         : "text-blue-500"
//                       }`}
//                   >
//                     <IoIosArrowForward />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </UserDashboard>
//   );
// };

// export default PendingShares;
