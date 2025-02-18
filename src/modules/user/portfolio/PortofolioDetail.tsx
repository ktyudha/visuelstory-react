import Image from "@components/Image";

import Gambar2 from "@assets/images/ex-2.png";
import Gambar3 from "@assets/images/ex-3.png";
import Gambar4 from "@assets/images/ex-4.png";

export default function PortfolioDetail() {
  const dummyPortfolioDetail = [Gambar2, Gambar3, Gambar4];

  return (
    <>
      <section id="portfolio" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-center z-50 brightness-75"
          name="ex-1"
        />

        <div className="max-w-2xl min-h-[22vh] flex flex-col items-center justify-center mx-auto px-8">
          <h2 className="uppercase md:text-4xl text-2xl tracking-widest mb-4">
            Couple Session
          </h2>
          <p className="text-base md:tracking-[0.22em] tracking-[0.36em]  uppercase">
            Aubry - Rendi
          </p>
        </div>

        <div className="max-w-4xl px-8 mx-auto flex flex-col gap-8">
          {dummyPortfolioDetail.map((_portfolio, idx) => (
            <img key={idx} src={_portfolio} alt={`portofolio-${idx}`} />
          ))}
        </div>
      </section>
    </>
  );
}
