import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Image from "@components/Image";
import Metadata from "@components/Metadata";

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
      url: "whatsapp://send?phone=6285848250548&text=Halo Visuelstory, Saya Mau Pricelist Short Event.",
    },
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Unduh Mantu",
      url: "whatsapp://send?phone=6285848250548&text=Halo Visuelstory, Saya Mau Pricelist Unduh Mantu.",
    },
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Wedding",
      url: "whatsapp://send?phone=6285848250548&text=Halo Visuelstory, Saya Mau Pricelist Wedding.",
    },
  ];
  return (
    <>
      <Metadata title="Investment" />
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
              <NavLink
                key={idx}
                to={_portfolio.url}
                target="_blank"
                className={`relative max-w-xs w-full aspect-square mx-auto cursor-pointer group transition-transform duration-700 ease-in ${
                  isVisible
                    ? "scale-100 opacity-100"
                    : "md:scale-75 scale-95 opacity-95"
                }`}
                onClick={(e) => {
                  e.preventDefault();

                  // Ukuran window baru
                  const width = 800;
                  const height = 600;

                  // Hitung posisi supaya muncul di tengah
                  const left = (window.screen.width - width) / 2;
                  const top = (window.screen.height - height) / 2;

                  window.open(
                    _portfolio.url,
                    "_blank",
                    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
                  );
                }}
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
              </NavLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
