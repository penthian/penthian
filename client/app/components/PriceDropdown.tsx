'use client'
import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

interface DropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const PriceDropdown: React.FC<DropdownProps> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative sm:w-[195px] w-full">
      <div className="flex items-center justify-between gap-2 border border-[#DDDDDD] bg-[#F7F9FA] px-[18px] py-[8px] rounded-[30px]" onClick={handleToggle}>
        <h3 className="text-[12.8px] font-bold text-primary-grey pr-2.5 border-r-2 border-[#DDDDDD]">{selected}</h3>
        <IoIosArrowDown className="text-primary-grey text-xl" />
      </div>
      {isOpen && (
        <div className="w-full absolute z-10 top-12 bg-white border border-[#DDDDDD] rounded-[8px] text-left">
          {options.map(option => (
            <h3
              key={option}
              className={`text-base font-medium py-2 px-3 ${selected === option ? 'bg-[#2892F3] text-white' : 'hover:bg-[#2891f34e]'}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </h3>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceDropdown;
