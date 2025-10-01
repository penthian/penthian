'use client'
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IoClose } from "react-icons/io5";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PropertyTypeModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
    const [selectedHomeTypes, setSelectedHomeTypes] = useState<string[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handlePropertyTypeChange = (type: string) => {
        setSelectedPropertyType(type);
    };

    const handleHomeTypeChange = (type: string) => {
        setSelectedHomeTypes((prevSelected) =>
            prevSelected.includes(type)
                ? prevSelected.filter((t) => t !== type)
                : [...prevSelected, type]
        );
    };

    const handleSelectAll = () => {
        if (selectedHomeTypes.length === 4) {
            setSelectedHomeTypes([]);
        } else {
            setSelectedHomeTypes(['House', 'Apartment', 'Villa', 'Penthouse']);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 px-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-lg max-w-[350px] w-full relative">
                <div className='flex items-center justify-between gap-2 px-5 py-5 border-b'>
                    <h3 className='text-2xl font-bold'>Property Type</h3>
                    <button onClick={onClose} className="text-black text-xl">
                        <IoClose className='min-w-[35px] min-h-[35px] hover:rotate-180 duration-200 rotate-0' />
                    </button>
                </div>
                <div className='px-4 py-6'>
                    <div className='flex items-center gap-7 mb-4 group'>
                        <button
                            className={`text-xs ${selectedPropertyType === 'All' ? 'text-[#2892F3] underline' : 'hover:text-[#2892F3] hover:underline'}`}
                            onClick={() => handlePropertyTypeChange('All')}
                        >
                            All
                        </button>
                        <button
                            className={`flex items-center gap-1.5 text-xs ${selectedPropertyType === 'Rental' ? 'text-[#2892F3] underline' : 'hover:text-[#2892F3] hover:underline'}`}
                            onClick={() => handlePropertyTypeChange('Rental')}
                        >
                            <Image src='/assets/icons/rental.svg' alt='rental' width={13} height={13} />
                            Rental Property
                        </button>
                        <button
                            className={`flex items-center gap-1.5 text-xs ${selectedPropertyType === 'Holiday' ? 'text-[#2892F3] underline' : 'hover:text-[#2892F3] hover:underline'}`}
                            onClick={() => handlePropertyTypeChange('Holiday')}
                        >
                            <Image src='/assets/icons/holiday.svg' alt='holiday' width={22} height={15} className='mt-[-2px]' />
                            Holiday Home
                        </button>
                    </div>
                    <h3 className='text-xl font-bold'>Home Type</h3>
                    <div className='flex items-center gap-3.5 py-5 border-b border-[#DDDDDD]'>
                        <input
                            type='radio'
                            className='w-[21px] h-[21px]'
                            checked={selectedHomeTypes.length === 4}
                            onChange={handleSelectAll}
                        />
                        <h3 className='text-sm'>Select All</h3>
                    </div>
                </div>
                <div className='px-5 pb-12 flex flex-col gap-3.5'>
                    {['House', 'Apartment', 'Villa', 'Penthouse'].map((type) => (
                        <div key={type} className='flex items-center gap-3.5'>
                            <input
                                type='checkbox'
                                className='w-[21px] h-[21px]'
                                checked={selectedHomeTypes.includes(type)}
                                onChange={() => handleHomeTypeChange(type)}
                            />
                            <h3 className='text-sm'>{type}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PropertyTypeModal;
