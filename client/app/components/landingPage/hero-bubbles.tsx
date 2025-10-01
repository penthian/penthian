// components/HeroBubbles.tsx

import Image from "next/image";

type Earning = {
    src: string;
    alt: string;
    amount: string;
    shares: number;
};

export default function HeroBubbles({ earnings }: { earnings: Earning[] }) {
    // 1) carve your earnings into rows however you like:
    const rows = [
        {
            items: earnings.slice(0, 2),   // first two
            justify: "justify-center",      // align-left
            top: "0px",
        },
        {
            items: earnings.slice(2, 5),   // next three
            justify: "justify-center 3xl:justify-end",     // align-center
            top: "60px",
        },
        {
            items: earnings.slice(5, 8),   // last three
            justify: "justify-center",        // align-right
            top: "120px",
        },
    ];

    return (
        <div className="relative hidden lg:block w-full h-full">
            {rows.map((row, ri) => (
                <div
                    key={ri}
                    className={`absolute top-[${row.top}] -left-36 3xl:-left-20 w-full flex ${row.justify} gap-2`}
                    style={{ top: row.top }}
                >
                    {row.items.map((item, i) => (
                        <Bubble key={i} {...item} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// a small reusable Bubble component
export function Bubble({
    src,
    alt,
    amount,
    shares,
}: Earning) {
    return (
        <div className="flex items-center blue-radial text-pitchBlack rounded-full p-2 shadow-lg transition-transform hover:scale-105">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                <Image src={src} alt={alt} width={40} height={40} className="object-cover" />
            </div>
            <span className="text-base whitespace-nowrap font-semibold">
                You earned {amount} from {shares} stakes
            </span>
        </div>
    );
}
