import { cn } from '@/lib/utils';

interface HeadingParaProps {
    title?: string;
    para?: string;
    tag?: 'h2' | 'h1';
    className?: string;
    classNameTitle?: string;
    classNamePara?: string;
}

export const HeadingPara: React.FC<HeadingParaProps> = ({
    title,
    para,
    tag = 'h2',
    className,
    classNameTitle,
    classNamePara,
}) => {
    const Tag = tag;

    return (
        <div className={cn('space-y-2', className)}>
            <Tag
                className={cn(
                    'text-xl xl:text-2xl 3xl:text-3xl font-bold',
                    classNameTitle
                )}
            >
                {title}
            </Tag>
            {para && (
                <p className={cn('text-sm sm:text-base font-medium text-grey-2', classNamePara)}>
                    {para}
                </p>
            )}
        </div>
    );
};
