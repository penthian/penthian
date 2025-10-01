import { cn } from "@/lib/utils";

type Props = {
    product: {
        totalShares: number;
        sharesRemaining: number;
    };
    className?: string
};

const ProgressOfShares: React.FC<Props> = ({ product, className }) => {
    const sold = product.totalShares - product.sharesRemaining;
    // guard against division by zero, clamp at 100%
    const soldPercent =
        product.totalShares > 0
            ? Math.min((sold / product.totalShares) * 100, 100)
            : 0;

    // format as a string with 1–2 decimal places
    const soldPercentage = `${soldPercent.toFixed(1)}%`;

    return (
        <div className={cn(`space-y-1`, className)}>
            <div className="flex items-center justify-end text-sm font-bold text-primary">
                <span>{sold.toLocaleString()} Stakes Sold</span>
            </div>

            <div className="w-full bg-grey-3 h-2 rounded-md">
                <div
                    className="h-2 rounded-md"
                    style={{
                        width: soldPercentage,
                        backgroundColor: "#143560",
                    }}
                />
            </div>

            <div className="flex items-center justify-between text-sm text-grey-5">
                <span>0</span>
                <span>{product.totalShares.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default ProgressOfShares;
