// components/WhatYouGain.tsx
import Image from "next/image";
import { HeadingPara } from "../layout/heading";
import Section from "../layout/section-box";
import StackCoins from "@/app/assets/icons/StackCoins";
import Globe from "@/app/assets/icons/Globe";
import Eye from "@/app/assets/icons/Eye";
import Building2 from "@/app/assets/icons/Building2";

export const gains = [
    {
        icon: StackCoins,
        title: "Monthly Income From Real‑World Performance",
        desc: "Earn passive income from rent or business profits, not speculation.",
    },
    {
        icon: Globe,
        title: "Borderless Investing, Simplified",
        desc: "No paperwork required. Buy fractions of high‑performing assets across continents, all via digital tokens on a compliant blockchain infrastructure.",
    },
    {
        icon: Eye,
        title: "Transparent, On‑Chain Governance",
        desc: "As a token holder, you get a seat at the table. Vote on key asset decisions, access live reporting.",
    },
    {
        icon: Building2,
        title: "A Built‑In Secondary Market For Liquidity",
        desc: "Need flexibility? You can list your ownership stake on our marketplace or auction it directly to others—no lockups, no waiting games.",
    },
];

export default function WhatYouGain() {
    return (
        <Section className="bg-cream py-12 3xl:py-16 overflow-visible">

            <div className="flex flex-col xl:flex-row w-full relative gap-10 xl:gap-0">
                {/* ── Left: Heading ───────────────────────────────────── */}
                <div className="z-10 w-full xl:w-[50%] 3xl:w-[54%] flex flex-col items-center justify-center relative">
                    <HeadingPara data-aos="zoom-in" data-aos-delay="500" title="What You Gain As A Co‑Owner" classNameTitle="mr-[5%] max-w-48 3xl:max-w-[300px] w-full text-3xl xl:text-3xl 3xl:text-5xl font-heading text-[#412B00]" />

                    <div
                        className="
                        absolute
                        -z-10
                        top-1/2
                        w-60
                        h-60
                        rounded-full
                        transform
                        -translate-y-1/2
                        blur-[80px]
                        bg-[radial-gradient(ellipse_at_center,rgba(224,169,0,0.5),transparent)]
                         "
                    />
                </div>

                <Image
                    src="/assets/landingPage/arrows.png"
                    alt="Logo"
                    width={500}
                    height={500}
                    quality={100}
                    className="absolute hidden top-1/2 -translate-y-1/2 left-[25%] 3xl:left-[36%] xl:block w-[20rem] h-[85%]"
                />

                {/* ── Right: List of gains ───────────────────────────── */}
                <div className="flex flex-col w-full gap-4 z-10 xl:w-[50%] 3xl:w-[46%]">
                    {gains.map((g, i) => {
                        const Icon = g.icon;
                        return (
                            <div data-aos="fade-left" data-aos-delay={i * 300} key={i} className="flex items-start w-full gap-4 py-6 3xl:py-10 bg-center bg-no-repeat bg-contain pl-[5%] xl:bg-[url('/assets/landingPage/accordian-bg.png')] bg-cream border xl:border-none border-[#412B00]"
                            >
                                {/* Pill */}
                                <div className="flex items-center gap-4 sm:gap-10 xl:gap-20 rounded-l-full flex-1">
                                    <div className="w-8 h-8">
                                        <Icon className={`w-6 h-6 xl:w-10 xl:h-10 text-[#412B00] xl:text-white ${i === 0 && 'xl:w-7 xl:h-7 w-6 h-6'}`} />
                                    </div>
                                    <HeadingPara className="pr-10 space-y-1" title={g.title} para={g.desc} classNamePara="text-[#707070] text-sm 3xl:text-lg" classNameTitle="text-[#143560] font-heading !text-xl 3xl:text-2xl" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Section >
    );
}
