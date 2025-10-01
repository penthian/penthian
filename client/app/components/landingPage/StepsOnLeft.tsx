import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export const roadmapData = [
  {
    title: "Developer Account",
    content: "Create a developer account for selling your properties.",
  },
  {
    title: "Withdraw Funds ",
    content:
      "Developers can withdraw their funds once all fractions of their asset are sold.",
  },
];

const stepsOnLeftData = [
  {
    src: "/assets/landingPage/steps/steps_on_left_1.png",
    text: "78 fractions sold",
  },
  {
    src: "/assets/landingPage/steps/steps_on_left_2.png",
    text: "39 fractions sold",
  },
  {
    src: "/assets/landingPage/steps/steps_on_left_3.png",
    text: "90 fractions sold",
  },
];

function StepsOnLeft() {
  return (
    <div className="flex w-full flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-between">
      <div className="w-full xl:w-[50%] flex flex-col items-center xl:items-start justify-center xl:gap-5">
        <div
          data-aos="fade-right"
          className="w-fit xl:ml-[15%]  font-medium text-xl py-2 px-4 bg-[#D7ECFF] text-[#0087FF] rounded-full"
        >
          Developer
        </div>
        <div className="relative hidden xl:block">
          <div className="my-5 flex flex-col items-start">
            {roadmapData.map((dot) => (
              <RoadmapItem key={dot.title} index={roadmapData.indexOf(dot)} />
            ))}
          </div>
        </div>
        <div className="relative block xl:hidden">
          <div className="my-5 flex flex-col gap-5 items-start">
            {roadmapData.map((dot) => (
              <RoadmapItem key={dot.title} index={roadmapData.indexOf(dot)} />
            ))}
          </div>
        </div>
      </div>
      <div className="w-[50%] flex justify-center items-center relative">
        <div className="bg-gradient-to-r from-blue-400/20 to-blue-400/20 blur-3xl rounded-full absolute top-0 right-0 left-0 bottom-0"></div>
        <div className="w-full flex items-center gap-10 lg:gap-0 justify-center flex-wrap">
          {stepsOnLeftData.map((item, index) => (
            <div
              key={item.src}
              className="relative w-full mt-5 lg:mt-0 lg:w-1/2 flex flex-col lg:flex-row items-center justify-center h-[210px]"
            >
              <Image
                src={item.src}
                alt={`image_${index + 1}`}
                width={220}
                height={220}
                className="hidden 3xl:block"
              />
              <Image
                src={item.src}
                alt={`image_${index + 1}`}
                width={180}
                height={180}
                className="block 3xl:hidden"
              />
              <div
                data-aos="fade-left"
                data-aos-delay="600"
                className="w-fit  hidden lg:block absolute top-12 right-0 3xl:-right-10 px-4 py-2 bg-white text-[#0087FF] rounded-full"
              >
                {item.text}
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="w-fit  text-sm sm:text-base block lg:hidden mt-2 top-12 right-0 3xl:-right-10 px-4 py-2 bg-white text-[#0087FF] rounded-full"
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StepsOnLeft;

function RoadmapItem({ index }: { index: number }) {
  return (
    <div data-aos="fade-right" className="relative flex flex-col items-center">
      {roadmapData[index] && (
        <div className="relative flex flex-col items-center">
          <div
            className={`xl:flex h-10 w-10 hidden items-center justify-center shadow-inner rounded-full`}
          >
            <div className="h-4 w-4 rounded-full bg-white shadow-lg"></div>
          </div>
          <SingleCard
            title={roadmapData[index].title}
            content={roadmapData[index].content}
          // buttonText={roadmapData[index].buttonText}
          // url={roadmapData[index].url}
          />
          {index < roadmapData.length - 1 && ( // Vertical line between dots
            <div className="my-1 h-40 w-1 hidden xl:flex items-center justify-center rounded-full bg-[#EAEAEA] 2xl:h-28 2xl:min-h-20"></div>
          )}
        </div>
      )}
    </div>
  );
}

function SingleCard({
  title,
  content,
  buttonText,
  url,
}: {
  title: string;
  content: string;
  buttonText?: string;
  url?: string;
}) {
  return (
    <div
      className={`transition-all w-80 sm:w-96 xl:absolute left-20 top-0 flex lg:items-start items-center flex-col gap-3 duration-300 transform p-2`}
    >
      <h3 className="font-bold text-2xl sm:text-3xl">{title}</h3>
      <p className="text-base lg:text-start text-center sm:text-xl">
        {content}
      </p>
      {buttonText && url && (
        <Link
          href={url}
          className="mt-2 flex items-center gap-2 w-fit px-4 py-2 text-white border-white border-2 rounded-lg"
        >
          <FiArrowUpRight />
          {buttonText}
        </Link>
      )}
    </div>
  );
}
