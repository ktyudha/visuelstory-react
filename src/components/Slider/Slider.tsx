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
};

export default function Slider({
  images,
  toShow,
  className,
  centerMode,
  dots,
  dotsPosition,
}: SlideProps) {
  const settings = {
    centerMode: centerMode || false,
    dots: dots ?? true,
    infinite: true,
    speed: 500,
    slidesToShow: toShow || 1,
    slidesToScroll: 1,
    arrows: false,
    focusOnSelect: false,
  };

  return (
    <SlickSlider {...settings} className={clsx([dotsPosition || "left"])}>
      {images?.map((image, index) => (
        <div key={index}>
          <Image name={image} className={clsx([className])} />
        </div>
      ))}
    </SlickSlider>
  );
}
