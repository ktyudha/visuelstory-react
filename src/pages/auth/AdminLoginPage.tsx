// import Logo from "@/assets/logo/logo-lg.svg";
// import FormInput from "@components/Form/FormInput";
// import { SubmitHandler, useForm } from "react-hook-form";
// import clsx from "clsx";
// import Form from "@components/Form/Form";
// import Button from "@components/Button";
// import { toast } from "react-toastify";
// import useLogin from "@modules/[common]/auth/login/hooks/useLogin";
// import { useNavigate } from "react-router-dom";
// import { isAxiosError } from "axios";

// interface CredentialPayload {
//   username: string;
//   password: string;
// }

export default function AdminLoginPage() {
  //   const navigate = useNavigate();
  //   const methods = useForm<CredentialPayload>({ mode: "onChange" });
  //   const { isSubmitting, isValid } = methods.formState;

  //   const { handleLogin } = useLogin("admin");

  //   const onSubmit: SubmitHandler<CredentialPayload> = async (state) => {
  //     try {
  //       await handleLogin(state.username, state.password);
  //       navigate("/admin/dashboard");
  //     } catch (error) {
  //       if (isAxiosError(error)) {
  //         toast.error(error.response?.data?.message, {
  //           position: "top-right",
  //         });
  //       } else {
  //         toast.error((error as Error).message, {
  //           position: "top-right",
  //         });
  //       }
  //     }
  //   };

  return (
    <div className="w-full h-screen bg-neutral-50">
      <h1>Admin Login</h1>
      {/* <div className="grid grid-cols-12">
        <div className="col-span-4 hidden md:block"></div>
        <div className="col-span-12 lg:col-span-4 flex items-center w-full h-screen px-5">
          <div className="rounded-xl w-full">
            <div className="bg-neutral-950 flex flex-col items-center gap-3 text-white rounded-t-xl p-5">
              <img src={Logo} alt="Logo" />
              <h1 className="text-[24px] font-semibold">Let's Get Started</h1>
              <span className="text-[14px]">Sign in to continue</span>
            </div>
            <div className="p-5 bg-white rounded-b-xl">
              <Form {...methods} onSubmit={onSubmit}>
                <FormInput
                  label="Username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  isRequired
                />
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  withShowPasswordButton
                  isRequired
                />
                <Button
                  type="submit"
                  variant="primary"
                  className={clsx([
                    "block w-full py-2 rounded-xl font-semibold mb-2 cursor-pointer",
                    isValid
                      ? "bg-primary-500 hover:bg-primary-700 text-white"
                      : "bg-neutral-200 text-neutral-400",
                  ])}
                  disabled={isSubmitting || !isValid}
                >
                  <span>{isSubmitting ? "Loading..." : "Login"}</span>
                </Button>
                <div className="text-center">
                  <span className="underline text-neutral-950 font-medium text-md">
                    Forgot Password
                  </span>
                </div>
              </Form>
            </div>
          </div>
        </div>
        <div className="col-span-4 hidden md:block"></div>
      </div> */}
    </div>
  );
}
