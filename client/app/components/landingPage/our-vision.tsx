// components/OurVision.tsx
import Image from "next/image";
import Section from "../layout/section-box";
import LandingPageContainer from "./LandingPageContainer";
import { HeadingPara } from "../layout/heading";
import { Card, CardContent } from "../ui/card";

const features = [
    {
        title: "Access For All",
        description:
            "Fractional ownership of real assets, open to anyone, anywhere.",
    },
    {
        title: "Capital Without Borders",
        description:
            "Invest and raise globally with built-in compliance and liquidity.",
    },
    {
        title: "Income That Works For You",
        description: "Earn yield from real-world businesses and properties.",
    },
    {
        title: "Trust By Design",
        description:
            "On‑chain governance and transparency baked into every asset.",
    },
];

export default function OurVision() {
    return (
        <Section className="bg-cream xl:min-h-screen">
            <LandingPageContainer className="py-12 sm:py-40 3xl:py-12 px-2 sm:px-4">
                <div className="relative pb-16 space-y-10">

                    <HeadingPara className="xl:hidden flex flex-col items-center justify-center" title='Our Vision' para="We’re Building the Infrastructure for the Digital Ownership Economy" classNamePara="text-[#707070] text-sm sm:text-base text-center" classNameTitle="text-3xl font-heading text-[#042043]" />

                    <div className="xl:hidden w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 2xl:gap-8">
                        {features.map(({ title, description }, i) => (
                            <Card
                                data-aos="fade-up" data-aos-delay={i * 500}
                                key={title} className="flex flex-col items-start">
                                <CardContent>
                                    <h3 className="text-xl font-heading text-black">{title}</h3>
                                    <p className="mt-1 text-base 3xl:text-base text-[#707070]">{description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Hero image with overlayed heading */}
                    <div className="relative hidden xl:block h-[300px] xl:h-[550px] 3xl:h-[700px]">
                        <Image
                            src="/assets/landingPage/our-vision.png"
                            alt="City skyline rising above the clouds"
                            fill
                            objectFit="contain"
                            className="rounded-t-[2rem]"
                        />
                        <HeadingPara className="absolute space-y-1 inset-0 flex flex-col items-center px-4 pt-14" title='Our Vision' para="We’re Building the Infrastructure for the Digital Ownership Economy" classNamePara="text-[#707070] text-sm sm:text-base text-center max-w-[80%]" classNameTitle="text-3xl xl:text-4xl 3xl:text-5xl font-heading text-[#042043]" />
                        {/* Feature list */}
                        <div className="absolute bottom-2 3xl:bottom-3 right-2 max-w-[840px] 3xl:max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 3xl:gap-8">
                            {features.map(({ title, description }, i) => (
                                <div
                                    data-aos="fade-up" data-aos-delay={i * 500}
                                    key={title} className="flex flex-col items-start">
                                    <h3 className="text-lg 3xl:text-xl font-heading text-black">{title}</h3>
                                    <p className="mt-1 text-xs 3xl:text-base text-gray-500">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </LandingPageContainer>
        </Section>
    );
}
