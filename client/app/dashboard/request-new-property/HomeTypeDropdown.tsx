"use client";
import React, { useState } from "react";
import { TiArrowSortedDown } from "react-icons/ti";

interface HomeTypeDropdownProps {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}

const HomeTypeDropdown: React.FC<HomeTypeDropdownProps> = ({
  name,
  value,
  options,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    onChange(name, optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <fieldset
        className="relative border border-black rounded-md py-4 px-3 w-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <legend className="absolute top-0 left-2 transform -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </legend>
        <div className="flex items-center justify-between text-[#000000DE] text-base leading-2xl font-normal ">
          <span>{value || placeholder}</span>
          <TiArrowSortedDown
            className={`text-[#00000099] text-xl transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>
      </fieldset>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-black rounded-md mt-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-[#000000DE] text-base leading-2xl font-normal "
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomeTypeDropdown;
