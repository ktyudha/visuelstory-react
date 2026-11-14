import { Link } from "react-router-dom";
import Metadata from "@components/Metadata";
import PageHero from "../shared/PageHero";
import { INSTAGRAM, WHATSAPP } from "../shared/images";
import { btnLine, btnSolid } from "../shared/ui";

const ROWS = [
  { label: "WhatsApp", value: "+62 851 4492 0131", href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Halo Visuelstory, saya ingin bertanya.")}` },
  { label: "Instagram", value: "@visuelstory", href: INSTAGRAM },
  { label: "Lokasi", value: "Sidoarjo, Jawa Timur" },
];

export default function Contact() {
  return (
    <>
      <Metadata title="Contact" />
      <PageHero image="contact" eyebrow="Contact" title="Hi, kita akhirnya bertemu." subtitle="Ceritakan momen yang ingin Anda abadikan. Kami siap membantu." />

      <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <ul className="border-t border-neutral-300">
          {ROWS.map((r) => {
            const inner = (
              <>
                <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">{r.label}</span>
                <span className="text-lg">{r.value}</span>
              </>
            );
            const cls = "flex flex-col gap-1 border-b border-neutral-300 py-6 sm:flex-row sm:items-center sm:justify-between";
            return <li key={r.label}>{r.href ? <a href={r.href} target="_blank" rel="noreferrer" className={`${cls} transition hover:opacity-60`}>{inner}</a> : <div className={cls}>{inner}</div>}</li>;
          })}
        </ul>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <Link to="/booking" className={`${btnSolid} sm:flex-1`}>Booking online</Link>
          <Link to="/investment" className={`${btnLine} sm:flex-1`}>Lihat pricelist</Link>
        </div>
      </section>
    </>
  );
}
