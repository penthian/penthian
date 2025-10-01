import Image from "next/image";
import React from "react";

const cardData = [
  {
    src: "/assets/landingPage/why/1.png",
    title: "Lower Entry Cost",
    description: "Own a share of a property with a smaller investment.",
    rounded: "left",
  },
  {
    src: "/assets/landingPage/why/2.png",
    title: "Diversification",
    description: "Reduce risk and own fractions of multiple properties.",
  },
  {
    src: "/assets/landingPage/why/3.png",
    title: "Passive Income",
    description: "Earn rental income without managing the property.",
  },
  {
    src: "/assets/landingPage/why/4.png",
    title: "Asset Growth",
    description: "Benefit from property value increases over time.",
    rounded: "right",
  },
];

function WhyInvestCards() {

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 grid-rows-1 text-black gap-4 px-2">
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`flex flex-col items-center xl:items-start gap-4 p-6 xl:py-8 3xl:py-12 bg-white 
            rounded-xl md:rounded-none
            ${card.rounded === "left" ? "xl:rounded-l-xl" : ""}
            ${card.rounded === "right" ? "xl:rounded-r-xl" : ""}
          `}
        >
          <Image
            src={card.src}
            alt={card.title}
            width={150}
            height={150}
            className="hidden 2xl:block"
          />
          <Image
            src={card.src}
            alt={card.title}
            width={100}
            height={100}
            className="xl:block 2xl:hidden"
          />
          <h3 className="text-xl 3xl:text-3xl font-semibold ">
            {card.title}
          </h3>
          <p className="text-[#8F8F8F] xl:text-start text-center text-base 3xl:text-xl">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default WhyInvestCards;
