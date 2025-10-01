"use client";

import React, { useEffect, useState } from "react";
import { NftMetadata, PropertyRequest } from "../context/types";
import { _getRequestDetails } from "../context/helper-form";
import Link from "next/link";
import { fetchNftMetadata } from "../context/helper";
import { DEFAULT_IMAGES } from "../utils/constants";
import { Skeleton } from "./ui/Skeleton";
import { HeadingPara } from "./layout/heading";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import InfoCard from "./dashboard/infoCard";
import { Coins, FileText, HandCoins } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Button } from "./ui/button";
import { useBitStakeContext } from "../context/BitstakeContext";
import { useAccount } from "wagmi";

interface UserRequestedFormsProps {
  userRequestedForms: PropertyRequest[];
  loading: boolean;
}

const UserRequestedFormsTable = ({
  userRequestedForms,
  loading,
}: UserRequestedFormsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-6">
      {userRequestedForms.length > 0 ? (
        userRequestedForms.map((form, index) => (
          <SingleForm key={index} form={form} />
        ))
      ) : !loading && userRequestedForms.length === 0 ? (
        <div className="col-span-3 w-full min-h-[40vh] flex items-center justify-center">
          <p className="shadow-md rounded-lg p-5">No Requests Found</p>
        </div>
      ) : null}
    </div>
  );
};

export default UserRequestedFormsTable;

interface SingleFormProps {
  form: PropertyRequest;
}

const SingleForm = ({ form }: SingleFormProps) => {
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metaData, setMetadata] = useState<NftMetadata | null>(null);

  useEffect(() => {
    const fetchMetadata = async (uri: string) => {
      setMetadataLoading(true);
      try {
        const metadata: NftMetadata | null = await fetchNftMetadata(uri);

        const newMetadata = {
          description: metadata?.description || "----",
          image: metadata?.image || DEFAULT_IMAGES[0],
          images: metadata?.images || DEFAULT_IMAGES,
          name: metadata?.name || "----",
          attributes: metadata?.attributes || [],
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
    <Card key={form.id} className="py-0">
      <CardContent className="space-y-4 3xl:space-y-4 p-4 3xl:p-6">
        <Image
          src={metaData?.image || "/assets/image-not-found.png"}
          alt={metaData?.image || "Property Name"}
          width={500}
          height={200}
          className="rounded-3xl object-cover w-full h-48 3xl:h-56"
        />

        <Badge
          size="md"
          variant={
            form.status === "Accepted"
              ? "green"
              : form.status === "Rejected"
              ? "red"
              : "orange"
          }
        >
          {form.status}
        </Badge>

        <HeadingPara
          classNameTitle="text-lg 3xl:text-xl"
          title={`Request #${form.id}`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          <InfoCard title="Fractions" className="border rounded-2xl" iconTitleClassName="flex-col items-start" Icon={HandCoins} value={formatNumber(form.fractions)} />
          <InfoCard title="Fractions Price" className="border rounded-2xl" iconTitleClassName="flex-col items-start" Icon={Coins} value={`${formatNumber(form.fractionsPrice)}`} />
          <InfoCard title="Asset Type" className="border rounded-2xl" iconTitleClassName="flex-col items-start" Icon={Coins} value={metaData?.attributes[2].value} />

          <InfoCard
            title="Discription"
            className="border rounded-2xl md:col-span-full"
            iconTitleClassName="flex-col items-start"
            Icon={FileText}
            value={metaData?.description}
          />
        </div>

        <div className="flex w-full items-center gap-4 flex-col sm:flex-row justify-center">
          { form.status === "Accepted" && form?.acceptedPropertyId ? (
            <Link
              href={`/dashboard/request-new-property/edit-property/${form?.acceptedPropertyId}`} className="w-full" passHref
            >
              <Button variant='outline' className="w-full">
                Edit
              </Button>
            </Link>
          ) : <Button variant='outline' className="w-full" disabled>
            Edit
          </Button>
          }

          {form.status === "Accepted" && form?.acceptedPropertyId ? (
            <Link
              href={`/dashboard/primary-marketplace/productdetail/${form?.acceptedPropertyId}`}
              className="w-full"
            >
              <Button className="w-full">
                View More
              </Button>
            </Link>
          ) : <Button className="w-full" disabled>
            View More
          </Button>
          }
        </div>
      </CardContent>
    </Card>
  );
};
