const FastMarquee = () => {
    const categories = [
        "Real Estate",
        "Small & Medium Businesses (SMEs)",
        "Stocks",
        "Energy & Infrastructure",
        "Agriculture & Farmland",
        "Royalties & Intellectual Property",
        "Luxury Assets & Collectibles",
        "Vehicles & Commercial Fleets"
    ];

    const content = categories.map((text, index) => (
        <div key={index} className="flex items-center gap-3 px-6 shrink-0">
            <span className="text-sm md:text-base lg:text-lg font-medium">
                {text}
            </span>
        </div>
    ));

    return (
        <div className="bg-[#021731] text-white py-6 overflow-hidden">
            <div className="marquee-wrapper flex whitespace-nowrap">
                <div className="marquee-track flex animate-marquee">
                    {Array.from({ length: 2 }).flatMap((_, i) =>
                        content.map((item, j) => (
                            <div key={`1-${i}-${j}`}>{item}</div>
                        ))
                    )}
                </div>
                <div className="marquee-track flex animate-marquee">
                    {Array.from({ length: 2 }).flatMap((_, i) =>
                        content.map((item, j) => (
                            <div key={`2-${i}-${j}`}>{item}</div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FastMarquee;
