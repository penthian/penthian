'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import PriceDropdown from './PriceDropdown';
import PropertyTypeModal from './PropertyTypeModal';
import BedsAndSqftModal from './BedsAndSqftModal';
import PriceRangeModal from './PriceRangeModal';
import CountryPopup from './CountryPopup';

const Filters = () => {
    // Price
    const [selectedOption, setSelectedOption] = useState<string>('Price: Low To High');

    const handleSelect = (option: string) => {
        setSelectedOption(option);
    };

    // Property Type Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);



    return (
        <div className="  my-3 border-y border-[#DDDDDD] py-5 flex items-center justify-center   w-full flex-wrap gap-5">
            {/* Property Type */}
            <div className='w-full sm:w-[168px]'>
                <button className="w-full sm:w-[168px] h-[36px] bg-[#F7F9FA] border border-[#DDDDDD] rounded-[30px] text-primary-grey text-[13px] font-semibold flex items-center justify-between px-[20px] sm:justify-center gap-2" onClick={openModal}>
                    Property Type <Image src="/assets/icons/arrow.svg" alt="Arrow" width={17} height={17} />
                </button>
                <PropertyTypeModal isOpen={isModalOpen} onClose={closeModal} />
            </div>

            {/* Search */}
            <div className="flex items-center justify-between gap-2 sm:max-w-[280px] w-full border border-[#DDDDDD] bg-[#F7F9FA] px-[18px] py-[8px] rounded-[30px]">
                <input type="text" placeholder="Search by Name" className="bg-transparent outline-none text-[13px] placeholder:font-semibold placeholder:text-primary-grey text-black font-normal" />
                <BiSearch className="text-primary-grey text-lg" />
            </div>

            {/* Country */}
            <CountryPopup />

            {/* Price */}
            <PriceDropdown options={['Price: Low To High', 'Price: High To Low']} selected={selectedOption} onSelect={handleSelect} />

            <button className="text-[#6B7380] text-[13px] font-semibold">Clear all filters</button>
        </div>
    );
};

export default Filters;
