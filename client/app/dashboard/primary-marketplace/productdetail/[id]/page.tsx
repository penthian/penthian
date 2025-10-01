import React, { Suspense } from "react";
import PrimaryListing from "./PrimaryListing";
import { ProductDetailSkeleton } from "@/app/components/ui/SkeletonCard";

const ProductDetail: React.FC = () => {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <PrimaryListing />
    </Suspense>
  );
};

export default ProductDetail;

export async function generateStaticParams() {
  const listings = Array.from({ length: 101 }, (_, i) => i.toString());

  return listings.map((id) => ({
    id,
  }));
}
