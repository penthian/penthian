import { MapPin } from "lucide-react";
import React from "react";

interface SliderCardProps {
  imageUrl: string;
  title: string;
  location: string;
  price: string;
}

const SliderCard: React.FC<SliderCardProps> = ({ imageUrl, title, location, price }) => {
  return (
    <div
      className="relative bg-no-repeat text-white bg-contain bg-center bg-fixed self-center flex h-[400px] 3xl:h-[450px] -mx-10 sm:mx-10 md:mx-0 overflow-hidden w-full flex-col items-start justify-between rounded-3xl"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute bottom-[12%] sm:bottom-[12%] left-[24%] xs:left-[28%] sm:left-[10%] md:left-[24%] lg:left-[24%] xl:left-[24%] 3xl:left-[18%] 4xl:left-[25%] 2k:left-[30%] flex flex-col gap-1 sm:gap-2 md:gap-3">
        <h3 className=" font-semibold text-xl 3xl:text-2xl">{title}</h3>
        <div className="flex items-center text-xs md:text-sm gap-1">
          <MapPin className="sm:w-5 sm:h-5 w-4 h-4" />
          <p className="3xl:text-sm text-xs truncate">{location}</p>
        </div>
        <p className=" font-semibold text-base sm:text-lg xl:text-2xl">{price}</p>
      </div>
    </div>
  );
};

export default SliderCard;
