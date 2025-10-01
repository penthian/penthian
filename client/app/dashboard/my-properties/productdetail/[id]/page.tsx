
import React from "react";
import MyProperty from "./MyProperty";

const SingleProduct: React.FC = () => {
  return <MyProperty />;
};

export default SingleProduct;

export async function generateStaticParams() {
  // Create an array of string IDs: ["0", "1", "2", ..., "100"]
  const properties = Array.from({ length: 101 }, (_, i) => i.toString());

  return properties.map((id) => ({
    id,
  }));
}

