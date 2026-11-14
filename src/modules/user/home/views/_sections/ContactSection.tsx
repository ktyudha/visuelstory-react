import { Link } from "react-router-dom";
import { INSTAGRAM, WHATSAPP } from "../../../shared/images";
import { btnLine, btnSolid } from "../../../shared/ui";

export default function ContactSection() {
  return (
    <section id="contact" className="border-t border-neutral-300">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-36">
        <h2 className="text-3xl font-light leading-snug md:text-5xl">Mari bercerita bersama.</h2>
        <p className="mx-auto mt-6 max-w-md leading-relaxed text-neutral-500">Booking langsung secara online, atau konsultasikan kebutuhan Anda lebih dulu.</p>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/booking" className={`${btnSolid} w-full sm:w-auto`}>Booking</Link>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Halo Visuelstory, saya ingin berkonsultasi.")}`} target="_blank" rel="noreferrer" className={`${btnLine} w-full sm:w-auto`}>WhatsApp</a>
        </div>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="mt-10 inline-block text-xs tracking-[0.2em] text-neutral-400 transition hover:text-neutral-900">@visuelstory</a>
      </div>
    </section>
  );
}
