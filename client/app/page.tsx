"use client";

import { useEffect } from "react";
import LandingPageHeader from "./components/landingPage/header";
import Hero from "./components/landingPage/Hero";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "./components/Footer";
import CTA from "./components/landingPage/CTA";
import FAQ from "./components/landingPage/FAQ";
import FastMarquee from "./components/landingPage/marqee";
import Partners from "./components/landingPage/Partners";
import Testimonials from "./components/landingPage/testimonial";
import Audience from "./components/landingPage/audience";
import WhatYouGain from "./components/landingPage/what-you-gain";
import OurVision from "./components/landingPage/our-vision";
import Tokenization from "./components/landingPage/tokenization";

export default function Page() {

  useEffect(() => {
    AOS.init({
      // Global settings:
      offset: 120, // Offset from the original trigger point
      delay: 0, // Delay before animation starts
      duration: 1000, // Animation duration
      easing: "ease", // Easing function
      once: false, // Whether animation should happen only once
      mirror: false, // Whether elements should animate out while scrolling past them
      anchorPlacement: "top-bottom", // Anchor position
    });
  }, []);

  return (
    <>
      <LandingPageHeader />
      <Hero />
      <Partners />
      <WhatYouGain />
      <Tokenization />
      <OurVision />
      <FastMarquee />
      <Audience />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
