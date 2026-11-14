import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ChevronLeft, ClipboardList, LogOut, PlusCircle, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import Logo from "@/assets/logo/logo-mark.png";
import useLogout from "@modules/auth/services/hooks/useLogout";
import useGlobalStore from "@store/useStore";
import Metadata from "@components/Metadata";
import { useEffect } from "react";
import { useTheme } from "../../theme/useTheme";
import ThemeToggle from "../../theme/ThemeToggle";
import InstallApp from "../../theme/InstallApp";

const TABS = [
  { to: "/account", label: "Pesanan", icon: ClipboardList, end: true },
  { to: "/booking", label: "Booking", icon: PlusCircle },
  { to: "/account/profile", label: "Akun", icon: UserRound },
];

/** Judul app bar & apakah halaman ini "detail" (tombol kembali, tanpa tab bawah). */
function screenInfo(path: string): { title: string; detail: boolean } {
  if (path.endsWith("/gallery")) return { title: "Galeri Foto", detail: true };
  if (path.endsWith("/edited")) return { title: "Hasil Editan", detail: true };
  if (path.startsWith("/account/orders/")) return { title: "Detail Pesanan", detail: true };
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

  // Latar <html> disamakan dengan warna tab bar: bila ada lajur di bawah bar (area aman/tinggi viewport PWA), tampak menyatu.
  const { dark } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.backgroundColor;
    root.style.backgroundColor = dark ? "#171717" : "#ffffff";
    return () => { root.style.backgroundColor = prev; };
  }, [dark]);

  const onLogout = async () => {
    await handleLogout("customer");
    toast.success("Anda telah keluar.");
    navigate("/login", { replace: true });
  };

  return (
    <HelmetProvider>
      <Metadata />
      <div className="flex min-h-svh min-h-dvh max-md:min-h-[calc(100svh+1px)] max-md:min-h-[calc(100dvh+1px)] flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {/* App bar */}
        <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-900 pt-[env(safe-area-inset-top)] text-white dark:bg-neutral-950">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
            {/* Mobile: kembali atau logo + judul */}
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              {detail ? (
                <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/account"))} aria-label="Kembali"
                  className="-ml-2 grid size-10 cursor-pointer place-items-center rounded-full active:bg-white/10"><ChevronLeft className="size-6" /></button>
              ) : (
                <img src={Logo} alt="" className="size-8" />
              )}
              <h1 className="truncate text-base font-semibold">{title}</h1>
            </div>

            {/* Desktop: logo + navigasi */}
            <NavLink to="/" aria-label="Beranda" className="hidden md:block"><img src={Logo} alt="Visuelstory" className="size-10" /></NavLink>
            <nav className="hidden items-center gap-1 text-sm md:flex">
              {TABS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end}
                  className={({ isActive }) => clsx("rounded-lg px-3 py-2 transition", isActive ? "bg-white/15" : "text-white/70 hover:text-white")}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <span className="hidden max-w-32 truncate pr-2 text-xs text-white/60 md:block">{me?.name || me?.whatsapp}</span>
              <ThemeToggle />
              <button onClick={onLogout} aria-label="Keluar" title="Keluar"
                className="hidden size-9 cursor-pointer place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:grid">
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <main className={clsx("mx-auto w-full max-w-5xl flex-1 px-4 py-5 md:py-8", !detail && "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8")}>
          {!detail && <InstallApp variant="banner" />}
          <Outlet />
          {!detail && <InstallApp variant="sheet" />}
        </main>

        {/* Tab bar bawah (mobile, halaman utama saja) */}
        {!detail && (
          <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
            <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
              {TABS.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end}
                    className={({ isActive }) => clsx("flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition active:scale-95",
                      isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500")}>
                    {({ isActive }) => (<><Icon className={clsx("size-6", isActive && "stroke-[2.4]")} />{label}</>)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </HelmetProvider>
  );
}
