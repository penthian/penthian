'use client';
import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import Image from 'next/image';

const imageData = [
  { src: '/assets/product1.png', alt: 'Product 1', width: 623, height: 420 },
  { src: '/assets/product2.png', alt: 'Product 2', width: 623, height: 420 },
  { src: '/assets/product3.png', alt: 'Product 3', width: 623, height: 420 },
  { src: '/assets/product4.png', alt: 'Product 4', width: 623, height: 420 },
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
};

const ProductSlider = () => {
  return (
    <Slider {...settings}>
      {imageData.map((image, index) => (
        <div key={index}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="slider-image"
          />
        </div>
      ))}
    </Slider>
  );
};

export default ProductSlider;
