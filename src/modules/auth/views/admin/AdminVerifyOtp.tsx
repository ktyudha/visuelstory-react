import ThemeToggle from "../../../../theme/ThemeToggle";
import { useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import AuthHeader from "@modules/auth/views/AuthHeader";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@components/Button";
import OtpInput from "@components/Form/OtpInput";

import useLogin from "@modules/auth/services/hooks/useLogin";
import Spinner from "@components/Reusable/Spinner";


export default function AdminVerifyOtp() {
  const otpLength = 6;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const whatsapp = searchParams.get("whatsapp") ?? "";


  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const { handleLogin } = useLogin("admin");


  const onSubmit = async (otp: string) => {
    if (otp.length !== otpLength) return;

    try {
      setSubmitLoading(true);
      await handleLogin(whatsapp, otp);

      toast.success("Verifikasi berhasil!");
      navigate("/admin/dashboard", { replace: true });
    } catch {
      toast.error("Kode verifikasi tidak valid!");
    } finally {
      setSubmitLoading(false);
    }
  };


  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="fixed right-3 top-[calc(0.75rem+env(safe-area-inset-top))]"><ThemeToggle className="!text-neutral-500 hover:!bg-neutral-200 dark:!text-neutral-400 dark:hover:!bg-neutral-800" /></div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <AuthHeader title="Verifikasi kode OTP" subtitle="Masukkan 6 digit kode yang dikirim ke WhatsApp Anda." admin />
            <div className="space-y-6">
              <OtpInput
                numOfInputs={otpLength}
                autoFocus
                onChange={(value) => {
                  setOtpCode(value);

                  if (value.length === otpLength) {
                    onSubmit(value);
                  }
                }}
                autoSubmit
              />

              <Button
                className={clsx([
                  "block w-full py-2 rounded-xl font-semibold mb-2 ",
                  otpCode?.length === otpLength && !submitLoading
                    ? "bg-neutral-900 hover:bg-neutral-700 text-white cursor-pointer"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed",
                ])}
                disabled={otpCode?.length !== otpLength || submitLoading}
                onClick={() => otpCode && onSubmit(otpCode)}
              >
                {!submitLoading ? "Verifikasi" : <Spinner />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
