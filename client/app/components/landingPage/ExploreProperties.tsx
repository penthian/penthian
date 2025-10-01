import React from "react";
import { Button } from "../ui/button";
// import ExploreSlider from "./ExploreSlider";
import Link from "next/link";

function ExploreProperties() {
  return (
    <section className="h-full pt-10 sm:pt-20 w-full">
      <div className="w-full flex flex-col gap-10 items-center">
        <div className="h-48 px-4 sm:px-4 xl:h-60 bg-[url('/assets/landingPage/explore/bg_line.png')] bg-no-repeat w-full bg-top bg-contain flex flex-col gap-3 pt-16 md:pt-20 items-center justify-center">
          <h5
            data-aos="fade-up"
            className="text-[#0087FF] text-base xl:text-lg 2xl:text-2xl"
          >
            Future of digital asset trading
          </h5>
          <h2
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-[#2F3742] text-3xl text-center  font-bold 2xl:text-5xl"
          >
            Explore Latest Properties
          </h2>
          <Link
            href={"/dashboard/secondary-marketplace"}
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <Button className="text-sm mt-3 sm:mt-5 md:text-xl">
              Explore All Properties
            </Button>
          </Link>
        </div>
        {/* <ExploreSlider /> */}
      </div>
    </section>
  );
}

export default ExploreProperties;
