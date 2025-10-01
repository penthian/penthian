import LandingPageContainer from "./LandingPageContainer";
import StepsOnLeft from "./StepsOnLeft";
import StepsOnRight from "./StepsOnRight";

export default function StepsToStart() {
  return (
    <>
      <section
        id="about"
        className="relative flex min-h-screen py-16 lg:py-20 pb-20 lg:pb-44 items-center text-white justify-center"
        style={{
          backgroundColor: "#002342",
        }}
      >
        <LandingPageContainer className="mx-auto px-4 sm:px-0">
          <div className="w-full flex flex-col space-y-10 xl:space-y-24 items-center">
            <div className="w-full flex items-center justify-center flex-col gap-2">
              <p data-aos="fade-up" className="text-base xl:text-xl 2xl:text-2xl font-bold">
                Invest or sell?
              </p>
              <h2 data-aos="fade-up" data-aos-delay="100" className="font-bold  text-3xl xl:text-4xl 2xl:text-5xl">
                Steps to Get Started
              </h2>
            </div>
            <StepsOnLeft />
            <StepsOnRight />
          </div>
        </LandingPageContainer>
      </section>
    </>
  );
}
