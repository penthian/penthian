// InfoCard.tsx
import React from 'react';
import IconTitle from './icon-title';
import { cn } from '@/lib/utils';

interface InfoCardProps {
    /** Title label */
    title: string;
    /** Value or content to display */
    value?: string | number;
    /** SVG Icon component */
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    /** Additional classes for the container */
    className?: string;
    /** Additional classes for the icon in IconTitle */
    iconClassName?: string;
    iconTitleClassName?: string;
    /** Additional classes for the title text in IconTitle */
    titleClassName?: string;
    valueClassName?: string | number
}

/**
 * A reusable card component with an icon+title header and a value.
 */
export const InfoCard: React.FC<InfoCardProps> = ({
    title,
    value,
    Icon,
    className = '',
    iconTitleClassName = '',
    iconClassName = '',
    titleClassName = '',
    valueClassName = ''
}) => (
    <div className={`px-4 py-3 space-y-2 ${className}`}>
        <IconTitle
            Icon={Icon}
            title={title}
            className={iconTitleClassName}
            iconClassName={iconClassName}
            titleClassName={titleClassName}
        />
        <p className={cn(`text-sm md:text-base font-medium text-black truncate`, valueClassName)}>{value}</p>
    </div>
);

export default InfoCard;
