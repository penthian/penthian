"use client";
import React, { useState } from "react";
import Image from "next/image";
import { IoClose } from "react-icons/io5";

const PriceRangeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsOpen(false);
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="relative sm:w-[152px] w-full">
      <button
        className="sm:w-[152px] w-full h-[36px] bg-[#F7F9FA] border border-[#DDDDDD] rounded-[30px] text-primary-grey text-[13px] font-semibold flex items-center  justify-between px-[20px] sm:justify-center gap-2"
        onClick={togglePopup}
      >
        Price Range
        <Image
          src="/assets/icons/arrow.svg"
          alt="Arrow"
          width={17}
          height={17}
        />
      </button>

      {isOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 px-4"
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-[350px] w-full relative px-5 py-5"
            onClick={handleModalClick}
          >
            <div className="flex items-end justify-end gap-2">
              <button
                onClick={togglePopup}
                className="text-black text-xl"
              >
                <IoClose className="min-w-[35px] min-h-[35px] hover:rotate-180 duration-200 rotate-0" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold">Real Estate NFT price</h3>
              <div className="w-full flex items-start justify-between gap-4 my-4">
                <div className="h-[50px] bg-[#F7F9FA] flex items-center justify-center gap-2 px-4 rounded-[15px]">
                  <input type="number" placeholder="No Min %" className="w-[80%] bg-transparent outline-none text-sm placeholder:text-black font-medium text-black" />
                  <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </div>
                <div className="h-[50px] bg-[#F7F9FA] flex items-center justify-center gap-2 px-4 rounded-[15px]">
                  <input type="number" placeholder="No Max %" className="w-[80%] bg-[#F7F9FA] outline-none placeholder:text-black text-sm font-medium text-black" />
                  <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </div>
              </div>

              <h3 className="text-xl font-bold">Expected Dividend Yield</h3>
              <div className="w-full flex items-start justify-between gap-4 my-4">
                <div className="h-[50px] bg-[#F7F9FA] flex items-center justify-center gap-2 px-4 rounded-[15px]">
                  <input type="number" placeholder="No Min %" className="w-[80%] bg-transparent outline-none text-sm placeholder:text-black font-medium text-black" />
                  <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </div>
                <div className="h-[50px] bg-[#F7F9FA] flex items-center justify-center gap-2 px-4 rounded-[15px]">
                  <input type="number" placeholder="No Max %" className="w-[80%] bg-[#F7F9FA] outline-none placeholder:text-black text-sm font-medium text-black" />
                  <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </div>
              </div>

              <h3 className="text-xl font-bold">Expected Return after 5 years</h3>
              <div className="w-full flex items-start justify-between gap-4 my-4">
                <div className="h-[50px] bg-[#F7F9FA] flex items-center justify-center gap-2 px-4 rounded-[15px]">
                  <input type="number" placeholder="No Min %" className="w-[80%] bg-transparent outline-none text-sm placeholder:text-black font-medium text-black" />
                  <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </div>
                <div className="h-[50px] bg-[#F7F9FA] flex items-center justify-center gap-2 px-4 rounded-[15px]">
                  <input type="number" placeholder="No Max %" className="w-[80%] bg-[#F7F9FA] outline-none placeholder:text-black text-sm font-medium text-black" />
                  <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </div>
              </div>
            </div>

            <div className="mt-2 w-full flex items-center justify-between gap-3">
              <button className="text-[#2892F3] w-full h-[45px] border border-[#2892F3] rounded-[15px] font-semibold text-base">Reset</button>
              <button onClick={togglePopup} className="bg-[#2892F3] text-white w-full h-[45px] border border-[#2892F3] rounded-[15px] font-semibold text-base">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PriceRangeModal