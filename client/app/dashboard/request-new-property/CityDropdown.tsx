"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { TiArrowSortedDown } from "react-icons/ti";
import { City, ICity } from "country-state-city";

export interface CityOption {
  name: string;
  stateCode: string;
}

interface CityDropdownProps {
  name: string;
  value: string;
  country: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}

const CityDropdown: React.FC<CityDropdownProps> = ({
  name,
  value,
  country,
  onChange,
  placeholder = "Select a city",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const loadCities = useCallback(() => {
    if (!country) return setCities([]);
    const all: ICity[] = City.getCitiesOfCountry(country) || [];
    setCities(all.map((c) => ({ name: c.name, stateCode: c.stateCode })));
  }, [country]);

  useEffect(loadCities, [loadCities]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen]);

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={ref}>
      <fieldset
        className="relative border border-black rounded-md py-4 px-3 w-full cursor-pointer"
        onClick={() => country && setIsOpen((o) => !o)}
      >
        <legend className="absolute top-0 left-2 -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
          {name[0].toUpperCase() + name.slice(1)}
        </legend>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-[#00000099]" />
            <span>{value || placeholder}</span>
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
              placeholder="Search city…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border rounded focus:outline-none"
            />
          </div>

          {filtered.map((c, i) => (
            <div
              key={`${c.name}-${c.stateCode}-${i}`}
              onClick={() => {
                onChange(name, c.name);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {c.name} {c.stateCode && `(${c.stateCode})`}
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

export default CityDropdown;
