// IconTitle.tsx
import { cn } from '@/lib/utils';
import React from 'react';

// Props for the IconTitle component
interface IconTitleProps {
    /** The title text to display */
    title: string;
    /** SVG Icon component to render next to the title */
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className?: string;
    /** Optional additional classes for the icon */
    iconClassName?: string;
    /** Optional additional classes for the title */
    titleClassName?: string;
}

/**
 * A reusable component that displays an icon next to a title.
 *
 * @param Icon - SVG icon component to render
 * @param title - Text label to display
 * @param className - className
 * @param iconClassName - Extra Tailwind classes for the icon
 * @param titleClassName - Extra Tailwind classes for the title text
 */
export const IconTitle: React.FC<IconTitleProps> = ({
    Icon,
    title,
    className,
    iconClassName = '',
    titleClassName = ''
}) => (
    <div className={cn(`flex 3xl:items-center flex-col 3xl:flex-row gap-2`, className)}>
        <Icon className={cn(`h-5 w-5 text-grey-2`, iconClassName)} />
        <h3 className={cn(`text-sm font-medium sm:text-base text-grey-6`, titleClassName)}>{title}</h3>
    </div>
);

export default IconTitle;