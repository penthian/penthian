/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselDots,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '../ui/carousel';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageSliderProps {
    images: string[];
    className?: string;
}

export default function ImageSlider({ images, className }: ImageSliderProps) {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [cursorStyle, setCursorStyle] = React.useState('grab');

    // State to hold the Embla Carousel API
    const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null);

    // useRef to store the interval ID for cleanup
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Cursor style logic
    React.useEffect(() => {
        const embla = carouselRef.current;

        if (embla) {
            const emblaContainer = embla as HTMLDivElement;

            const handleMouseDragStart = (e: MouseEvent) => {
                e.preventDefault();
                setCursorStyle('grabbing');
            };
            const handleMouseDragEnd = () => setCursorStyle('grab');

            const handleTouchDragStart = (e: TouchEvent) => {
                e.preventDefault();
                setCursorStyle('grabbing');
            };
            const handleTouchDragEnd = () => setCursorStyle('grab');

            emblaContainer.addEventListener('mousedown', handleMouseDragStart);
            emblaContainer.addEventListener('mouseup', handleMouseDragEnd);
            emblaContainer.addEventListener('mouseleave', handleMouseDragEnd);
            emblaContainer.addEventListener('touchstart', handleTouchDragStart);
            emblaContainer.addEventListener('touchend', handleTouchDragEnd);

            return () => {
                emblaContainer.removeEventListener('mousedown', handleMouseDragStart);
                emblaContainer.removeEventListener('mouseup', handleMouseDragEnd);
                emblaContainer.removeEventListener('mouseleave', handleMouseDragEnd);
                emblaContainer.removeEventListener('touchstart', handleTouchDragStart);
                emblaContainer.removeEventListener('touchend', handleTouchDragEnd);
            };
        }
    }, [carouselRef]);

    // Set up auto-scroll to next slide every 3 seconds with looping
    React.useEffect(() => {
        if (!carouselApi) return;

        const startAutoScroll = () => {
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Set up a new interval
            intervalRef.current = setInterval(() => {
                if (!carouselApi) return;

                const selectedIndex = carouselApi.selectedScrollSnap();
                const totalSlides = carouselApi.scrollSnapList().length;

                if (selectedIndex === totalSlides - 1) {
                    carouselApi.scrollTo(0); // Loop back to the first slide
                } else {
                    carouselApi.scrollNext();
                }
            }, 3000); // 3000 milliseconds = 3 seconds
        };

        startAutoScroll();

        // Optional: Pause auto-scroll on hover
        const handleMouseEnter = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleMouseLeave = () => {
            startAutoScroll();
        };

        const emblaContainer = carouselRef.current;
        if (emblaContainer) {
            emblaContainer.addEventListener('mouseenter', handleMouseEnter);
            emblaContainer.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            // Clean up the interval on unmount
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (emblaContainer) {
                emblaContainer.removeEventListener('mouseenter', handleMouseEnter);
                emblaContainer.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [carouselApi]);

    return (
        <Carousel
            ref={carouselRef}
            setApi={setCarouselApi}
            className={cn(`relative w-full max-w-full shadow-card rounded-3xl bg-transparent overflow-hidden`,
                cursorStyle,
                className
            )}
        >
            <CarouselContent className='h-full'>
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <CarouselItem key={index} className="w-full cursor-grab border-none">
                            <div className="relative flex w-full justify-center rounded-3xl items-center border-none h-80 lg:h-96 3xl:h-[550px]">
                                <Image
                                    src={image}
                                    alt={`Slide ${index}`}
                                    className="w-full h-full object-cover rounded-3xl"
                                    fill
                                    
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/banner_placeholder.png';
                                    }}
                                />
                            </div>
                        </CarouselItem>
                    ))
                ) : (
                    <p>No images available</p>
                )}
            </CarouselContent>
            <CarouselDots />
            <CarouselNext />
            <CarouselPrevious />
        </Carousel>
    );
}
