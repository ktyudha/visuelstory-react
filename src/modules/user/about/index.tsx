import { Link } from "react-router-dom";
import Metadata from "@components/Metadata";
import PageHero from "../shared/PageHero";
import { btnSolid } from "../shared/ui";

const VALUES = [
  { title: "Autentik", text: "Kami menangkap momen apa adanya: tawa, haru, dan detail kecil yang sering terlewat." },
  { title: "Detail", text: "Komposisi, cahaya, dan olah warna dikerjakan dengan teliti dari awal sampai akhir." },
  { title: "Nyaman", text: "Dari booking hingga hasil jadi, prosesnya jelas, ramah, dan tanpa ribet." },
];

export default function About() {
  return (
    <>
      <Metadata title="About" />
      <PageHero image="about" eyebrow="About" title="Kisah dalam cerita" />

      <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <p className="text-2xl font-light leading-relaxed md:text-3xl md:leading-[1.6]">
          Visuelstory lahir dari kecintaan kami pada keindahan yang tercipta di momen-momen autentik. Kami percaya foto terbaik bukan yang paling dipoles, melainkan yang paling terasa.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {VALUES.map((v) => (
            <div key={v.title} className="border-t border-neutral-300 pt-6">
              <h3 className="text-[11px] uppercase tracking-[0.35em]">{v.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-500">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-300 py-24 text-center">
        <h2 className="text-3xl font-light md:text-4xl">Mari ceritakan kisah Anda.</h2>
        <Link to="/booking" className={`${btnSolid} mt-10`}>Booking</Link>
      </section>
    </>
  );
}
