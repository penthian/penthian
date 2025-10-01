import LandingPageContainer from "./LandingPageContainer";
import WhyInvestCards from "./WhyInvestCards";

export default function WhyInvest() {
  return (
    <>
      <section className="relative flex min-h-screen py-20 items-center text-white bg-[radial-gradient(ellipse_at_center,_#82c0ff,_#0080ff)] justify-center"
      >
        <div className="absolute top-0 bottom-0 right-0 left-0 bg-[url('/assets/landingPage/why/bg.png')] bg-no-repeat bg-center bg-cover"></div>
        <LandingPageContainer className="z-50 mx-auto px-4 sm:px-0">
          <div className="w-full flex flex-col space-y-10 items-center">
            <div className="w-full flex items-center justify-center flex-col gap-2">
              <p data-aos="fade-up" className="text-base xl:text-xl 2xl:text-2xl font-bold">
                Maximize your earnings
              </p>
              <h2 data-aos="fade-up" data-aos-delay="200" className="font-bold text-center  text-3xl xl:text-4xl 2xltext-5xl">
                Why Invest in Real Estate?
              </h2>
            </div>
            <WhyInvestCards />
          </div>
        </LandingPageContainer>
      </section>
    </>
  );
}
