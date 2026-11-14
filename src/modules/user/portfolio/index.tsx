import { Link } from "react-router-dom";
import { dummyPortfolio } from "@constants/dummy";
import Metadata from "@components/Metadata";
import PageHero from "../shared/PageHero";
import { img } from "../shared/images";

export default function Portfolio() {
  return (
    <>
      <Metadata title="Portofolio" />
      <PageHero image="portfolio" eyebrow="Portofolio" title="Momen yang kami abadikan" />

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16">
          {dummyPortfolio.map((p) => (
            <Link key={p.slug} to={p.slug} className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-neutral-200">
                <img src={img(p.image)} alt={`${p.category} ${p.client}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:opacity-85" />
              </div>
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">{p.category}</div>
                <div className="mt-1 text-base">{p.client}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
