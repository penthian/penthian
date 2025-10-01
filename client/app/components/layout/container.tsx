import { cn } from "@/lib/utils";
import React, { JSX } from "react";

type PropTypes = {
    fluid?: boolean;
    shrink?: boolean;
    children: JSX.Element | JSX.Element[];
    className?: string;
};

const Container = ({ children, shrink = false, className }: PropTypes) => {
    return (
        <div
            className={cn(`mx-auto w-full py-8 md:py-14 3xl:py-20 px-4 sm:px-8 xl:px-8 3xl:px-0 z-10`, shrink ? "max-w-[70rem]" : "max-w-full 3xl:max-w-[1440px]", className)}
        >
            {children}
        </div>
    );
};

export default Container;
