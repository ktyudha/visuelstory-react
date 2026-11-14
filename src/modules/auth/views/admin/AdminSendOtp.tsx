import ThemeToggle from "../../../../theme/ThemeToggle";
import AuthHeader from "@modules/auth/views/AuthHeader";
import Button from "@components/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import FormInput from "@components/Form/FormInput";
import Form from "@components/Form/Form";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import useSendOtp from "@modules/auth/services/hooks/useSendOtp";
import clsx from "clsx";
import useGlobalStore from "@store/useStore";
import { useNavigate } from "react-router-dom";

interface CredentialPayload {
  whatsapp: string;
}

export default function AdminSendOtp() {
  const navigate = useNavigate();
  const setWhatsapp = useGlobalStore((state) => state.setWhatsapp);

  const methods = useForm<CredentialPayload>({ mode: "onChange" });
  const { isSubmitting, isValid } = methods.formState;

  const { handleSendOtp } = useSendOtp("admin");

  const onSubmit: SubmitHandler<CredentialPayload> = async (state) => {
    try {
      await handleSendOtp(state.whatsapp);
      setWhatsapp(state.whatsapp);
      navigate(`/admin/verify-otp?whatsapp=${state.whatsapp}`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message, {
          position: "top-right",
        });
      } else {
        toast.error((error as Error).message, {
          position: "top-right",
        });
      }
    }
  };
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="fixed right-3 top-[calc(0.75rem+env(safe-area-inset-top))]"><ThemeToggle className="!text-neutral-500 hover:!bg-neutral-200 dark:!text-neutral-400 dark:hover:!bg-neutral-800" /></div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <AuthHeader title="Masuk Admin" subtitle="Masukkan nomor WhatsApp admin untuk menerima OTP." admin />
<Form {...methods} onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormInput
                    label="Nomor WhatsApp"
                    name="whatsapp"
                    type="tel"
                    placeholder="62812xxxxxxx"
                    isRequired
                  />
                </div>
                <Button
                  type="submit"
                  className={clsx([
                    "block w-full py-2 rounded-xl font-semibold mb-2 ",
                    isValid
                      ? "bg-neutral-900 hover:bg-neutral-700 text-white dark:bg-white dark:text-gray-800 cursor-pointer"
                      : "bg-neutral-200 text-neutral-400 dark:text-white dark:bg-gray-800 cursor-not-allowed",
                  ])}
                  disabled={isSubmitting || !isValid}
                >
                  <span>{isSubmitting ? "Memproses..." : "Masuk"}</span>
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
