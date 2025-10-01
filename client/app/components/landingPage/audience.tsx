// components/AudienceSection.tsx
import Image from "next/image";
import Section from "../layout/section-box";
import { HeadingPara } from "../layout/heading";
import LandingPageContainer from "./LandingPageContainer";

export const audience = [
    {
        title: "Investors",
        src: "/assets/landingPage/audience/1.png",
        heightClass: "w-full sm:w-[48%] xl:w-full h-60 xl:h-[18rem] 3xl:h-[28rem]",
    },
    {
        title: "Property Developers",
        src: "/assets/landingPage/audience/2.png",
        heightClass: "w-full sm:w-[48%] xl:w-full h-60 xl:h-[16rem] 3xl:h-[26rem]",
    },
    {
        title: "SME Founders",
        src: "/assets/landingPage/audience/3.png",
        heightClass: "w-full sm:w-[48%] xl:w-full h-60 xl:h-[20rem] 3xl:h-[34rem]",
    },
    {
        title: "Governments & Institutions",
        src: "/assets/landingPage/audience/4.png",
        heightClass: "w-full sm:w-[48%] xl:w-full h-60 xl:h-[24rem] 3xl:h-[38rem]",
    },
];

export default function AudienceSection() {
    return (
        <Section className="bg-cream text-[#042043] xl:min-h-screen">
            <LandingPageContainer className="py-12  3xl:py-16 space-y-8 sm:space-y-10 xl:space-y-0">
                {/* Left: heading */}
                <div
                    data-aos="fade-right"
                    data-aos-delay="300"
                    className="space-y-2 3xl:space-y-4 max-w-xl">
                    <HeadingPara
                        title="Built For Investors, Builders, And Visionaries"
                        classNameTitle="text-center sm:text-start font-semibold text-3xl xl:text-4xl 3xl:text-5xl font-heading"
                    />
                    <p
                        className="text-center sm:text-start text-xl 3xl:text-2xl text-[#707070]">
                        Whether you’re growing wealth, raising capital, or shaping the
                        future — Penthian was built with you in mind.
                    </p>
                </div>

                {/* Right: 4‑item mosaic */}
                <div className="flex flex-wrap xl:flex-nowrap items-end gap-4 xl:gap-6 h-full xl:max-h-80 3xl:max-h-[500px]">
                    {/* first three */}
                    {audience.map((item, i) => (
                        <AudienceCard data-aos="fade-up" data-aos-delay={`${i * 600}`} key={item.title} {...item} />
                    ))}
                </div>
            </LandingPageContainer>
        </Section>
    );
}

function AudienceCard({
    src,
    title,
    heightClass,
}: {
    src: string;
    title: string;
    heightClass: string;
}) {
    return (
        <div
            className={`
        relative w-full 
        ${heightClass}
        rounded-2xl overflow-hidden shadow-lg
      `}
        >
            <Image
                src={src}
                alt={title}
                fill
                className="object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white text-lg font-heading xl:text-xl 3xl:text-2xl">{title}</h3>
            </div>
        </div>
    );
}