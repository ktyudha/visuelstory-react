import Slider from "@components/Slider/Slider";

export default function SliderSection() {
  const imagesSlider = ["slider-1", "slider-2", "slider-3"];

  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        className="absolute lg:top-1/2 bottom-0 lg:left-24 md:left-16 left-2 -translate-y-1/2 px-4 py-2 rounded cursor-pointer"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="bi bi-arrow-left h-6 w-6 text-gray-300 hover:text-white ease-in-out duration-300"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
          />
        </svg>
      </button>
    );
  };

  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        type="button"
        className="absolute lg:top-1/2 bottom-0 lg:right-24 md:right-16 right-2 -translate-y-1/2 px-4 py-2 rounded cursor-pointer"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="bi bi-arrow-right h-6 w-6 text-gray-300 hover:text-white ease-in-out duration-300"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
          />
        </svg>
      </button>
    );
  };

  return (
    <>
      <section className="relative" id="home">
        <Slider
          dots={false}
          images={imagesSlider}
          prevArrow={<PrevArrow />}
          nextArrow={<NextArrow />}
          className="h-[78vh] w-full object-cover object-center z-50 brightness-75"
        />
      </section>
    </>
  );
}
