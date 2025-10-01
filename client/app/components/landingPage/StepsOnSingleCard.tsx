
interface ContentItem {
  year: string;
  description: string;
}

interface RoadmapSingleCardProps {
  index: number;
  title: string;
  subtitle: string;
  content: ContentItem[]; // Content will only be an array of objects with year and description
  bgColor: string;
  color: string;
}

export default function RoadmapSingleCard({
  index,
  title,
  subtitle,
  content,
  bgColor,
  color,
}: RoadmapSingleCardProps) {
  const gridRows = content.length === 1 ? "grid-rows-1" : "grid-rows-2";

  return (
    <div
      className={`mb-7 flex h-full max-w-xl items-center justify-center rounded-lg p-3 sm:p-4 xl:absolute xl:-top-20 xl:mb-0 xl:h-auto xl:w-[530px] 2xl:w-[600px]
 
      ${
        index % 2 === 0
          ? "xl:right-[150%] 2xl:right-[200%]"
          : "xl:left-[150%] 2xl:left-[200%]"
      } ${bgColor} ${color}`}
    >
      <div className={`grid grid-cols-1 xl:grid-cols-2 ${gridRows} gap-3`}>
        <div className={`flex flex-col items-start gap-2 ${color}`}>
          <h2 className="text-5xl font-extrabold 2xl:text-6xl">{title}</h2>
          <p className="text-xl">{subtitle}</p>
        </div>

        {content.map((item, idx) => (
          <div className="flex flex-col items-start gap-2" key={idx}>
            <div
              className={`flex flex-col items-start gap-2 rounded-lg bg-white p-2 sm:p-4 xl:p-2 ${
                gridRows === "grid-rows-1" ? "" : "h-[132px] w-full"
              }`}
            >
              <h4
                className={`text-sm xl:text-xs ${bgColor} rounded-lg px-2 py-1 font-semibold`}
              >
                {item.year}
              </h4>
              <p className="text-base !leading-[1.3rem] text-foreground xl:text-[15px] 2xl:text-base ">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
