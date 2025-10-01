"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Wallet } from "lucide-react"
import { shortenWalletAddress } from "@/app/context/helper"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface BidModalProps {
    isOpen: boolean
    onClose: () => void
    product: {
        image: string
        pricePerShare: number
        sharesRemaining: number
        noOfShares: number;
        basePrice?: number
        highestBid: number | null
        highestBidder: string | null
        isHighestBidder?: boolean
    }
    quantity: number
    onQuantityChange: (quantity: number) => void
    onBid: (bidPrice: string) => void
    loading?: boolean
}

export default function BidModal({
    isOpen,
    onClose,
    product,
    onBid,
    loading = false,
}: BidModalProps) {
    // — Store as string for the input —
    const [bidPrice, setBidPrice] = useState<string>(
        product?.basePrice?.toString() || ""
    )

    // If product changes, reset the input
    useEffect(() => {
        setBidPrice(product?.basePrice?.toString() || "")
    }, [product?.basePrice])

    const handleBidSubmit = () => {
        const parsed = parseFloat(bidPrice)
        if (!isNaN(parsed) && parsed > 0) {
            // pass string or number, depending on your prop signature
            onBid(bidPrice)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex top-0 left-0 bottom-0 right-0 items-center justify-center z-50 bg-black bg-opacity-40">
            <Card className="w-[330px] sm:w-[600px]">
                <CardContent className="space-y-4">
                    {/* Header */}
                    <h2 className="text-2xl font-bold  text-black">Bid on Listing</h2>
                    <div className="w-full h-full">
                        <Image
                            src={(product?.image as string) || "/placeholder.svg?height=77&width=108"}
                            alt="product"
                            width={500}
                            height={500}
                            className="w-full object-cover h-40 3xl:h-48 rounded-2xl"
                        />
                    </div>

                    {/* Product and Quantity */}
                    <div className="flex sm:flex-row flex-col items-center gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-black text-xl font-bold line-clamp-1">
                                No. of stakes in auction: <span>{(product?.noOfShares ?? 0)}</span>
                            </h2>
                        </div>
                    </div>

                    {/* Bid Price Input */}
                    <div className="space-y-3">
                        <Label>
                            Starting Bid price (USDC)
                        </Label>
                        <Input
                            type="number"
                            // HTML min can stay as number
                            min={product?.basePrice}
                            step="0.01"
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                            placeholder={
                                product?.basePrice
                                    ? `Starting bid price is ${product.basePrice}`
                                    : "Enter your bid"
                            }
                        />
                    </div>

                    {/* Price Information */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold  text-black">Price Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Base Price */}
                            <div className="border  rounded-lg p-4">
                                <p className="text-base text-black mb-2">Base Price</p>
                                <p className="text-2xl space-x-1 font-bold text-black">
                                    <span className="text-primary">{`$${product?.basePrice?.toLocaleString()}` || "--"}</span>{" "}
                                </p>
                            </div>

                            {/* Highest Bid */}
                            <div className="border  rounded-lg p-4">
                                <p className="text-base text-black mb-2">Highest Bid</p>
                                <p className="text-2xl space-x-1 font-bold text-black">
                                    <span className="text-Green">{product?.highestBid === 0 ? "--" : `$${product?.highestBid?.toLocaleString()}`}</span>{" "}
                                </p>
                                {product?.highestBidder && (
                                    <p className="text-sm text-grey-2 mt-1 flex items-center gap-2">
                                        <Wallet size={16} />
                                        {product?.highestBidder && product.highestBidder !== "0x0000000000000000000000000000000000000000"
                                            ? shortenWalletAddress(product.highestBidder)
                                            : "--"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-4 w-full">
                        <Button
                            onClick={onClose}
                            variant='outline'
                            className="w-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBidSubmit}
                            disabled={parseFloat(bidPrice) <= 0 || isNaN(parseFloat(bidPrice))}
                            loading={loading}
                            className="w-full"
                        >
                            Place Bid
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
