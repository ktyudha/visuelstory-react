import { useEffect, useState } from "react";
import Image from "@components/Image";

export default function Investment() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 200);
  }, []);

  const dummyPricelist = [
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Short Event",
      url: "https://drive.google.com/file/d/1lAukw02z_C2ek2jX9sVl_4xdjlk3PSgL/view?usp=sharing",
    },
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Unduh Mantu",
      url: "https://drive.google.com/file/d/1zbzRRAfVpXkGAESW5OrrDcOHijbXTMTe/view?usp=sharing",
    },
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Wedding",
      url: "https://drive.google.com/file/d/1PC5i9wak9tRxxjPu15VNJOZHzO3_Ssz4/view?usp=sharing",
    },
  ];
  return (
    <>
      <section id="investment" className="relative">
        <div className="relative h-[78vh] w-full mb-8">
          <Image
            className="h-full w-full object-cover object-center z-50 brightness-75"
            name="investment"
          />
          <div className="absolute text-center top-1/2 left-1/2 mt-10 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold">
            <h2 className="uppercase md:text-5xl text-4xl tracking-widest mb-4">
              INVESTMENT
            </h2>
            <p className="text-base md:tracking-[0.22em] tracking-[0.36em]  uppercase">
              Preserve Your Best Memories
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-8 mx-auto justify-center">
            {dummyPricelist.map((_portfolio, idx) => (
              <a
                key={idx}
                href={_portfolio.url}
                target="_blank"
                className={`relative max-w-xs w-full aspect-square mx-auto cursor-pointer group transition-transform duration-700 ease-in ${
                  isVisible
                    ? "scale-100 opacity-100"
                    : "md:scale-75 scale-95 opacity-95"
                }`}
              >
                <Image
                  name={_portfolio.image}
                  className="w-full h-full object-cover brightness-90 group-hover:brightness-75 transition duration-300"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 transform group-hover:-translate-y-4">
                  <h3 className="text-white text-2xl mb-4 capitalize">
                    {_portfolio.category}
                  </h3>
                  <p className="text-white text-md font-thin uppercase">
                    {_portfolio.client}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
