// components/Testimonials.tsx
import { Star } from "lucide-react";
import Section from "../layout/section-box";
import { testimonials } from "@/app/data/testimonial";
import { HeadingPara } from "../layout/heading";

export default function Testimonials() {
    return (
        <Section className="bg-[#021731] text-white">
            <div className="xl:hidden block items-center justify-center">
                <HeadingPara title="Real Stories From Real People" classNameTitle="py-10 text-white text-center text-3xl xl:text-4xl 3xl:text-5xl font-heading" />
            </div>
            <div className="grid xl:grid-cols-4 min-h-screen">

                {/** ─── Row 1 ──────────────────────────────────────────────── */}
                {/* Card1 */}
                <TestimonialCard {...testimonials[0]} />

                {/* Card2 spans 2 columns */}
                <div className="xl:col-span-2">
                    <TestimonialCard {...testimonials[1]} />
                </div>

                {/* Card3 */}
                <TestimonialCard {...testimonials[2]} />

                {/** ─── Row 2 ──────────────────────────────────────────────── */}
                {/* Card4 */}
                <TestimonialCard {...testimonials[3]} />

                {/* Header spans 2 columns */}
                <div className="xl:col-span-2 hidden xl:flex items-center justify-center">
                    <HeadingPara title="Real Stories From Real People" classNameTitle="text-[#00357B] text-center text-3xl xl:text-4xl 3xl:text-5xl font-heading" />
                </div>

                {/* Card5 */}
                <TestimonialCard {...testimonials[4]} />

                {/** ─── Row 3 ──────────────────────────────────────────────── */}
                {/* Card6 */}
                <TestimonialCard {...testimonials[5]} />

                {/* Card7 spans 2 columns */}
                <div className="xl:col-span-2">
                    <TestimonialCard {...testimonials[6]} />
                </div>

                {/* Card8 */}
                <TestimonialCard {...testimonials[7]} />
            </div>
        </Section>
    );
}

function TestimonialCard({
    rating,
    message,
    name,
    location,
}: {
    id: number;
    rating: number;
    message: string;
    name: string;
    location: string;
}) {
    return (
        <div className="p-6 flex flex-col h-full border border-[#00357B] py-8 sm:py-10">
            <div className="flex mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="#FFC14B"
                    />
                ))}
            </div>
            <p className="flex-grow text-lg sm:text-xl 3xl:text-2xl font-heading">{message}</p>
            <p className="mt-4 text-lg font-medium text-blueText">{name}</p>
            <p className="text-sm text-[#6A91B4]">{location}</p>
        </div>
    );
}
