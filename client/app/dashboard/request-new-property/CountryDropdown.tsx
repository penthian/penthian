"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { TiArrowSortedDown } from "react-icons/ti";
import { Country } from "country-state-city";

export interface CountryOption {
  isoCode: string;
  name: string;
}

interface CountryDropdownProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  name,
  value,
  onChange,
  placeholder = "Select a country",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all = Country.getAllCountries().map((c) => ({
      isoCode: c.isoCode,
      name: c.name,
    }));
    setCountries(all);
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = countries.find((c) => c.isoCode === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <fieldset
        className="relative border border-black rounded-md py-4 px-3 w-full cursor-pointer"
        onClick={() => setIsOpen((o) => !o)}
      >
        <legend className="absolute top-0 left-2 -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
          {name[0].toUpperCase() + name.slice(1)}
        </legend>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-[#00000099]" />
            <span>{selected?.name || placeholder}</span>
          </div>
          <TiArrowSortedDown
            className={`text-xl text-[#00000099] transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </fieldset>

      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search country…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border rounded focus:outline-none"
            />
          </div>

          {filtered.map((c) => (
            <div
              key={c.isoCode}
              onClick={() => {
                onChange(name, c.isoCode);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {c.name}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-grey-5">No matches</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;
