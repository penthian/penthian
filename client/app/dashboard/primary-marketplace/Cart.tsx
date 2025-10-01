"use client";
import { Product } from "@/app/context/types";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

interface CartProps {
  cartItems: Product[];
  updateCart: (updatedItems: Product[]) => void; // Callback to update cart from parent
}

const Cart: React.FC<CartProps> = ({ cartItems, updateCart }) => {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const initialQuantities = cartItems.reduce((acc, item) => {
      acc[item.propertyId] = item.quantity || 1; // Initialize with item quantity
      return acc;
    }, {} as { [key: number]: number });

    setQuantities(initialQuantities);
  }, [cartItems]);

  const increment = (id: number) => {
    setQuantities((prev) => {
      const newQuantities = { ...prev, [id]: (prev[id] || 1) + 1 };
      updateCartFromQuantities(newQuantities);
      return newQuantities;
    });
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
        updateCart(cartItems.filter((item) => item.propertyId !== id));
        return updatedQuantities;
      }
    });
  };

  const handleInputChange = (id: number, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantities((prev) => {
        const newQuantities = { ...prev, [id]: newQuantity };
        updateCartFromQuantities(newQuantities);
        return newQuantities;
      });
    }
  };

  const updateCartFromQuantities = (updatedQuantities: {
    [key: number]: number;
  }) => {
    updateCart(
      cartItems.map((item) => ({
        ...item,
        quantity: updatedQuantities[item.propertyId] || 1,
      }))
    );
  };

  const parsePrice = (price: string) => {
    // Remove 'USD' and any non-numeric characters, then convert to number
    return parseFloat(price.replace(/[^0-9.-]+/g, ""));
  };

  const formatPrice = (price: number) => {
    // Format the price with 2 decimal places and add 'USD' text
    return `${price.toFixed(2)} USD`;
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
    <div>
      {hasItems ? (
        <>
          {cartItems.map((item) => (
            <div
              key={item.propertyId}
              className="flex sm:flex-row flex-col items-center gap-4 mb-6"
            >
              <Image
                src={item.image}
                alt={item.image}
                width={108}
                height={77}
                className="sm:w-[108px] sm:h-[77px] w-full h-full"
              />
              <div className="flex flex-col gap-2">
                <h2 className="text-[#292A36] text-lg font-medium  line-clamp-1">
                  {item.name}
                </h2>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrement(item.propertyId)}
                      className="bg-[#2892F3] text-white w-[25px] h-[25px] rounded-lg flex items-center justify-center"
                    >
                      <FiMinus className="text-[15px]" />
                    </button>
                    <div className="border border-[#2892F3] rounded-[10px] h-[32px] w-[60px] flex items-center justify-center">
                      <input
                        type="number"
                        value={quantities[item.propertyId] || 1}
                        onChange={(e) =>
                          handleInputChange(item.propertyId, e.target.value)
                        }
                        className="text-black text-[15px] font-medium appearance-none  text-center w-full bg-transparent focus:outline-none custom-number-input"
                      />
                    </div>
                    <button
                      onClick={() => increment(item.propertyId)}
                      className="bg-[#2892F3] text-white w-[25px] h-[25px] rounded-lg flex items-center justify-center"
                    >
                      <FiPlus className="text-[15px]" />
                    </button>
                  </div>

                  <h3 className="text-[#292A36] text-[15px] font-bold ">
                    {formatPrice(
                      item.pricePerShare * (quantities[item.propertyId] || 1)
                    )}
                  </h3>
                </div>
              </div>
            </div>
          ))}

          {/* Total Price */}
          <div className="py-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl leading-[30px] font-medium ">
              Total
            </h2>
            <h2 className="text-2xl leading-[30px] font-bold ">
              {formatPrice(calculateTotal())}
            </h2>
          </div>

          <button className="bg-[#2892F3] w-full h-[40px] rounded-[10px] flex items-center justify-center gap-3 text-base leading-base font-bold  text-white">
            <Image
              src="/assets/icons/shopping-cart.svg"
              alt="shopping-cart"
              width={24}
              height={24}
            />{" "}
            Buy
          </button>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
