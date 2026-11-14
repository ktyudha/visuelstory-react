import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import Metadata from "@components/Metadata";
import useGlobalStore from "@store/useStore";
import useLogout from "@modules/auth/services/hooks/useLogout";
import ThemeToggle from "../../../theme/ThemeToggle";
import { useInstallPrompt } from "../../../theme/useInstallPrompt";
import InstallApp from "../../../theme/InstallApp";
import { ADMIN_WHATSAPP, btnGhost, Card } from "../shared/ui";

export default function Profile() {
  const me = useGlobalStore((s) => s.me);
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const { standalone, available } = useInstallPrompt();
  // Kartu hanya tampil bila tombolnya memang ada (bisa dipasang otomatis, atau HP dengan panduan manual)
  const canInstall = !standalone && (available || /android|iphone|ipad|ipod/i.test(navigator.userAgent));

  const onLogout = async () => {
    await handleLogout("customer");
    toast.success("Anda telah keluar.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 min-h-[calc(100dvh-3.5rem-5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.25rem)] md:min-h-0">
      <Metadata title="Akun" />
      <Card className="flex items-center gap-4 p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-neutral-900 text-xl font-semibold uppercase text-white dark:bg-white dark:text-neutral-900">
          {(me?.name || me?.whatsapp || "?").trim().charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold capitalize">{me?.name || "Customer"}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{me?.whatsapp}</div>
          {me?.email && <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">{me.email}</div>}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 font-semibold">Tampilan</h2>
        <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">Pilih tema terang, gelap, atau ikuti pengaturan perangkat.</p>
        <ThemeToggle variant="segmented" />
      </Card>

      {canInstall && (
        <Card className="p-5">
          <h2 className="mb-1 font-semibold">Pasang aplikasi</h2>
          <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">Tambahkan ke layar utama agar terbuka seperti aplikasi.</p>
          <InstallApp variant="button" className="w-full" />
        </Card>
      )}

      <div className="mt-auto grid gap-3 pt-2 sm:grid-cols-2">
        <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer" className={btnGhost}><MessageCircle className="size-4" /> Hubungi kami</a>
        <button onClick={onLogout} className={`${btnGhost} text-red-600 dark:text-red-400`}><LogOut className="size-4" /> Keluar</button>
      </div>
    </div>
  );
}
