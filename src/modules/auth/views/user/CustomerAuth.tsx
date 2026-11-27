import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import { HelmetProvider } from "react-helmet-async";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2 } from "lucide-react";
import Metadata from "@components/Metadata";
import axiosInstance from "@lib/axios-instance";
import useGlobalStore from "@store/useStore";
import useSendOtp from "@modules/auth/services/hooks/useSendOtp";
import useLogin from "@modules/auth/services/hooks/useLogin";
import { getApiError } from "@services/customer/api";
import { safeRedirect } from "@helpers/safe-redirect";
import ThemeToggle from "../../../../theme/ThemeToggle";
import AuthHeader from "../AuthHeader";
import { btnPrimary, inputCls } from "../../../customer/shared/ui";

type Step = "phone" | "otp" | "name";

/** "0812-3456-7890" / "+62 812…" / "812…" -> "62812…" (null jika bukan nomor Indonesia yang valid) */
function toIntl(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("62")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return /^8\d{7,12}$/.test(d) ? `62${d}` : null;
}
const pretty = (intl: string) => `+${intl.slice(0, 2)} ${intl.slice(2, 5)}-${intl.slice(5, 9)}-${intl.slice(9)}`;

export default function CustomerAuth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const safeTarget = safeRedirect(redirect);

  // Sudah login saat membuka halaman ini -> langsung masuk.
  const alreadyIn = useRef(Boolean(Cookies.get("token-customer"))).current;

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [intl, setIntl] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const isNew = useRef(false);

  const { handleSendOtp } = useSendOtp("customer");
  const { handleLogin } = useLogin("customer");
  const setMe = useGlobalStore((s) => s.setMe);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (alreadyIn) return <Navigate to={safeTarget ?? "/account"} replace />;

  const finish = () => navigate(safeTarget ?? (isNew.current ? "/booking" : "/account"), { replace: true });

  const fail = (e: unknown, fallback: string) => {
    setError(getApiError(e, fallback));
    if (isAxiosError(e) && e.response?.status === 429 && e.response.data?.retry_after) setCooldown(e.response.data.retry_after);
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const number = toIntl(step === "otp" ? intl : phone);
    if (!number) return setError("Nomor WhatsApp tidak valid. Contoh: 812 3456 7890");
    setBusy(true); setError("");
    try {
      const res = (await handleSendOtp(number)) as unknown as { retry_after?: number };
      setIntl(number); setOtp(""); setStep("otp"); setCooldown(res.retry_after ?? 60);
    } catch (err) { fail(err, "Kode gagal dikirim. Coba lagi."); }
    finally { setBusy(false); }
  };

  const verify = async (code: string) => {
    if (busy || code.length !== 6) return;
    setBusy(true); setError("");
    try {
      await handleLogin(intl, code);
      const me = useGlobalStore.getState().me;
      if (!me?.name) { isNew.current = true; setStep("name"); } else finish();
    } catch (err) { setOtp(""); fail(err, "Kode salah atau kedaluwarsa."); }
    finally { setBusy(false); }
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || busy) return;
    setBusy(true); setError("");
    try {
      const { data } = await axiosInstance({ withToken: true, tokenType: "customer" }).put("/auth/customer/profile", { name: name.trim() });
      setMe(data.data);
      toast.success("Selamat datang di Visuelstory!");
      finish();
    } catch (err) { fail(err, "Nama gagal disimpan."); }
    finally { setBusy(false); }
  };

  const booking = safeTarget?.startsWith("/booking");
  const header =
    step === "phone" ? { t: booking ? "Mulai booking" : "Masuk atau daftar", s: "Cukup masukkan nomor WhatsApp. Belum punya akun? Otomatis dibuatkan." }
    : step === "otp" ? { t: "Masukkan kode OTP", s: `Kode 6 digit dikirim ke WhatsApp ${pretty(intl)}.` }
    : { t: "Satu langkah lagi", s: "Siapa nama Anda? Nama dipakai untuk pemesanan." };

  return (
    <HelmetProvider>
    <div className="flex min-h-svh flex-col items-center justify-center bg-neutral-50 p-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:p-10">
      <Metadata title="Masuk" />
      <div className="fixed right-3 top-[calc(0.75rem+env(safe-area-inset-top))]">
        <ThemeToggle className="!text-neutral-500 hover:!bg-neutral-200 dark:!text-neutral-400 dark:hover:!bg-neutral-800" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <AuthHeader title={header.t} subtitle={header.s} />

        {step === "phone" && (
          <form onSubmit={sendCode} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Nomor WhatsApp</span>
              <div className="flex">
                <span className="grid place-items-center rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-100 px-3.5 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">+62</span>
                <input value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }} type="tel" inputMode="numeric" autoComplete="tel-national" autoFocus
                  placeholder="812 3456 7890" className={`${inputCls} !rounded-l-none`} aria-invalid={!!error} />
              </div>
            </label>
            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={busy || !toIntl(phone)} className={`${btnPrimary} w-full py-3`}>
              {busy ? <><Loader2 className="size-4 animate-spin" /> Mengirim...</> : "Kirim kode OTP"}
            </button>
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">Dengan melanjutkan, Anda setuju nomor ini dipakai untuk komunikasi pemesanan.</p>
          </form>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <input value={otp} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setOtp(v); setError(""); if (v.length === 6) verify(v); }}
              type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus aria-label="Kode OTP" placeholder="••••••" disabled={busy}
              className={`${inputCls} py-4 text-center !text-2xl font-semibold tracking-[0.5em]`} />
            {error && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button onClick={() => verify(otp)} disabled={busy || otp.length !== 6} className={`${btnPrimary} w-full py-3`}>
              {busy ? <><Loader2 className="size-4 animate-spin" /> Memeriksa...</> : "Verifikasi"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button onClick={() => { setStep("phone"); setError(""); setPhone(intl.slice(2)); }} className="inline-flex cursor-pointer items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                <ArrowLeft className="size-4" /> Ganti nomor
              </button>
              <button onClick={() => sendCode()} disabled={cooldown > 0 || busy} className="cursor-pointer font-medium disabled:cursor-not-allowed disabled:text-neutral-400 dark:disabled:text-neutral-500">
                {cooldown > 0 ? `Kirim ulang (${cooldown}d)` : "Kirim ulang kode"}
              </button>
            </div>
          </div>
        )}

        {step === "name" && (
          <form onSubmit={saveName} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Nama lengkap</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus autoComplete="name" maxLength={120} placeholder="Nama Anda" className={inputCls} />
            </label>
            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={busy || name.trim().length < 2} className={`${btnPrimary} w-full py-3`}>
              {busy ? "Menyimpan..." : "Lanjut"}
            </button>
          </form>
        )}
      </div>
    </div>
    </HelmetProvider>
  );
}
