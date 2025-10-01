"use client";

import { useEffect, useState } from "react";
import { _validateForm } from "../context/helper-form";
import {
  fetchNftMetadata,
  HandleTxError,
  NotifySuccess,
} from "../context/helper";
import Link from "next/link";
import Loader from "./Loader";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "../context/BitstakeContext";
import { FormRequestedType, NftMetadata } from "../context/types";
import { DEFAULT_IMAGES } from "../utils/constants";
import { Grip } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DescriptionModal } from "./DescriptionModal";

interface TableRowProps {
  form: FormRequestedType;
}

const TableRow = ({ form }: TableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rejectingFormLoading, setRejectingFormLoading] = useState(false);
  const [validatingFormLoading, setValidatingFormLoading] = useState(false);
  const [hardCapPercentInput, setHardCapPercentInput] = useState<string>("19");

  const { refreshAllRequestedForms, particleProvider, isFormOwner } =
    useBitStakeContext();

  const { address: account } = useAccount();

  const MAXWORDS = 30;

  const handleValidateForm = async (payload: {
    action: boolean;
    requestNo: number;
    hardCapPercent: string;
  }) => {
    try {
      if (!account) throw new Error("Please connect wallet ");

      if (
        (payload.action && !payload.hardCapPercent) ||
        parseFloat(payload.hardCapPercent) <= 0 ||
        parseFloat(payload.hardCapPercent) > 100
      )
        throw new Error("Invalid property percentage ");

      if (payload.action) setValidatingFormLoading(true);
      else setRejectingFormLoading(true);

      const tx = await _validateForm({
        requestNo: payload.requestNo,
        hardCapPercent: payload.hardCapPercent
          ? parseFloat(payload.hardCapPercent)
          : 0, // 0 -- 100
        action: payload.action,
        particleProvider,
      });

      NotifySuccess("Transaction Successful");
      if (tx) {
        await refreshAllRequestedForms(isFormOwner);
      }
    } catch (error) {
      HandleTxError(error);
    } finally {
      if (payload.action) setValidatingFormLoading(false);
      else setRejectingFormLoading(false);
    }
  };

  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metaData, setMetadata] = useState<NftMetadata | null>(null);

  const truncatedDescription =
    metaData && metaData?.description?.length > MAXWORDS
      ? `${metaData?.description.substring(0, MAXWORDS)}...`
      : metaData?.description;

  useEffect(() => {
    const fetchMetadata = async (_uri: string) => {
      setMetadataLoading(true);
      try {
        const metadata: NftMetadata | null = await fetchNftMetadata(_uri);

        const newMetadata = {
          description: metadata?.description || "----",
          image: metadata?.image || DEFAULT_IMAGES[0],
          images: metadata?.images || DEFAULT_IMAGES,
          name: metadata?.name || "----",
          attributes: metadata?.attributes || [],
          documents: metadata?.documents || [],
          view3d: metadata?.view3d || "",
          transactionBreakdown: metadata?.transactionBreakdown || [],
          rentalBreakdown: metadata?.rentalBreakdown || [],
        };

        setMetadata(newMetadata);
      } catch (error) {
        console.log("Error fetching metadata", error);
      } finally {
        setMetadataLoading(false);
      }
    };
    fetchMetadata(form.uri);
  }, [form.uri]);

  return (
    <tr className="overflow-x-scroll w-full">
      <td className="px-3 sm:px-6 py-4 border-b ">
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : (
          metaData?.name ?? "----"
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : metaData?.attributes[0]?.value ? (
          metaData?.attributes[0]?.value
        ) : (
          "----"
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : metaData?.attributes[1]?.value ? (
          metaData?.attributes[1]?.value
        ) : (
          "----"
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        {form.fractions.toLocaleString()}
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        {form.fractionPrice.toLocaleString()} USD
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        {" "}
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : metaData?.attributes[2]?.value ? (
          metaData?.attributes[2]?.value
        ) : (
          "----"
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        {" "}
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : metaData?.attributes[3]?.value ? (
          metaData?.attributes[3]?.value
        ) : (
          "----"
        )}
      </td>
      <td
        className={`px-6 py-4 border-b  flex-wrap overflow-hidden ${isExpanded && "h-[200px]"
          }`}
      >
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : (
          <>
            <p
              className={`text-wrap min-w-[100px] w-[150px]`}
            >
              {isExpanded ? metaData?.description : truncatedDescription}
            </p>
            {metaData && metaData?.description?.length > MAXWORDS && (
              <DescriptionModal
                title={metaData.name}
                description={metaData.description}
              />
            )}
          </>
        )}
      </td>

      <td className="px-2 sm:px-4 py-2 border-b  text-left">
        {metadataLoading ? (
          <Skeleton className="w-full h-10" />
        ) : metaData?.documents && metaData.documents.length > 0 ? (
          <Popover>
            <PopoverTrigger>
              {/* <button type="button" className="focus:outline-none"> */}
              <Grip size={24} />
              {/* </button> */}
            </PopoverTrigger>
            <PopoverContent>
              {metaData.documents.map((doc, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <Link
                    href={doc.url}
                    target="_blank"
                    className="text-black flex items-center gap-2 hover:text-blue-700 transition-all ease-in-out duration-300 hover:duration-300"
                  >
                    <Image
                      src="/assets/pdf.png"
                      alt="pdf image"
                      width={100}
                      height={100}
                      className="w-10 h-10"
                    />
                    <p className="">{doc.fileName}</p>
                  </Link>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        ) : (
          "----"
        )}
      </td>

      <td className="px-6 py-4 border-b ">
        <div className="w-full flex items-center justify-center">
          <Input
            type="number"
            min={0}
            max={100}
            value={hardCapPercentInput}
            onChange={(e) => setHardCapPercentInput(e.target.value)}
          />
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 border-b ">
        <div className="h-full w-full flex items-center justify-center gap-2">
          <Button
            disabled={validatingFormLoading || rejectingFormLoading}
            onClick={() => {
              handleValidateForm({
                action: false,
                requestNo: form.serialNo,
                hardCapPercent: hardCapPercentInput,
              });
            }}
            variant='destructive'
          >
            {rejectingFormLoading ? <Loader /> : "✕"}
          </Button>
          <Button
            disabled={
              validatingFormLoading ||
              rejectingFormLoading ||
              hardCapPercentInput == ""
            }
            onClick={() => {
              handleValidateForm({
                action: true,
                requestNo: form.serialNo,
                hardCapPercent: hardCapPercentInput,
              });
            }}
            variant='success'
          >
            {validatingFormLoading ? <Loader /> : "✓"}
          </Button>
        </div>
      </td>
    </tr>
  );
};

interface TableProps {
  currentRows: FormRequestedType[];
  loading: boolean;
}

const PendingForms = ({ currentRows, loading }: TableProps) => {
  // console.log("🚀 ~ PendingForms ~ currentRows:", currentRows)

  // const { refreshAllRequestedForms, isFormOwner } = useBitStakeContext();

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white border-b">
        <thead>
          <tr className="text-nowrap text-grey-2 text-base overflow-x-auto w-full">
            <th className="px-3 sm:px-6 py-3 border-b text-left ">
              Property Name
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              City
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Country
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Fractions
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Fraction Price
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Property Type
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Home Type
            </th>
            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Description
            </th>

            <th className="px-2 sm:px-4 py-2 border-b text-center  ">
              Documents
            </th>

            <th className="px-2 sm:px-4 py-2 border-b text-center  ">
              % to be sold
            </th>

            <th className="px-3 sm:px-6 py-3 border-b text-center  ">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr>
            <td colSpan={100} className="text-center h-40 p-2">
              <Skeleton className="h-40 col-span-full w-full" />
            </td>
          </tr> : currentRows.length > 0 ? (
            currentRows.map((form) => (
              // <div className="as" key={1}>test</div>
              <TableRow key={form.serialNo} form={form} />
            ))
          ) : (
            <tr>
              <td colSpan={100} className="text-center h-40 p-2">
                No Pending Requests Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingForms;
