import Section from "../layout/section-box";
import LandingPageContainer from "./LandingPageContainer";
import { Button } from "../ui/button";
import Link from "next/link";
export default function Hero() {

  return (
    <Section videoSrc={'https://ik.imagekit.io/eajzchff4/hero-bg-3-compressed.mp4?updatedAt=1754043126123'} overlayClassName="bg-primary/40" mobileSrc="/assets/landingPage/hero/hero-bg.png" className="py-20 pt-56 xl:pt-0 xl:min-h-screen bg-black">

      <LandingPageContainer className="w-full text-white max-w-3xl flex flex-col items-center justify-center gap-10">
        <div className={'flex flex-col items-center justify-center gap-8 text-center'}>
          <h1
            data-aos="zoom-in"
            data-aos-delay="300"
            className={'font-heading text-3xl md:text-4xl xl:text-5xl 3xl:text-6xl'}
          >
            Redefining <span className="text-secondary">Ownership</span> for the Digital Economy
          </h1>
          <p
            data-aos="zoom-in"
            data-aos-delay="400"
            className={'text-sm xl:text-xl 3xl:text-2xl text-blueText'}>
            Co-own income-generating assets worldwide from just $1,000. Built for trust. Backed by compliance. Powered by blockchain.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-col sm:flex-row"
          data-aos="zoom-in"
          data-aos-delay="900"
        >
          <Link href={"/dashboard/primary-marketplace"}>
            <Button size='lg' variant='secondary' className="text-base 3xl:text-lg font-bold">
              Launch&nbsp;dApp
            </Button>
          </Link>
          <Link href={"/#faqs"}>
            <Button variant='white' size='lg' className="text-base 3xl:text-lg font-bold">
              Learn How It Works
            </Button>
          </Link>
        </div>
      </LandingPageContainer>
    </Section>
  )
}
