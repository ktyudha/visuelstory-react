import { useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { GalleryVerticalEnd } from "lucide-react";
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

      toast.success("Verifikasi akun berhasil!", {
        onClose: () => navigate("/admin/dashboard"),
      });

      setSubmitLoading(false);
    } catch (error) {
      toast.error("Kode verifikasi tidak valid!");
      setSubmitLoading(false);
    }
  };


  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to Visuelstory.</h1>
              <div className="text-center text-sm">
                Send an WhatsApp to get an OTP
              </div>
            </div>
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
                  otpCode?.length !== otpLength || submitLoading
                    ? "bg-neutral-900 hover:bg-neutral-700 text-white dark:bg-white dark:text-gray-800 cursor-pointer"
                    : "bg-neutral-200 text-neutral-400 dark:text-white dark:bg-gray-800 cursor-not-allowed",
                ])}
                disabled={otpCode?.length !== otpLength || submitLoading}
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
