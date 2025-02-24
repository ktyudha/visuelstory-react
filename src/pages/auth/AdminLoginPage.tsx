// import Logo from "@/assets/logo/logo-circle.svg";

import { useNavigate } from "react-router-dom";

import FormInput from "@components/Form/FormInput";
import { SubmitHandler, useForm } from "react-hook-form";
import clsx from "clsx";
import Form from "@components/Form/Form";
import Button from "@components/Button";

interface CredentialPayload {
  email: string;
  password: string;
}

import { useState } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "@constants/firebase";
import Metadata from "@components/Metadata";

export default function AdminLoginPage() {
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log(user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  const methods = useForm<CredentialPayload>({ mode: "onChange" });
  const { isSubmitting, isValid } = methods.formState;

  const onSubmit: SubmitHandler<CredentialPayload> = async (state) => {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        state.email,
        state.password
      );

      setUser(result.user);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Metadata title="Sign In" />
      <div className="w-full h-screen bg-neutral-50">
        <div className="grid grid-cols-12">
          <div className="col-span-4 hidden md:block"></div>
          <div className="col-span-12 lg:col-span-4 flex items-center w-full h-screen px-5">
            <div className="rounded-xl border-2 shadow-xl bg-base-100 w-full p-10">
              <div className="flex flex-col text-left gap-1 text-black rounded-t-xl mb-6 ">
                {/* <img src={Logo} alt="Logo" /> */}
                <h1
                  className="text-4xl italic text-[#B9AA96] mb-6 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Visuelstory
                </h1>
                <h1 className="text-[20px] font-semibold font-sans tracking-wider">
                  Hi, Welcome Back! 👋
                </h1>
                <span className="text-[20px] font-sans font-thin">
                  It's good to see you again
                </span>
              </div>
              <div className="rounded-b-xl">
                <Form {...methods} onSubmit={onSubmit}>
                  <FormInput
                    label="E-Mail"
                    name="email"
                    type="email"
                    placeholder="Email"
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
                    className={clsx([
                      "block w-full py-2 rounded-xl font-semibold cursor-pointer font-sans mt-2 mb-1",
                      isValid
                        ? "bg-[#B9AA96] text-white hover:bg-[#928763] hover:text-white"
                        : "bg-[#eeece6] text-[#52453c]",
                    ])}
                    disabled={isSubmitting || !isValid}
                  >
                    <span>{isSubmitting ? "Loading..." : "Sign In"}</span>
                  </Button>
                  <Button
                    type="button"
                    className={
                      "block w-full py-2 rounded-xl font-semibold cursor-pointer font-sans outline-2 outline-[#B9AA96] text-[#B9AA96] hover:bg-[#B9AA96] hover:text-white"
                    }
                    onClick={handleLogin}
                  >
                    <span className="flex gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="bi bi-google h-4 w-4 my-auto"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                      </svg>
                      Sign In with Google
                    </span>
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
