import { Link as RouterLink } from "react-router-dom";
import Metadata from "@components/Metadata";
import Logo from "@assets/logo/logo-mark.png";
import { INSTAGRAM, WHATSAPP } from "../shared/images";

type Item = { label: string; to?: string; href?: string };

const ITEMS: Item[] = [
  { label: "Booking", to: "/booking" },
  { label: "WhatsApp", href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Halo Visuelstory, saya ingin booking.")}` },
  { label: "Pricelist", to: "/investment" },
  { label: "Website", to: "/?web=1" },
  { label: "Instagram", href: INSTAGRAM },
];

const row = "flex items-center justify-between border-b border-white/15 py-5 text-[13px] uppercase tracking-[0.3em] transition-opacity hover:opacity-60";

export default function Links() {
  return (
    <>
      <Metadata title="Bio Links" />
      <main className="min-h-dvh bg-neutral-950 text-white">
        <div className="mx-auto flex min-h-dvh max-w-sm flex-col px-8 pb-10 pt-[max(4rem,env(safe-area-inset-top))]">
          <header className="text-center">
            <RouterLink to="/?web=1" aria-label="Beranda Visuelstory"><img src={Logo} alt="Visuelstory" className="mx-auto size-20" /></RouterLink>
            <h1 className="mt-6 text-lg tracking-[0.3em] uppercase">Visuelstory</h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-white/50">Photography &amp; Videography</p>
          </header>

          <ul className="mt-14 border-t border-white/15">
            {ITEMS.map((it) => (
              <li key={it.label}>
                {it.to
                  ? <RouterLink to={it.to} className={row}><span>{it.label}</span><span aria-hidden>→</span></RouterLink>
                  : <a href={it.href} target="_blank" rel="noopener noreferrer" className={row}><span>{it.label}</span><span aria-hidden>→</span></a>}
              </li>
            ))}
          </ul>

          <footer className="mt-auto pt-14 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">Sidoarjo, Jawa Timur</footer>
        </div>
      </main>
    </>
  );
}
