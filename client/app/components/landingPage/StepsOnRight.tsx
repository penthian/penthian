import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";

export const roadmapData = [
  {
    title: "Investor Account",
    content:
      "Create an investor account for buying properties fractionally and earn monthly rental income.",
    // buttonText: "Register",
    // url: "/",
  },
  {
    title: "Get Your BITs and Earn",
    content:
      "Rental income will be divided among investors and added to your account balance.",
  },
  {
    title: "Stay Updated",
    content: "To stay updated about the market, join our owners club. ",
    // buttonText: "Register",
    // url: "/",
  },
];

const stepsOnRightData = [
  {
    src: "/assets/landingPage/steps/steps_on_right_1.png",
    text: "$500 Per week",
  },
  {
    src: "/assets/landingPage/steps/steps_on_right_2.png",
    text: "$2400 per month",
  },
  {
    src: "/assets/landingPage/steps/steps_on_right_3.png",
    text: "$350 per week",
  },
];

function StepsOnRight() {
  return (
    <div className="flex pt-10 lg:pt-0 w-full flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-between">
      <div className="w-[50%] relative order-2 xl:order-1 flex justify-center items-center">
        <div className="bg-gradient-to-r from-blue-400/20 to-blue-400/20 blur-3xl rounded-full absolute top-0 right-5 -left-5 bottom-0"></div>
        <div className="w-full flex items-center gap-10 lg:gap-0 justify-center flex-wrap">
          {stepsOnRightData.map((item, index) => (
            <div
              key={item.src}
              className="relative mt-5 lg:mt-0 w-full rounded-full lg:w-1/2 flex lg:flex-row flex-col items-center justify-center xl:justify-start h-[210px]"
            >
              <Image
                src={item.src}
                alt={`image_${index + 1}`}
                width={220}
                height={220}
                className="hidden 3xl:block rounded-full"
              />
              <Image
                src={item.src}
                alt={`image_${index + 1}`}
                width={180}
                height={180}
                className="block 3xl:hidden rounded-full"
              />
              <div data-aos="fade-left" data-aos-delay="600" className="w-fit  hidden lg:block absolute top-12 xl:right-20 3xl:right-8 px-4 py-2 bg-white text-[#0087FF] rounded-full">
                {item.text}
              </div>
              <div data-aos="fade-up" data-aos-delay="200" className="w-fit  block lg:hidden top-12 xl:right-20 mt-2 3xl:right-8 px-4 py-2 bg-white text-[#0087FF] rounded-full">
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-[50%] flex flex-col items-center order-1 xl:order-2 xl:items-start justify-center xl:gap-5">
        <div data-aos='fade-left' className="w-fit xl:ml-[15%]  font-medium text-xl py-2 px-4 bg-[#D7ECFF] text-[#0087FF] rounded-full">
          Invester
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
    </div>
  );
}

export default StepsOnRight;

function RoadmapItem({ index }: { index: number }) {
  return (
    <div data-aos="fade-left" className="relative flex flex-col items-center">
      {roadmapData[index] && (
        <div className="relative flex flex-col items-center">
          <div
            className={`xl:flex hidden h-10 w-10 items-center justify-center shadow-inner rounded-full`}
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
            <div
              className={`my-1 h-32 w-1 hidden xl:flex items-center justify-center rounded-full bg-[#EAEAEA]  2xl:min-h-20`}
            ></div>
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
      className={`transition-all w-80 sm:w-96 xl:absolute left-20 items-center lg:items-start top-0 flex flex-col gap-3 duration-300 transform p-2`}
    >
      <h3 className="font-bold text-2xl sm:text-3xl">{title}</h3>
      <p className="text-base text-center lg:text-start sm:text-xl">{content}</p>
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
