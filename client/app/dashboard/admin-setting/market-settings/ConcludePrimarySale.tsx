// ConcludePrimarySale.tsx
import Loader from "@/app/components/Loader";
import Pagination from "@/app/components/table/Pagination";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  fetchNftMetadata,
  HandleTxError,
  NotifyError,
  NotifySuccess,
  truncateAmount,
} from "@/app/context/helper";
import {
  _concludePrimarySale,
  _getConcludablePrimaryListings,
} from "@/app/context/helper-market";
import { _getPropertyDetails } from "@/app/context/helper-rwa";
import { ConcludablePrimaryListing, NftMetadata } from "@/app/context/types";
import { DEFAULT_IMAGES } from "@/app/utils/constants";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useAccount } from "wagmi";

const ConcludePrimarySale: React.FC = () => {
  const {
    isFormOwner,
    refreshConcludeableListings,
    particleProvider,
    concludableProperties,
    concludablePropertiesLoading,
  } = useBitStakeContext();
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalItems = concludableProperties.length;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = concludableProperties.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const handleConcludeProperty = async (propertyId: number) => {
    if (!address) {
      NotifyError("Please connect wallet ");
      return;
    }

    try {
      const tx = await _concludePrimarySale({ propertyId, particleProvider });
      if (tx) {
        NotifySuccess("Primary Listing Concluded");
        await refreshConcludeableListings(isFormOwner);
      }
    } catch (error: any) {
      HandleTxError(error);
    }
  };

  return (
    <Card className="overflow-x-auto w-full">
      <div className="flex flex-col justify-center">
        <table className="min-w-full bg-white border-b">
          <thead>
            <tr className="w-full text-base font-medium text-grey-2 border-b">
              <th className="px-6 py-3 text-left w-1/8">Property Name</th>
              <th className="px-6 py-3 text-center w-1/8">Total Fractions</th>
              <th className="px-6 py-3 text-center w-1/8">Fraction Sold</th>
              <th className="px-6 py-3 text-center w-1/8">Stakes Minimum Worth</th>
              <th className="px-6 py-3 text-center w-1/8">Stakes Remaining</th>
              <th className="px-6 py-3 text-center w-1/8">ETH Received</th>
              <th className="px-6 py-3 text-center w-1/8">USDC Received</th>
              <th className="px-6 py-3 text-center w-1/8">Action</th>
            </tr>
          </thead>
          <tbody>
            {!concludablePropertiesLoading &&
              currentRows.map((property, index) => (
                <ConcludePrimarySaleRow
                  key={index}
                  property={property}
                  handleConcludeProperty={handleConcludeProperty}
                />
              ))}
            {concludablePropertiesLoading ? (
              <tr className="w-full text-gray-900 text-sm">
                <td colSpan={100} className="px-6 py-2">
                  <div className="p-2 grid-rows-1 grid grid-col-7 gap-10">
                    <Skeleton className="h-40" />
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.length === 0 && (
                <tr className="w-full text-gray-900 text-sm">
                  <td colSpan={100} className="px-6 py-4">
                    <div className="p-2 py-10 grid-rows-1 place-content-center grid grid-col-7 gap-10 ">
                      No Request Found
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}

      <Pagination
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalItems={totalItems}
        onPageChange={(page) => setCurrentPage(page)}
        onRowsPerPageChange={(r) => {
          setRowsPerPage(r);
          setCurrentPage(1);
        }}
      />
    </Card >
  );
};

export default ConcludePrimarySale;

interface ConcludePrimarySaleRowProps {
  property: ConcludablePrimaryListing;
  handleConcludeProperty: (propertyId: number) => Promise<void>;
}

const ConcludePrimarySaleRow: React.FC<ConcludePrimarySaleRowProps> = ({
  property,
  handleConcludeProperty,
}) => {
  const [concludeLoading, setConcludeLoading] = useState<boolean>(false);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metaData, setMetadata] = useState<NftMetadata | null>(null);

  useEffect(() => {
    const fetchMetadata = async (_id: number) => {
      setMetadataLoading(true);
      try {
        const propertyDetails = await _getPropertyDetails({ propertyId: _id });
        if (propertyDetails === null) {
          setMetadata(null);
          return;
        }

        const metadata: NftMetadata | null = await fetchNftMetadata(
          propertyDetails.uri
        );

        const newMetadata: NftMetadata = {
          description: metadata?.description || "----",
          image: metadata?.image || DEFAULT_IMAGES[0],
          images: metadata?.images || DEFAULT_IMAGES,
          name: metadata?.name || "----",
          attributes: metadata?.attributes || [],
          view3d: metadata?.view3d || "",
          transactionBreakdown: metadata?.transactionBreakdown || [],
          rentalBreakdown: metadata?.rentalBreakdown || [],
          ...(metadata?.location && {
            location: {
              latitude: metadata.location.latitude,
              longitude: metadata.location.longitude,
            },
          }),
        };

        setMetadata(newMetadata);
      } catch (error) {
        console.log("Error fetching metadata", error);
        setMetadata(null);
      } finally {
        setMetadataLoading(false);
      }
    };
    fetchMetadata(property.propertyId);
  }, [property.propertyId]);

  const onConcludeClick = async () => {
    setConcludeLoading(true);
    try {
      await handleConcludeProperty(property.propertyId);
    } finally {
      setConcludeLoading(false);
    }
  };

  return (
    <tr className="w-full border-b">
      <td className="px-6 py-4">
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : (
          metaData?.name ?? "----"
        )}
      </td>
      <td className="px-6 py-4">{property.totalFractions.toLocaleString()}</td>
      <td className="px-6 py-4">{property.fractionSold.toLocaleString()}</td>
      <td className="px-6 py-4">
        $ {property.sharesMinimumWorth.toLocaleString()}
      </td>
      <td className="px-6 py-4">{property.sharesRemaining.toLocaleString()}</td>
      <td className="px-6 py-4">
        {truncateAmount(String(property.ethReceived), 6)} ETH
      </td>
      <td className="px-6 py-4">
        $ {truncateAmount(String(property.usdcReceived)).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <Button disabled={concludeLoading} onClick={onConcludeClick}>
          {concludeLoading ? <Loader /> : "Conclude"}
        </Button>
      </td>
    </tr>
  );
};
