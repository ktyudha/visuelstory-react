import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { img } from "../../../shared/images";
import { linkText } from "../../../shared/ui";

const SLIDES = ["slider-1", "slider-2", "slider-3"];

export default function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative h-svh min-h-[560px] w-full overflow-hidden bg-neutral-950">
      {SLIDES.map((s, i) => (
        <img key={s} src={img(s)} alt="" aria-hidden={i !== active}
          className={clsx("absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[2000ms]", i === active ? "opacity-100" : "opacity-0")} />
      ))}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 text-white md:pb-24">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/80">Photography &amp; Videography</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-light leading-[1.1] md:text-7xl">Kisah dalam cerita.</h1>
        <div className="mt-10 flex gap-10">
          <Link to="/booking" className={linkText}>Booking</Link>
          <Link to="/portfolio" className={linkText}>Portofolio</Link>
        </div>
      </div>
    </section>
  );
}
