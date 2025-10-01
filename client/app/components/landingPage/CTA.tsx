import Link from "next/link";
import Section from "../layout/section-box";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import LandingPageContainer from "./LandingPageContainer";

function CTA() {
    return (
        <Section className="bg-cream">
            <LandingPageContainer className="flex flex-col text-white items-center justify-centerpy-12 py-12 xl:py-16 3xl:py-20">
                <Card className="bg-center bg-cover bg-no-repeat w-full text-center flex items-center justify-center shadow-none py-8 3xl:py-10"
                    style={{ backgroundImage: 'url(/assets/landingPage/cta/bg.png)' }}>
                    <CardContent className="flex flex-col items-center justify-center gap-8 max-w-3xl w-full">
                        <h2
                            data-aos="fade-up"
                            data-aos-delay="300"
                            className={'text-2xl md:text-3xl xl:text-4xl 3xl:text-5xl capitalize font-heading'}
                        >
                            the platform built for the next generation of &nbsp;wealth.
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
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
                    </CardContent>
                </Card>
            </LandingPageContainer>
        </Section>
    )
}

export default CTA