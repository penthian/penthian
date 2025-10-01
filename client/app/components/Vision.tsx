import Image from "next/image";
import { aboutUsData, visionData } from "../MockData/aboutUs";

function Vision() {
    const { vision } = visionData;

    return (
        <section className="text-pitchBlack py-20 pt-32 sm:pt-40">
            <div className="mx-auto max-w-full w-full xl:max-w-[1080px] flex flex-col items-center justify-center space-y-6 xl:space-y-8 px-4 sm:px-7">
                <h1
                    className={'font-heading text-3xl md:text-4xl xl:text-5xl 3xl:text-6xl'}
                >
                    {vision.title}
                </h1>

                <Image src={'/assets/landingPage/vision-hero.png'} alt={'vision hero image'} width={1000} height={500} className="object-contain w-full h-full max-h-96" />

                {vision.description.map((paragraph, idx) => (
                    <p key={idx} className="text-base xl:text-lg 3xl:text-2xl">{paragraph}</p>
                ))}

                <p className="text-base xl:text-lg 3xl:text-2xl"><span className="text-[#143560] font-bold">Penthian</span> changes that, by creating an entirely new category: <span className="text-[#143560] font-bold">Tokenized Ownership</span>. This isn’t investing as usual. It’s not crowdfunding. And it’s definitely not DeFi hype.</p>

                {/* <ul className="list-disc list-inside ml-5 space-y-2"> */}
                <ul className="list-disc space-y-2 ml-10">
                    {vision.features.map((feature, idx) => (
                        <li key={idx} className="text-base xl:text-lg 3xl:text-2xl">{feature}</li>
                    ))}
                </ul>

                <p className="text-base xl:text-lg 3xl:text-2xl">Godwill Soma Founder & CEO, Penthian</p>
            </div>
        </section>
    );
}

export default Vision;
