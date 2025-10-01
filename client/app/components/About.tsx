import Image from "next/image";
import { aboutUsData } from "../MockData/aboutUs";

function About() {
  const { about } = aboutUsData;

  return (
    <section className="text-pitchBlack py-20 pt-32 sm:pt-40">
      <div className="mx-auto max-w-full w-full xl:max-w-[1080px] flex flex-col items-center justify-center space-y-6 xl:space-y-8 px-4 sm:px-7">
        <h1
          className={'font-heading text-3xl md:text-4xl xl:text-5xl 3xl:text-6xl'}
        >
          About Us
        </h1>

        <Image src={'/assets/landingPage/about-hero.png'} alt={'about hero image'} width={1000} height={500} className="object-contain w-full h-full max-h-96" />

        <p className="text-xl xl:text-2xl 3xl:text-4xl text-center text-[#143560] font-bold">{about.subTitle}</p>

        {about.description.map((paragraph, idx) => (
          <p key={idx} className="text-base xl:text-lg 3xl:text-2xl">{paragraph}</p>
        ))}

        <p className="text-base xl:text-lg 3xl:text-2xl">We created <span className="text-[#143560] font-bold">Penthian to change that</span>. Our vision is simple:<span className="text-[#143560] font-bold">to make ownership collaborative</span>.To give people a trusted way to co-own income-producing assets: property and businesses alongside others, with clear rules, transparent systems, and a platform built on real technology. We’re here to unlock opportunity for property developers, for business founders, and for the everyday person who just wants a way in.</p>

        <p className="text-base xl:text-lg 3xl:text-2xl">Penthian connects the dots:</p>
        
        <ul className="list-disc space-y-2">
          {about.features.map((feature, idx) => (
            <li key={idx} className="text-base xl:text-lg 3xl:text-2xl">{feature}</li>
          ))}
        </ul>

        <div className="space-y-2">
          {about.ownersClub.map((paragraph, idx) => (
            <p key={idx} className="text-base xl:text-lg 3xl:text-2xl">{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
