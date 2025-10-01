"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { FiMinus, FiPlus } from "react-icons/fi";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    image: string;
    sharesOwned: number;
  };
  isListed?: boolean;
  onSellNow?: (quantity: number, price: string) => void;
  onUpdate?: (quantity: number, price: string) => void;
  onAuction?: (quantity: number, price: string) => void;
  loading?: boolean;
}

export default function ListingModal({
  isOpen,
  onClose,
  product,
  isListed = false,
  onSellNow,
  onUpdate,
  onAuction,
  loading = false,
}: ListingModalProps) {
  const [activeTab, setActiveTab] = useState<"sell" | "auction">("sell");
  const [quantity, setQuantity] = useState(1);
  const [sharePrice, setSharePrice] = useState("");

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (product && quantity < product.sharesOwned) {
      setQuantity(quantity + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 1;
    if (product && value <= product.sharesOwned && value >= 1) {
      setQuantity(value);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "sell") {
      if (isListed && onUpdate) {
        onUpdate(quantity, sharePrice);
      } else if (onSellNow) {
        onSellNow(quantity, sharePrice);
      }
    } else if (activeTab === "auction" && onAuction) {
      onAuction(quantity, sharePrice);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="w-[330px] sm:w-[600px] bg-white border border-gray-300 rounded-lg shadow-lg relative">
        {/* Header with Tabs */}
        <div className="p-6 pb-0">
          <div className="flex border-b  mb-6">
            <button
              className={`px-4 py-2 text-base font-medium  border-b-2 transition-colors ${activeTab === "sell"
                  ? "text-[#2892F3] border-[#2892F3]"
                  : "text-[#999999] border-transparent hover:text-[#666666]"
                }`}
              onClick={() => setActiveTab("sell")}
            >
              {isListed ? "Update" : "Sell"} Listing
            </button>
            <button
              className={`px-4 py-2 text-base font-medium  border-b-2 transition-colors ${activeTab === "auction"
                  ? "text-[#2892F3] border-[#2892F3]"
                  : "text-[#999999] border-transparent hover:text-[#666666]"
                }`}
              onClick={() => setActiveTab("auction")}
            >
              Auction Listing
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Product */}
          <div className="flex sm:flex-row flex-col items-center gap-4 mb-6 w-full">
            <Image
              src={product?.image || "/placeholder.svg?height=77&width=108"}
              alt="product"
              width={108}
              height={77}
              className="sm:w-[108px] sm:h-[77px] w-full h-full rounded-[20px] object-cover"
            />
            <div className="flex flex-col gap-2 w-full">
              <h2 className="text-[#292A36] text-lg font-medium  line-clamp-1">
                No. of stakes {isListed ? "to updates" : "to list"}
              </h2>
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <button
                    className="bg-[#2892F3] text-white w-[25px] h-[25px] rounded-lg flex items-center justify-center disabled:opacity-50"
                    disabled={quantity <= 1}
                    onClick={handleDecrement}
                  >
                    <FiMinus className="text-[15px]" />
                  </button>
                  <div className="border border-[#2892F3] rounded-[10px] h-[32px] w-[60px] flex items-center justify-center">
                    <input
                      type="number"
                      placeholder="1"
                      value={quantity}
                      onChange={handleChange}
                      className="text-black text-[15px] font-medium appearance-none  text-center w-full bg-transparent focus:outline-none"
                      min="1"
                      max={product?.sharesOwned || 1}
                    />
                  </div>
                  <button
                    className="bg-[#2892F3] text-white w-[25px] h-[25px] rounded-lg flex items-center justify-center disabled:opacity-50"
                    disabled={product && quantity >= product.sharesOwned}
                    onClick={handleIncrement}
                  >
                    <FiPlus className="text-[15px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <fieldset className="relative border border-black rounded-md py-4 px-3 w-full mb-8">
            <legend className="absolute top-0 left-2 transform -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
              {activeTab === "sell"
                ? isListed
                  ? "New price"
                  : "Sell price"
                : "Bid price"}{" "}
              per share (USDC)
            </legend>
            <input
              type="number"
              name="price"
              min={0.01}
              step="0.01"
              className="w-full border-none outline-none text-[#000000DE] text-base leading-2xl font-normal "
              onChange={(e) => setSharePrice(e.target.value)}
              value={sharePrice}
              placeholder={
                activeTab === "sell" ? "Sell price in USD" : "Bid price in USD"
              }
            />
          </fieldset>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            {!loading && (
              <button
                onClick={onClose}
                className="w-[97px] h-[40px] text-[#2892F3] text-sm font-bold  border border-[#2892F3] rounded-[10px] hover:bg-[#2892F3] hover:text-white transition-colors"
              >
                CANCEL
              </button>
            )}
            <button
              className="bg-[#2892F3] w-[70px] h-[40px] flex items-center justify-center text-sm font-bold  text-white rounded-[10px] hover:bg-[#1e7bd1] transition-colors disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading || !sharePrice}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
