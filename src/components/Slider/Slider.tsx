import { ReactElement, useRef } from "react";
import clsx from "clsx";
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Image from "@components/Image";

type SlideProps = {
  images: string[];
  dots?: boolean;
  dotsPosition?: string;
  toShow?: number;
  className?: string;
  centerMode?: boolean;
  nextArrow?: ReactElement;
  prevArrow?: ReactElement;
  isAutoplay?: boolean;
  autoplaySpeed?: number;
};

export default function Slider({
  images,
  toShow,
  className,
  centerMode,
  dots,
  dotsPosition,
  isAutoplay,
  autoplaySpeed,
  nextArrow,
  prevArrow,
}: SlideProps) {
  const sliderRef = useRef<SlickSlider | null>(null);

  const settings = {
    centerMode: centerMode || false,
    dots: dots ?? true,
    infinite: true,
    speed: 500,
    slidesToShow: toShow || 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: isAutoplay || false,
    autoplaySpeed: isAutoplay ? autoplaySpeed : 0,
    focusOnSelect: false,
    nextArrow: nextArrow,
    prevArrow: prevArrow,
  };

  const next = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const previous = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  return (
    <div className="slider-container">
      <SlickSlider
        ref={sliderRef}
        {...settings}
        className={clsx([dotsPosition || "left"])}
      >
        {images?.map((image, index) => (
          <div key={index}>
            <Image name={image} className={clsx([className])} />
          </div>
        ))}
      </SlickSlider>

      {nextArrow && <div onClick={next}>{nextArrow}</div>}
      {prevArrow && <div onClick={previous}>{prevArrow}</div>}
    </div>
  );
}
