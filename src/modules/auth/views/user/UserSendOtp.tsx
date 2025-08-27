import Button from "@components/Button";
import { GalleryVerticalEnd } from "lucide-react";
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

export default function UserSendOtp() {
  const navigate = useNavigate();
  const setWhatsapp = useGlobalStore((state) => state.setWhatsapp);

  const methods = useForm<CredentialPayload>({ mode: "onChange" });
  const { isSubmitting, isValid } = methods.formState;

  const { handleSendOtp } = useSendOtp("customer");

  const onSubmit: SubmitHandler<CredentialPayload> = async (state) => {
    try {
      await handleSendOtp(state.whatsapp);
      setWhatsapp(state.whatsapp);
      navigate(`/verify-otp?whatsapp=${state.whatsapp}`);
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
              <h1 className="text-xl font-bold">Welcome to Inbeworks.</h1>
              <div className="text-center text-sm">
                Send an email to get an OTP
              </div>
            </div>
            <Form {...methods} onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormInput
                    label="WhatsApp"
                    name="whatsapp"
                    type="number"
                    placeholder="62 xxxx xxxx xxx"
                    isRequired
                  />
                </div>
                <Button
                  type="submit"
                  className={clsx([
                    "block w-full py-2 rounded-xl font-semibold mb-2 cursor-pointer",
                    isValid
                      ? "bg-neutral-900 hover:bg-neutral-700 text-white"
                      : "bg-neutral-200 text-neutral-400",
                  ])}
                  disabled={isSubmitting || !isValid}
                >
                  <span>{isSubmitting ? "Loading..." : "Login"}</span>
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
