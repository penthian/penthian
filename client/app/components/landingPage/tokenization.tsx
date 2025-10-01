'use client';

import { useRef, useEffect, useState, Fragment } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { HeadingPara } from "../layout/heading";
import { tokensData } from "@/app/assets/mock-data";
import { cn } from "@/lib/utils";
import { useMediaQuery } from 'usehooks-ts'
import Image from "next/image";

const ROW_STARTS = ["row-start-1", "row-start-2", "row-start-3"];

export default function Tokenization() {
    const [mounted, setMounted] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    // ❶ scrollYProgress goes 0→1 from the moment section top hits the viewport top
    //     until section bottom hits viewport top
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });
    const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    const [filledDots, setFilledDots] = useState<boolean[]>(
        tokensData.map(() => false)
    );

    const isBigScreen = useMediaQuery('(min-width: 1280px)')

    useEffect(() => {
        setMounted(true);
        return scrollYProgress.on("change", (v) => {
            setFilledDots(tokensData.map((_, i) => v >= i / (tokensData.length - 1)));
        });
    }, [scrollYProgress]);

    return (
        // ❷ Outer container is 3×100vh tall
        <div
            ref={sectionRef}
            className="relative bg-[#021731] p-0"
            style={{ height: `${tokensData.length * 100}vh` }}
        >
            {/* ❸ Pin this full-screen & let it un-pin when you finish 300vh */}
            <div className="sticky top-0 min-h-screen py-12 flex flex-col items-center justify-center gap-10 xl:gap-6 3xl:gap-20">
                <HeadingPara
                    title="From Tokenization To Yield"
                    classNameTitle="text-3xl xl:text-4xl 3xl:text-5xl text-cream font-heading"
                />

                {/* ❹ Make your rail+cards cover the full sticky height, split into 3 rows */}
                <div className="hidden relative w-full xl:grid xl:grid-cols-11 grid-rows-3 overflow-visible h-96 3xl:h-[500px]">
                    {/* static thin rail */}
                    <div
                        className="absolute hidden xl:block left-1/2 w-px bg-[#707070]
                       top-[calc(100%/6)] bottom-[calc(100%/6)]"
                    />

                    {/* animated thicker rail */}
                    <motion.div
                        className="absolute hidden xl:block left-1/2 w-px bg-white
                       top-[calc(100%/6)] bottom-[calc(100%/6)] origin-top z-10"
                        style={{ scaleY }}
                    />

                    {tokensData.map((step, idx) => {
                        const isLeft = idx % 2 === 0;
                        const isFilled = filledDots[idx];

                        return (
                            <Fragment key={idx}>
                                {/* CARD: now a motion.div */}
                                <motion.div
                                    className={`relative
                                    ${ROW_STARTS[idx]}
                                    ${isLeft ? "col-start-1 justify-end rounded-r-3xl" : "col-start-7 justify-start rounded-l-3xl"}
                                    col-span-5 flex items-center 3xl:p-4 bg-[#001C3D]
                                    `}
                                    initial={{ x: isLeft ? -200 : 200, opacity: 0 }}
                                    animate={isFilled ? { x: 0, opacity: 1 } : {}}
                                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                                >
                                    <Image
                                        src={step.stackImage}
                                        alt="Logo"
                                        width={500}
                                        height={500}
                                        quality={100}
                                        className={cn(
                                            "absolute hidden xl:block top-1/2 -translate-y-1/2 w-56 h-56 2xl:w-60 2xl:h-60 3xl:w-72 3xl:h-72 z-20",
                                            isLeft ? "left-[2%] 2xl:left-[5%] 3xl:left-[10%]" : "right-[2%] 2xl:right-[5%] 3xl:right-[10%]"
                                        )}
                                    />

                                    <div className="space-y-1 p-5 2xl:p-5 3xl:p-8 rounded-2xl xl:max-w-[64%] 2xl:max-w-[60%] 3xl:max-w-[60%] relative overflow-y-clip">

                                        <Image
                                            src={'/assets/landingPage/bg-gradient.png'}
                                            alt="Logo"
                                            width={500}
                                            height={500}
                                            quality={100}
                                            className={cn(
                                                "absolute hidden xl:block top-[50%] -translate-y-1/2 w-72 h-72 3xl:w-96 3xl:h-96 z-0",
                                                isLeft ? "-left-[60%] 2xl:-left-[65%] 3xl:-left-[64%]" : "rotate-180 -right-[60%] 2xl:-right-[65%] 3xl:-right-[64%]"
                                            )}
                                        />
                                        <HeadingPara
                                            title={step.title}
                                            para={step.desc}
                                            classNamePara="text-[#6A91B4] font-normal text-sm !leading-tight 2xl:text-base 3xl:text-xl"
                                            classNameTitle="text-white text-lg font-heading"
                                        />
                                    </div>
                                </motion.div>

                                {/* DOT */}
                                {mounted && isBigScreen && (
                                    <div
                                        className={`
                                            row-start-${idx + 1} col-start-6 col-span-1
                                            flex justify-center items-center
                                        `}
                                    >
                                        <Dot filled={isFilled} />
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}
                </div>

                {/* ─── MOBILE (grid!) ─── */}
                <div
                    className="
                     xl:hidden
                     w-full h-[500px]
                     grid
                     grid-cols-[10%_1fr]
                     grid-rows-3
                     gap-y-10
                     relative overflow-hidden"
                >
                    {/* static line */}
                    <div
                        className="
                          absolute
                          top-[calc(100%/6)] bottom-[calc(100%/6)]
                          left-[5%]         /* halfway through the 10% col */
                          w-px bg-[#707070]
                        "
                    />
                    {/* animated fill */}
                    <motion.div
                        style={{ scaleY }}
                        className="
                          absolute
                          top-[calc(100%/6)] bottom-[calc(100%/6)]
                          left-[5%]
                          w-px bg-white origin-top z-10
                        "
                    />


                    {tokensData.map((step, i) => {
                        const filled = filledDots[i];
                        return (
                            <Fragment key={i}>
                                {/* 2) dot sits at the start of its row, in col 1 */}
                                <div
                                    className={`
                                        col-start-1
                                        row-start-${i + 1}
                                        flex justify-center
                                        items-center
                                    `}
                                >
                                    <Dot filled={filled} />
                                </div>

                                {/* 3) card lives in col 2, row i+1 */}
                                <motion.div
                                    className={`
                                        col-start-2
                                        row-start-${i + 1}
                                        bg-[#001C3D] rounded-2xl p-4
                                        flex items-center relative
                                    `}
                                    initial={{ x: 200, opacity: 0 }}
                                    animate={filled ? { x: 0, opacity: 1 } : {}}
                                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                                >
                                    <Image
                                        src={step.stackImage}
                                        alt=""
                                        width={200}
                                        height={200}
                                        quality={100}
                                        className={cn(
                                            "absolute -top-5 sm:top-1/2 sm:-translate-y-1/2 w-24 h-24 sm:w-60 sm:h-60 z-20 right-[6%]",
                                        )}
                                    />

                                    <div className="space-y-1 px-4 sm:px-0 sm:pl-4 h-36 rounded-2xl w-full max-w-full sm:max-w-[55%] md:max-w-[60%] relative overflow-y-clip flex flex-col justify-center">

                                        <Image
                                            src={'/assets/landingPage/bg-gradient.png'}
                                            alt="Logo"
                                            width={500}
                                            height={500}
                                            quality={100}
                                            className={cn(
                                                "absolute -top-5 sm:top-[50%] sm:-translate-y-1/2 w-28 h-28 sm:w-96 sm:h-96 z-0 -right-2 sm:-right-[80%] md:-right-[70%]",
                                            )}
                                        />
                                        <HeadingPara
                                            title={step.title}
                                            para={step.desc}
                                            classNamePara="text-[#6A91B4] font-normal text-base !leading-tight"
                                            classNameTitle="text-white text-lg lg:text-xl font-heading"
                                        />
                                    </div>
                                </motion.div>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function Dot({ filled }: { filled: boolean }) {
    return (
        <span
            className={cn(
                "w-4 h-4 rounded-full z-10 transition-colors",
                filled
                    ? "bg-white"
                    : "bg-transparent border-2 border-gray-400"
            )}
        />
    );
}
