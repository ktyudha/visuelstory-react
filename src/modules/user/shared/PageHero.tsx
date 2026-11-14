import { img } from "./images";
import { eyebrow as eyebrowCls } from "./ui";

/** Hero halaman dalam: foto penuh, judul di bawahnya (gaya majalah). */
export default function PageHero({ image, eyebrow, title, subtitle }: { image: string; eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section>
      <div className="relative h-[56vh] min-h-[340px] w-full bg-neutral-200 md:h-[68vh]">
        <img src={img(image)} alt="" className="h-full w-full object-cover object-center" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>
      <div className="mx-auto max-w-5xl px-6 pt-14 md:pt-20">
        {eyebrow && <p className={eyebrowCls}>{eyebrow}</p>}
        <h1 className="mt-4 text-4xl font-light leading-tight md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-xl leading-relaxed text-neutral-500">{subtitle}</p>}
      </div>
    </section>
  );
}
