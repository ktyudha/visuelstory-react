// import { NavLink } from "react-router-dom";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import clsx from "clsx";

// import Logo from "@/assets/logo/logo-edubook.svg";
// import Form from "@components/Form/Form";
// import FormInput from "@/components/Form/FormInput";
// import Icon from "@components/Icon";
// import Button from "@components/Button";
// import useLogin from "@modules/[common]/auth/login/hooks/useLogin";
// import { isAxiosError } from "axios";

// interface CredentialPayload {
//   username: string;
//   password: string;
// }
export default function LoginPage() {
  //   const navigate = useNavigate();
  //   const methods = useForm<CredentialPayload>({ mode: "onChange" });
  //   const { isSubmitting, isValid } = methods.formState;

  //   const { handleLogin } = useLogin("reader");

  //   const onSubmit: SubmitHandler<CredentialPayload> = async (state) => {
  //     try {
  //       await handleLogin(state.username, state.password);
  //       navigate("/");
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
    <div className="w-full h-screen max-w-sm justify-center mx-auto bg-[#F1F5F9]">
      <h1>Login</h1>
      {/* <Icon name="spiral-3d" size={359}></Icon> */}
      {/* <div className="bg-white max-w-sm min-h-screen rounded-t-[20px] absolute top-[20%]">
        <NavLink to="/" className="flex pt-[43px] mx-auto justify-center mb-6">
          <img
            src={Logo}
            alt="logo-edubook"
            className="mr-3 w-[38px] h-[38px]"
          />
          <span className="font-bold text-2xl my-auto">Edubook</span>
        </NavLink>

        <div className="text-center mx-6">
          <h3 className="text-[#020617] font-bold text-[32px] leading-8 mb-2">
            Masuk ke Edubook
          </h3>
          <p className="text-base text-[#334155] font-normal">
            Masuk untuk melanjutkan petualangan membaca kamu.
          </p>
        </div>

        <div className="p-5 bg-white rounded-b-xl">
          <Form {...methods} onSubmit={onSubmit}>
            <FormInput
              label="Nama Pengguna"
              name="username"
              type="text"
              placeholder="Masukkan nama pengguna"
              isRequired
            />
            <FormInput
              label="Kata Sandi"
              name="password"
              type="password"
              placeholder="*********"
              withShowPasswordButton
              isRequired
            />
            <Button
              type="submit"
              className={clsx([
                "block w-full py-2 rounded-xl font-semibold mb-2 cursor-pointer",
                isValid
                  ? "bg-[#10B981] hover:bg-[#10B981] text-white"
                  : "bg-neutral-200 text-neutral-400",
              ])}
              disabled={isSubmitting || !isValid}
            >
              <span>{isSubmitting ? "Loading..." : "Masuk"}</span>
            </Button>
          </Form>
        </div>
      </div> */}
    </div>
  );
}
