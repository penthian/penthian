import { faqData } from "@/app/data/faqs"
import Section from "../layout/section-box"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import LandingPageContainer from "./LandingPageContainer"

export default function FAQ() {
  return (
    <Section id="faqs" imageSrc="/assets/landingPage/faq/faq-bg.png" className="xl:min-h-screen bg-gradient-to-br from-white to-[#FFC14B] py-12 xl:py-24">
      <LandingPageContainer>
        <div className="grid xl:grid-cols-2 gap-12 xl:gap-16 items-start">
          {/* FAQ Content */}
          <div className="space-y-6">
            <div className="space-y-2 3xl:space-y-4">
              <h2 className="text-3xl xl:text-4xl 3xl:text-5xl font-bold text-[#042043] font-heading">FAQ</h2>
              <p className="text-lg xl:text-xl text-[#707070] max-w-lg">
                Everything You Need to Know Before You Co-Own Real Assets
              </p>
            </div>

            <Accordion type="single" collapsible defaultValue="item-1" className="space-y-3">
              {faqData.map((item, i) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  data-aos="fade-right" data-aos-delay={`${i * 200}`}
                  className="data-[state=open]:bg-[#FFF7E7] border border-secondary shadow-sm"
                >
                  <AccordionTrigger className="text-[#312000] hover:text-amber-700">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-[#707070]">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </LandingPageContainer>
    </Section>
  )
}
