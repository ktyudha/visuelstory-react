import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyPortfolio } from "@constants/dummy";

import Image from "@components/Image";

export default function Portfolio() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 200);
  }, []);
  return (
    <>
      <section id="portfolio" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-bottom z-50 brightness-75 "
          name="portfolio"
        />

        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-8 mx-auto justify-center">
            {dummyPortfolio.map((_portfolio, idx) => (
              <div
                key={idx}
                className={`relative max-w-xs w-full aspect-square mx-auto cursor-pointer group transition-transform duration-700 ease-in ${
                  isVisible
                    ? "scale-100 opacity-100"
                    : "md:scale-75 scale-95 opacity-95"
                }`}
                onClick={() => navigate(`${_portfolio.slug}`)}
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
