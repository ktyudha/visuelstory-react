import { Link } from "react-router-dom";
import Metadata from "@components/Metadata";
import PageHero from "../shared/PageHero";
import { img } from "../shared/images";
import { linkText } from "../shared/ui";

const GALLERY = ["ex-2", "ex-3", "ex-4"];

export default function PortfolioDetail() {
  return (
    <>
      <Metadata title="Portofolio" />
      <PageHero image="ex-1" eyebrow="Couple Session" title="Aubry - Rendi" />

      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="flex flex-col gap-6 md:gap-10">
          {GALLERY.map((g, i) => <img key={g} src={img(g)} alt={`Portofolio ${i + 1}`} loading="lazy" className="w-full" />)}
        </div>
        <div className="mt-16 text-center"><Link to="/portfolio" className={linkText}>Semua portofolio</Link></div>
      </section>
    </>
  );
}
