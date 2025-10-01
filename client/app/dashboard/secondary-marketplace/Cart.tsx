"use client";
import { HeadingPara } from "@/app/components/layout/heading";
import Loader from "@/app/components/Loader";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  NotifyError,
  NotifySuccess,
  truncateAmount,
} from "@/app/context/helper";
import { _bulkBuySecondarySale } from "@/app/context/helper-market";
import {
  approveUsdcSpender,
  getUsdcAllowance,
} from "@/app/context/helper-usdc";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { Product, Purchase } from "@/app/context/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FiMinus, FiPlus, FiTrash } from "react-icons/fi";
import { useAccount } from "wagmi";

interface CartProps {
  cartItems: Product[];
  setCartItems: (updatedItems: Product[]) => void; // Callback to update cart from parent
  handleReset: () => Promise<void>; // Callback to update cart from parent
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  setCartItems,
  handleReset,
}) => {
  const { particleProvider } = useBitStakeContext();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { address: account } = useAccount();
  const { kycStatus, openModal } = useKYCModal();

  useEffect(() => {
    const initialQuantities = cartItems.reduce((acc, item) => {
      acc[item.propertyId] = item.quantity || 1; // Initialize with item quantity
      return acc;
    }, {} as { [key: number]: number });

    setQuantities(initialQuantities);
  }, [cartItems]);

  const increment = (id: number) => {
    setQuantities((prev) => {
      const item = cartItems.find((item) => item.propertyId === id);
      if (!item) return prev;

      const currentQuantity = prev[id] || 1;
      if (currentQuantity < item.sharesRemaining) {
        const newQuantities = { ...prev, [id]: currentQuantity + 1 };
        updateCartFromQuantities(newQuantities);
        return newQuantities;
      } else {
        NotifyError(
          `Quantity exceeds available shares, max shares (${item.sharesRemaining}).`
        );
        return prev;
      }
    });
  };

  const removeItem = (propertyId: number) => {
    const updatedCartItems = cartItems.filter(
      (item) => item.propertyId !== propertyId
    );
    setCartItems(updatedCartItems);
  };

  const decrement = (id: number) => {
    setQuantities((prev) => {
      const currentQuantity = prev[id] || 1;
      if (currentQuantity > 1) {
        const newQuantities = { ...prev, [id]: currentQuantity - 1 };
        updateCartFromQuantities(newQuantities);
        return newQuantities;
      } else {
        // Remove item if quantity is 1
        const updatedQuantities = { ...prev };
        delete updatedQuantities[id];
        setCartItems(cartItems.filter((item) => item.propertyId !== id));
        return updatedQuantities;
      }
    });
  };

  const handleInputChange = (id: number, value: string) => {
    const newQuantity = parseInt(value, 10);
    const item = cartItems.find((item) => item.propertyId === id);
    if (
      item &&
      !isNaN(newQuantity) &&
      newQuantity > 0 &&
      newQuantity <= item.sharesRemaining
    ) {
      setQuantities((prev) => {
        const newQuantities = { ...prev, [id]: newQuantity };
        updateCartFromQuantities(newQuantities);
        return newQuantities;
      });
    } else {
      NotifyError(
        `Quantity exceeds available shares, max shares (${item?.sharesRemaining}).`
      );
    }
  };

  const updateCartFromQuantities = (updatedQuantities: {
    [key: number]: number;
  }) => {
    setCartItems(
      cartItems.map((item) => ({
        ...item,
        quantity: updatedQuantities[item.propertyId] || 1,
      }))
    );
  };

  const bulkBuy = async () => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      setLoading(true);
      let _properties: Purchase[] | null = [];
      let buyAmount = 0;
      for (let i = 0; i < cartItems.length; i++) {
        const property: Purchase = {
          listingId: cartItems[i].listingId,
          sharesToBuy: cartItems[i].quantity,
        };
        buyAmount += (cartItems[i].quantity ?? 0) * cartItems[i].pricePerShare;
        _properties.push(property);
      }

      const allowance = await getUsdcAllowance({
        owner: account as string,
        spenderType: "market",
      });
      if (buyAmount > allowance) {
        await approveUsdcSpender({
          amount: String(buyAmount),
          particleProvider,
          spenderType: "market",
        });
      }

      await _bulkBuySecondarySale({
        properties: _properties,
        recipient: account as string,
        particleProvider,
      });
      NotifySuccess("Shares Bought Successfully");
      await handleReset();
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    // Format the price with 2 decimal places and add 'USD' text
    return truncateAmount(String(price));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const quantity = quantities[item.propertyId] || 1;
      const price = item.pricePerShare; // Clean price string
      return total + price * quantity;
    }, 0);
  };

  const hasItems = cartItems.length > 0;

  return (
    <div className="space-y-4">
      {hasItems ? (
        <>
          {cartItems.map((item) => (
            <Card
              key={item.propertyId}
              className="flex 3xl:flex-row flex-col items-center gap-4 py-0 relative "
            >
              <Image
                src={item.image}
                alt={item.image}
                width={200}
                height={200}
                className="3xl:w-40 sm:h-32 w-full h-full rounded-2xl"
              />
              <div className="flex flex-col w-full gap-3 pb-4 3xl:pb-0 px-4 3xl:px-0 3xl:pr-2">
                <HeadingPara
                  title={item.name}
                  classNameTitle="text-base xl:text-lg 3xl:text-xl"
                />
                <div className="flex flex-col gap-2">
                  <h3 className="text-black text-lg font-bold">
                    $
                    {formatPrice(
                      item.pricePerShare * (quantities[item.propertyId] || 1)
                    )}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => decrement(item.propertyId)}
                      variant='skyBlue'
                      size='sm'
                      disabled={loading}
                    >
                      <FiMinus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantities[item.propertyId] || 1}
                      onChange={(e) =>
                        handleInputChange(item.propertyId, e.target.value)
                      }
                      className="w-20 h-8 py-3"
                      disabled={loading}
                    />
                    <Button
                      onClick={() => increment(item.propertyId)}
                      variant='skyBlue'
                      size='sm'
                      disabled={loading}
                    >
                      <FiPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    onClick={() => removeItem(item.propertyId)}
                    variant='destructive'
                    size='icon'
                    className="absolute top-1 right-1"
                    disabled={loading}
                  >
                    <FiTrash className="text-[15px]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Total Price */}
          <div className="py-4 3xl:py-8 flex items-center justify-between gap-4">
            <h2 className="text-xl 3xl:text-2xl">Total</h2>
            <h2 className="text-xl 3xl:text-2xl font-bold">
              ${formatPrice(calculateTotal()).toLocaleString()}
            </h2>
          </div>

          <Button
            onClick={bulkBuy}
            loading={loading}
            className="w-full"
          >
            <ShoppingCart />
            Buy Now
          </Button>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )
      }
    </div >
  );
};

export default Cart;
