"use client"

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Adjust the path to your `cn` utility if needed

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    videoSrc?: string;
    imageSrc?: string; // Desktop image
    mobileSrc?: string; // Mobile image
    overlayClassName?: string; // Optional custom class for overlay if needed
    imageSrcClassName?: string
    mobileSrcClassName?: string
}

const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 1 } // you can tweak this
};

const Section: React.FC<SectionProps> = ({
    videoSrc,
    imageSrc,
    mobileSrc,
    className,
    children,
    overlayClassName,
    imageSrcClassName,
    mobileSrcClassName,
    ...props
}) => {
    return (
        <section
            className={cn(
                "relative w-full max-w-full flex flex-col items-center justify-center overflow-hidden",
                className
            )}
            {...props}
        >
            <AnimatePresence>
                {videoSrc && (
                    <motion.video
                        {...fadeIn}
                        key={videoSrc}
                        className="absolute top-0 left-0 w-full h-full object-cover z-0"
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                )}

                {imageSrc && (
                    <motion.div
                        {...fadeIn}
                        key={imageSrc}
                        className={cn(
                            "absolute top-0 left-0 w-full h-full bg-center bg-cover bg-no-repeat z-0 hidden md:block",
                            imageSrcClassName
                        )}
                        style={{ backgroundImage: `url(${imageSrc})` }}
                    />
                )}

                {mobileSrc && (
                    <motion.div
                        {...fadeIn}
                        key={mobileSrc}
                        className={cn(
                            "absolute top-0 left-0 w-full h-full bg-center bg-cover bg-no-repeat z-0 block md:hidden",
                            mobileSrcClassName
                        )}
                        style={{ backgroundImage: `url(${mobileSrc})` }}
                    />
                )}
            </AnimatePresence>


            {/* Optional overlay (if you want to dim the white) */}
            {(videoSrc || imageSrc || mobileSrc) && (
                <div
                    className={cn("absolute top-0 left-0 w-full h-full", overlayClassName)}
                />
            )}

            {/* Content */}
            <div className="z-10 w-full">{children}</div>
        </section>
    );
};

export default Section;
