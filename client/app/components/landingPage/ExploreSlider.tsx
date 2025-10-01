// "use client";

// import React from "react";
// import { Swiper, SwiperSlide } from "swiper/react";

// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import "swiper/css/pagination";

// import { EffectCoverflow, Autoplay  } from "swiper/modules";
// import SliderCard from "./SliderCard";
// import { exploreSliderData } from "@/app/data/exploreSliderData";

// function ExploreSlider() {

//   return (
//     <div>
//       <div className="my-10 xl:my-0 3xl:my-10 w-dvw">
//         <Swiper
//           loop={true}
//           speed={800}
//           spaceBetween={10}
//           autoplay={{
//             delay: 2500,
//             disableOnInteraction: false,
//           }}
//           grabCursor={true}
//           pagination={{
//             el: ".swiper-pagination",
//             clickable: true,
//           }}
//           breakpoints={{
//             0: {
//               slidesPerView: 1,
//             },
//             640: {
//               slidesPerView: 2,
//             },
//             1024: {
//               slidesPerView: 3,
//             },
//             1200: {
//               slidesPerView: 4,
//             },
//             1600: {
//               slidesPerView: 5,
//             },
//           }}
//           modules={[EffectCoverflow, Autoplay ]}
//           className="mySwiper h-[400px] sm:h-[500px] flex items-center self-center"
//         >
//           {exploreSliderData.map((item, index) => (
//             <SwiperSlide
//               key={index}
//               className="swiper-slide-custom rounded-3xl !flex justify-center items-center"
//             >
//               <SliderCard
//                 title={item.title}
//                 imageUrl={item.imageUrl}
//                 location={item.location}
//                 price={item.price}
//               />
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </div>
//   );
// }

// export default ExploreSlider;
