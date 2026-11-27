import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Menu } from "lucide-react";
import clsx from "clsx";
import Logo from "@/assets/logo/logo-mark.png";
import BottomSheet from "@components/BottomSheet";
import useGlobalStore from "@store/useStore";
import { getMe } from "@modules/auth/services/hooks/useGetMe";
import type { User } from "@modules/auth/services/interfaces/login.types";
import { btnLine, btnSolid } from "@modules/user/shared/ui";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/investment", label: "Pricelist" },
  { to: "/studio", label: "Studio" },
  { to: "/contact", label: "Contact" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const loggedIn = !!Cookies.get("token-customer");

  // Nama pengguna untuk label tautan akun (diambil sekali bila belum ada di store)
  const me = useGlobalStore((s) => s.me);
  const setMe = useGlobalStore((s) => s.setMe);
  useEffect(() => {
    if (!loggedIn || me?.name) return;
    let cancelled = false;
    getMe("customer").then(({ data }) => { if (!cancelled) setMe(data.data as User); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [loggedIn, me?.name, setMe]);
  const accountLabel = (me?.name || "").trim().split(/\s+/)[0] || "Akun saya";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu saat pindah halaman
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className={clsx("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "border-b border-neutral-200 bg-white/90 py-3 text-neutral-900 backdrop-blur-md" : "bg-transparent py-6 text-white")}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <Link to="/" aria-label="Visuelstory"><img src={Logo} alt="Visuelstory" className="size-10" /></Link>

          <nav className="hidden items-center gap-10 text-[11px] uppercase tracking-[0.3em] lg:flex" aria-label="Menu utama">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => clsx("border-b pb-1 transition-opacity hover:opacity-60", isActive ? "border-current" : "border-transparent")}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.3em] lg:flex">
            <Link to={loggedIn ? "/account" : "/login"} className="max-w-[10rem] truncate transition-opacity hover:opacity-60">{loggedIn ? (me ? accountLabel : <span aria-label="Memuat" className="inline-block h-3 w-16 animate-pulse rounded bg-current opacity-20 align-middle" />) : "Masuk"}</Link>
            <Link to="/booking" className={clsx("border px-6 py-2.5 transition-colors duration-300", scrolled ? "border-neutral-900 hover:bg-neutral-900 hover:text-white" : "border-white/70 hover:bg-white hover:text-neutral-900")}>Booking</Link>
          </div>

          <button className="grid size-10 place-items-center lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu" aria-expanded={open}>
            <Menu className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Menu mobile: bottom sheet, dirender di luar header agar tidak terpotong backdrop-blur */}
      {open && (
        <BottomSheet label="Menu" onClose={() => setOpen(false)}>
          <nav aria-label="Menu utama">
            <ul className="divide-y divide-neutral-100">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.end} className={({ isActive }) => clsx("block py-4 text-sm uppercase tracking-[0.25em]", isActive ? "text-neutral-900" : "text-neutral-500")}>{l.label}</NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3">
              <Link to="/booking" className={btnSolid}>Booking</Link>
              <Link to={loggedIn ? "/account" : "/login"} className={btnLine}>{loggedIn ? (me ? `Halo, ${accountLabel}` : <span aria-label="Memuat" className="inline-block h-3 w-24 animate-pulse rounded bg-current opacity-20" />) : "Masuk"}</Link>
            </div>
          </nav>
        </BottomSheet>
      )}
    </>
  );
}
