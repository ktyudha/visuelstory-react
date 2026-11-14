import { Link } from "react-router-dom";
import Logo from "@/assets/logo/logo-mark.png";
import { INSTAGRAM, WHATSAPP } from "@modules/user/shared/images";

const label = "mb-5 text-[10px] uppercase tracking-[0.35em] text-white/40";

export default function LandingFooter() {
  return (
    <footer className="bg-neutral-950 text-sm text-white/60">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <img src={Logo} alt="Visuelstory" className="size-14" />
          <p className="mt-5 max-w-xs leading-relaxed">Photography &amp; Videography.<br />Kisah dalam cerita.</p>
        </div>

        <div>
          <h4 className={label}>Jelajahi</h4>
          <ul className="space-y-3">
            <li><Link to="/portfolio" className="transition hover:text-white">Portfolio</Link></li>
            <li><Link to="/about" className="transition hover:text-white">About</Link></li>
            <li><Link to="/investment" className="transition hover:text-white">Pricelist</Link></li>
            <li><Link to="/contact" className="transition hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={label}>Layanan</h4>
          <ul className="space-y-3">
            <li><Link to="/booking" className="transition hover:text-white">Booking online</Link></li>
            <li><Link to="/login" className="transition hover:text-white">Pesanan saya</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={label}>Kontak</h4>
          <ul className="space-y-3">
            <li>Sidoarjo, Jawa Timur</li>
            <li><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="transition hover:text-white">+62 851 4492 0131</a></li>
            <li><a href={INSTAGRAM} target="_blank" rel="noreferrer" className="transition hover:text-white">@visuelstory</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-[11px] uppercase tracking-[0.25em] text-white/30">© {new Date().getFullYear()} Visuelstory</div>
      </div>
    </footer>
  );
}
