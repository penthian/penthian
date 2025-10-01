import Image from "next/image";
import { careerData } from "../MockData/aboutUs";
import Link from "next/link";
import { Button } from "./ui/button";

function Careers() {
    const { careers } = careerData;

    return (
        <section className="text-pitchBlack py-20 pt-32 sm:pt-40">
            <div className="mx-auto max-w-full w-full xl:max-w-[1080px] flex flex-col items-center justify-center space-y-6 xl:space-y-8 px-4 sm:px-7">
                <h1
                    className={'font-heading text-3xl md:text-4xl xl:text-5xl 3xl:text-6xl'}
                >
                    {careers.title}
                </h1>

                <Image src={'/assets/landingPage/vision-hero.png'} alt={'vision hero image'} width={1000} height={500} className="object-contain w-full h-full max-h-96" />

                 <p className="text-xl xl:text-2xl 3xl:text-4xl text-center text-[#143560] font-bold">{careers.subTitle}</p>

                {careers.description.map((paragraph, idx) => (
                    <p key={idx} className="text-base xl:text-lg 3xl:text-2xl">{paragraph}</p>
                ))}

                <p className="text-base xl:text-lg 3xl:text-2xl"><span className="text-[#143560] font-bold">Take the first step. </span></p>

                <Link href="mailto:Info@penthian.com" passHref className="text-pitchBlack hover:text-gray-600 transition-colors">
                    <Button variant="secondary">Contact Us</Button>
                </Link>

            </div>
        </section>
    );
}

export default Careers;
