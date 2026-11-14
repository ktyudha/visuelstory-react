import { Link } from "react-router-dom";
import { img } from "../../../shared/images";
import { eyebrow, linkText } from "../../../shared/ui";

export default function AboutSection() {
  return (
    <section className="border-t border-neutral-300">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-24 md:py-36">
        <img src={img("about")} alt="Visuelstory" loading="lazy" className="aspect-[4/5] w-full object-cover" />
        <div>
          <p className={eyebrow}>Tentang kami</p>
          <h2 className="mt-6 text-3xl font-light leading-snug md:text-4xl">Lahir dari kecintaan pada momen yang autentik.</h2>
          <p className="mt-6 leading-relaxed text-neutral-500">
            Kami hadir bukan hanya untuk menekan shutter, tetapi untuk memahami cerita Anda dan menyajikannya dalam foto dan video yang jujur dan tahan lama.
          </p>
          <Link to="/about" className={`${linkText} mt-10 inline-block`}>Kenali kami</Link>
        </div>
      </div>
    </section>
  );
}
