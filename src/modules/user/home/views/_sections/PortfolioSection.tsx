import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Image from "@components/Image";

import { dummyPortfolio } from "@constants/dummy";

export default function PortfolioSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 200);
  }, []);

  return (
    <>
      <section
        id="portfolio"
        className="lg:max-w-4xl md:max-w-2xl w-full mx-auto mx-8"
      >
        <div className="min-h-[22vh] flex items-center justify-center">
          <h2 className="text-4xl text-center">Hi, you've found us!</h2>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-8 mx-auto justify-center">
          {dummyPortfolio.map((_portfolio, idx) => (
            <div
              key={idx}
              className={`relative max-w-xs w-full aspect-square mx-auto cursor-pointer group transition-transform duration-700 ease-in ${
                isVisible
                  ? "scale-100 opacity-100"
                  : "md:scale-75 scale-95 opacity-95"
              }`}
              onClick={() => navigate(`portfolio/${_portfolio.slug}`)}
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
      </section>
    </>
  );
}
