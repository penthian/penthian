import React from "react";
import SingleSecondaryListing from "./SecondaryListing";

const ProductDetail: React.FC = () => {

  return (
<SingleSecondaryListing/>
  );
};

export default ProductDetail;

export async function generateStaticParams() {
    // Create an array of string IDs: ["0", "1", "2", ..., "100"]
    const listings = Array.from({ length: 101 }, (_, i) => i.toString());

  return listings.map((id) => ({
    id,
  }));
}
