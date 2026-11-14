import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronRight, Globe, LogOut, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import Metadata from "@components/Metadata";
import ConfirmSheet from "@components/ConfirmSheet";
import useGlobalStore from "@store/useStore";
import useLogout from "@modules/auth/services/hooks/useLogout";
import ThemeToggle from "../../../theme/ThemeToggle";
import { useInstallPrompt } from "../../../theme/useInstallPrompt";
import InstallApp from "../../../theme/InstallApp";
import { ADMIN_WHATSAPP, Card } from "../shared/ui";

/** Panel diagnostik tersembunyi (buka /account/profile?debug=1): membaca ukuran viewport di perangkat. */
function ViewportDebug() {
  const [rows, setRows] = useState<[string, string][]>([]);
  useEffect(() => {
    const read = () => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;left:0;top:0;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const nav = document.querySelector('nav[aria-label="Navigasi utama"]')?.getBoundingClientRect();
      const vv = window.visualViewport;
      setRows([
        ["mode standalone", String(window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true)],
        ["screen (w×h)", `${screen.width}×${screen.height}`],
        ["innerHeight", String(window.innerHeight)],
        ["outerHeight", String(window.outerHeight)],
        ["visualViewport.height", String(Math.round(vv?.height ?? 0))],
        ["clientHeight (html)", String(document.documentElement.clientHeight)],
        ["scrollHeight (html)", String(document.documentElement.scrollHeight)],
        ["safe-area atas / bawah", `${cs.paddingTop} / ${cs.paddingBottom}`],
        ["nav top / bottom", nav ? `${Math.round(nav.top)} / ${Math.round(nav.bottom)}` : "-"],
        ["selisih dasar layar - nav bottom", nav ? String(Math.round(screen.height - nav.bottom)) : "-"],
        ["devicePixelRatio", String(window.devicePixelRatio)],
      ]);
      probe.remove();
    };
    read();
    const t = setInterval(read, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-xl border border-dashed border-neutral-400 p-3 text-xs dark:border-neutral-600">
      <div className="mb-1.5 font-semibold">Diagnostik viewport</div>
      <table className="w-full"><tbody>{rows.map(([k, v]) => <tr key={k}><td className="pr-3 text-neutral-500 dark:text-neutral-400">{k}</td><td className="text-right font-mono">{v}</td></tr>)}</tbody></table>
    </div>
  );
}

export default function Profile() {
  const [params] = useSearchParams();
  const me = useGlobalStore((s) => s.me);
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const { standalone, available } = useInstallPrompt();
  // Kartu hanya tampil bila tombolnya memang ada (bisa dipasang otomatis, atau HP dengan panduan manual)
  const canInstall = !standalone && (available || /android|iphone|ipad|ipod/i.test(navigator.userAgent));

  const [confirmLogout, setConfirmLogout] = useState(false);
  const onLogout = async () => {
    await handleLogout("customer");
    toast.success("Anda telah keluar.");
    navigate("/login", { replace: true });
  };

  const row = "flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left text-[15px]";
  const chevron = <ChevronRight className="size-4 text-neutral-300 dark:text-neutral-600" />;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 md:min-h-0">
      <Metadata title="Akun" />

      {/* Profil */}
      <Card className="flex items-center gap-4 p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-neutral-950 text-xl font-semibold uppercase text-gold-300 dark:bg-white dark:text-neutral-900">
          {(me?.name || me?.whatsapp || "?").trim().charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold capitalize">{me?.name || "Customer"}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{me?.whatsapp}</div>
          {me?.email && <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">{me.email}</div>}
        </div>
      </Card>

      {/* Preferensi */}
      <section>
        <h2 className={sectionTitle}>Preferensi</h2>
        <Card className="divide-y divide-neutral-100 overflow-hidden dark:divide-neutral-800">
          <div className="px-4 py-3.5">
            <div className="mb-2.5 text-[15px]">Mode tampilan</div>
            <ThemeToggle variant="segmented" />
          </div>
          {canInstall && <InstallApp variant="row" />}
        </Card>
      </section>

      {params.get("debug") === "1" && <ViewportDebug />}

      {/* Lainnya */}
      <section>
        <h2 className={sectionTitle}>Lainnya</h2>
        <Card className="divide-y divide-neutral-100 overflow-hidden dark:divide-neutral-800">
          <Link to="/?web=1" className={row}><Globe className="size-5 text-neutral-500 dark:text-neutral-400" /><span className="flex-1">Website Visuelstory</span>{chevron}</Link>
          <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer" className={row}><MessageCircle className="size-5 text-neutral-500 dark:text-neutral-400" /><span className="flex-1">Hubungi kami</span>{chevron}</a>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <button onClick={() => setConfirmLogout(true)} className={`${row} justify-center font-semibold text-red-600 dark:text-red-400`}><LogOut className="size-5" /> Keluar</button>
      </Card>

      {confirmLogout && (
        <ConfirmSheet title="Keluar dari akun?" message="Anda perlu masuk lagi dengan OTP WhatsApp untuk melihat pesanan." confirmLabel="Ya, keluar" danger
          onConfirm={onLogout} onClose={() => setConfirmLogout(false)} />
      )}
    </div>
  );
}

const sectionTitle = "mb-2 px-1 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400";
