import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ChevronLeft, ClipboardList, LogOut, PlusCircle, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import Logo from "@/assets/logo/logo-mark.png";
import useLogout from "@modules/auth/services/hooks/useLogout";
import useGlobalStore from "@store/useStore";
import Metadata from "@components/Metadata";
import { useEffect, useState } from "react";
import ConfirmSheet from "@components/ConfirmSheet";
import { useTheme } from "../../theme/useTheme";
import ThemeToggle from "../../theme/ThemeToggle";

const TABS = [
  { to: "/account", label: "Pesanan", icon: ClipboardList, end: true },
  { to: "/booking", label: "Booking", icon: PlusCircle },
  { to: "/account/profile", label: "Akun", icon: UserRound },
];

/** Judul app bar & apakah halaman ini "detail" (tombol kembali, tanpa tab bawah). */
function screenInfo(path: string): { title: string; detail: boolean } {
  if (path === "/account/studio") return { title: "Studio Foto", detail: true };
  if (path.endsWith("/invoice")) return { title: "Invoice", detail: true };
  if (path.startsWith("/account/orders/")) return { title: "Detail Pesanan", detail: true };
  if (path.startsWith("/booking/package/")) return { title: "Detail Paket", detail: true };
  if (path === "/booking") return { title: "Booking", detail: false };
  if (path === "/account/profile") return { title: "Akun", detail: false };
  return { title: "Pesanan Saya", detail: false };
}

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const me = useGlobalStore((s) => s.me);
  const { handleLogout } = useLogout();
  const { title, detail } = screenInfo(pathname);
  // Indeks tab aktif (urutan sama dengan TABS)
  const activeTab = pathname.startsWith("/account/profile") ? 2 : pathname.startsWith("/booking") ? 1 : 0;
  const [confirmLogout, setConfirmLogout] = useState(false);
  const initial = (me?.name || me?.whatsapp || "?").trim().charAt(0);

  // Latar <html> disamakan dengan latar halaman (abu-abu grouped ala iOS) agar area aman tampak menyatu.
  const { dark } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.backgroundColor;
    const prevBody = document.body.style.backgroundColor;
    const bg = dark ? "#000000" : "#f2f2f7";
    root.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg; // body juga, agar tidak ada pita putih bila tinggi viewport lebih pendek
    return () => { root.style.backgroundColor = prev; document.body.style.backgroundColor = prevBody; };
  }, [dark]);

  const onLogout = async () => {
    await handleLogout("customer");
    toast.success("Anda telah keluar.");
    navigate("/login", { replace: true });
  };

  return (
    <HelmetProvider>
      <Metadata />
      <div className="ios-app flex min-h-dvh max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:min-h-0 max-md:h-[max(100lvh,100dvh,var(--screen-h,0px))] max-md:overflow-hidden flex-col bg-neutral-50 text-neutral-900 max-md:bg-[#f2f2f7] dark:bg-neutral-950 dark:text-neutral-100 dark:max-md:bg-[#000000]">
        {/* App bar */}
        <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-neutral-950 pt-[env(safe-area-inset-top)] text-white max-md:pointer-events-none max-md:absolute max-md:inset-x-0 max-md:border-0 max-md:bg-transparent max-md:text-neutral-900 dark:max-md:text-white">
          {/* Mobile: pudar halus di bawah Dynamic Island / status bar; konten ber-scroll di bawahnya */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[#f2f2f7]/75 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,#000_60%,transparent)] md:hidden dark:bg-[#000000]/65" />
          <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 max-md:h-[3.25rem]">
            {/* Mobile: tombol kembali di halaman detail */}
            <div className="flex min-w-0 items-center md:hidden">
              {detail && (
                <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/account"))} aria-label="Kembali"
                  className="glass pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-full text-neutral-900 dark:text-white"><ChevronLeft className="size-6 stroke-[2.2]" /></button>
              )}
            </div>
            {/* Judul di tengah app bar */}
            <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-semibold md:hidden">{title}</h1>

            {/* Desktop: logo + navigasi */}
            <NavLink to="/" aria-label="Beranda" className="hidden md:block"><img src={Logo} alt="Visuelstory" className="size-10" /></NavLink>
            <nav className="hidden items-center gap-1 text-sm md:flex">
              {TABS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end}
                  className={({ isActive }) => clsx("rounded-lg px-3 py-2 transition", isActive ? "bg-gold-500/20 text-gold-300" : "text-white/70 hover:text-white")}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <NavLink to="/account/profile" className="hidden items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 text-xs hover:bg-white/25 md:flex">
                <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-xs font-bold uppercase text-neutral-950">{initial}</span>
                <span className="max-w-32 truncate">{me?.name || me?.whatsapp}</span>
              </NavLink>
              <ThemeToggle className="max-md:glass max-md:pointer-events-auto max-md:size-10 max-md:rounded-full max-md:text-neutral-700 max-md:hover:bg-white/70 dark:max-md:text-neutral-200" />
              <button onClick={() => setConfirmLogout(true)} aria-label="Keluar" title="Keluar"
                className="hidden size-9 cursor-pointer place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white md:grid">
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <main className={clsx("mx-auto w-full max-w-5xl flex-1 px-4 py-5 max-md:min-h-0 max-md:pt-[calc(env(safe-area-inset-top)+3.25rem+0.75rem)] max-md:overflow-y-auto max-md:overscroll-contain md:py-8", !detail && "pb-[calc(var(--tab-bottom)+5.5rem)] md:pb-8")}>
          <div key={pathname} className="animate-in fade-in slide-in-from-right-3 duration-300 md:animate-none">
            <Outlet />
          </div>
        </main>

        {/* Tab bar bawah (mobile, halaman utama saja) */}
        {!detail && (
          <nav aria-label="Navigasi utama" className="glass fixed inset-x-4 bottom-[var(--tab-bottom)] z-40 mx-auto h-16 max-w-sm rounded-full md:hidden">
            {/* Penanda tab aktif: satu kapsul yang bergeser mulus antar tab */}
            <div aria-hidden className="pointer-events-none absolute inset-1.5">
              <span
                className="absolute inset-y-0 left-0 w-[calc((100%-0.5rem)/3)] rounded-full bg-black/[0.07] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white/[0.14]"
                style={{ transform: `translateX(calc(${activeTab} * (100% + 0.25rem)))` }}
              />
            </div>
            <ul className="relative grid h-full grid-cols-3 gap-1 p-1.5">
              {TABS.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end}
                    className={({ isActive }) => clsx("flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium transition-colors duration-300 active:scale-95",
                      isActive ? "text-neutral-950 dark:text-white" : "text-neutral-600 dark:text-white/70")}>
                    {({ isActive }) => (<><Icon className={clsx("size-[22px] transition-transform duration-300", isActive && "scale-110 stroke-[2.3]")} />{label}</>)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {confirmLogout && (
          <ConfirmSheet title="Keluar dari akun?" message="Anda perlu masuk lagi dengan OTP WhatsApp untuk melihat pesanan." confirmLabel="Ya, keluar" danger
            onConfirm={onLogout} onClose={() => setConfirmLogout(false)} />
        )}
      </div>
    </HelmetProvider>
  );
}
