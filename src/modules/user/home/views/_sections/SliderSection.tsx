import Slider from "@components/Slider/Slider";

export default function SliderSection() {
  const imagesSlider = ["slider-1", "slider-2", "slider-3"];

  return (
    <>
      <section className="relative">
        <Slider
          dots={false}
          images={imagesSlider}
          className="h-[78vh] w-full object-cover object-center z-50"
        />
        <div className="absolute h-[78vh] inset-0 bg-black opacity-30 z-10 pointer-events-none"></div>
      </section>
    </>
  );
}
