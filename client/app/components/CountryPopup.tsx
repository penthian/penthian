"use client";
import React, { useState } from "react";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";


const CountryPopup: React.FC = () => {
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCountry = (country: React.SetStateAction<string>) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false); // Close the dropdown after selecting a country
  };

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedCountry(e.target.value);
  };


  return (
    <div className="relative sm:w-[125px] w-full">
      <button
        className="w-full sm:w-[125px] h-[36px] bg-[#F7F9FA] border border-[#DDDDDD] rounded-[30px] text-primary-grey text-[13px] font-semibold flex items-center  justify-between px-[20px] sm:justify-center gap-2"
        onClick={togglePopup}
      >
        Country
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
            className="bg-white rounded-lg shadow-lg max-w-[350px] w-full relative"
            onClick={handleModalClick}
          >
            <div className="flex items-center justify-between gap-2 py-5 px-5 border-b">
              <h3 className="text-2xl font-bold">Choose Country</h3>
              <button
                onClick={togglePopup}
                className="text-black text-xl"
              >
                <IoClose className="min-w-[35px] min-h-[35px] hover:rotate-180 duration-200 rotate-0" />
              </button>
            </div>

            <div className="mt-5 w-full pb-6 px-5 relative">
              <div onClick={toggleDropdown} className="border border-custom rounded-[50px] h-[40px] flex items-center justify-between px-4">
                <input value={selectedCountry} onChange={handleInputChange} type="text" placeholder="Select..." className=" outline-none bg-transparent placeholder:font-bold text-base placeholder:text-[#333333ac] w-full mr-2 pr-4 border-r border-[#CCCCCC]" />
                <IoIosArrowDown className="text-[#cccccc] text-xl" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-12 left-0 border border-custom bg-white w-[89%] mx-5 rounded pt-1">
                  <h3 className="py-2.5 px-3 font-bold active:bg-[#2891f34e] hover:bg-[#CCCCCC] border-b border-black" onClick={() => selectCountry('United Kingdom')}>United Kingdom</h3>
                  <h3 className="py-2.5 px-3 font-bold active:bg-[#2891f34e] hover:bg-[#CCCCCC] border-b border-black" onClick={() => selectCountry('Italy')}>Italy</h3>
                  <h3 className="py-2.5 px-3 font-bold active:bg-[#2891f34e] hover:bg-[#CCCCCC] border-b border-black" onClick={() => selectCountry('Sweden')}>Sweden</h3>
                  <h3 className="py-2.5 px-3 font-bold active:bg-[#2891f34e] hover:bg-[#CCCCCC] border-b border-black" onClick={() => selectCountry('Germany')}>Germany</h3>
                  <h3 className="py-2.5 px-3 font-bold active:bg-[#2891f34e] hover:bg-[#CCCCCC] border-b border-black" onClick={() => selectCountry('Spain')}>Spain</h3>
                  <h3 className="py-2.5 px-3 font-bold active:bg-[#2891f34e] hover:bg-[#CCCCCC] border-b border-black" onClick={() => selectCountry('United States of America')}>United States of America</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryPopup