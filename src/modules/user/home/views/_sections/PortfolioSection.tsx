import { Link } from "react-router-dom";
import { dummyPortfolio } from "@constants/dummy";
import { img } from "../../../shared/images";
import { eyebrow, linkText } from "../../../shared/ui";

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-6 pb-24 md:pb-36">
      <div className="flex items-end justify-between border-b border-neutral-300 pb-5">
        <h2 className={eyebrow}>Portofolio</h2>
        <Link to="/portfolio" className={linkText}>Lihat semua</Link>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16">
        {dummyPortfolio.map((p) => (
          <Link key={p.slug} to={`/portfolio/${p.slug}`} className="group block">
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
  );
}
