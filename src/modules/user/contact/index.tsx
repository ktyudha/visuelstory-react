import Image from "@components/Image";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Metadata from "@components/Metadata";
import FormInput from "@components/Form/FormInput";

import Spinner from "@components/Reusable/Spinner";
import useCreateInvestment from "@services/user/investment/hooks/useCreate";

import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { ICreateInvestmentPayload } from "@services/user/investment/interfaces/create.types";

type FormFields = ICreateInvestmentPayload;

export default function Contact() {
  const navigate = useNavigate();
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const { createInvestment } = useCreateInvestment();

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    try {
      await createInvestment({ ...state });
      toast.success(`Berhasil Mendapatkan Pricelist!`, {
        position: "top-right",
      });
      methods.reset();
      navigate("/investment");
    } catch (error: any) {
      toast.error((error as Error).message, {
        position: "top-right",
      });
    }
  };
  return (
    <>
      <Metadata title="Contact" />
      <section id="contact" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-center z-50 brightness-75"
          name="contact"
        />

        <div className="max-w-2xl min-h-[22vh] flex flex-col items-left justify-center mx-auto px-8">
          <h2 className="md:text-4xl text-2xl text-start">
            Hi, we've finally met.
          </h2>
        </div>

        <div className="max-w-2xl px-8 mx-auto">
          <p className=" text-sm text-justify mb-8">
            We're so happy to have you here. If you're interested in our works,
            that means you have a great taste in seeing pictures through
            photography just like us. Please fill in the form and you'll be
            directed to our pricelist. Or, if you have other inquiry, you could
            hit us through WhatsApp from the link below.
            <br /> <br />
            Have a nice day! Hope to see you in your happiest moment.
          </p>

          <FormProvider {...methods}>
            <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-3 mb-3">
                <FormInput
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="visuelstory"
                  isRequired
                />
                <FormInput
                  label="Email (opsional)"
                  name="email"
                  type="text"
                  placeholder="name@gmail.com"
                />
                <FormInput
                  label="WhatsApp"
                  name="whatsapp"
                  type="text"
                  placeholder="62 xxx xxxx xxxx"
                  isRequired
                />
                <FormInput
                  label="Location"
                  name="location"
                  type="textarea"
                  placeholder="Sidoarjo"
                  isRequired
                />
              </div>
              <div className="md:w-3xs w-full mt-6 mb-3 flex gap-5 justify-center">
                <button
                  type="submit"
                  className={`w-full rounded-lg py-2 font-medium text-base text-white ${
                    !isValid || isSubmitting
                      ? "bg-[#B9AA96] cursor-not-allowed focus:outline-none disabled:opacity-100"
                      : "bg-[#928763] cursor-pointer"
                  }`}
                  disabled={!isValid || isSubmitting}
                >
                  {!isSubmitting ? "Pricelist" : <Spinner />}
                </button>
              </div>
            </form>
          </FormProvider>

          {/* <NavLink
            to="/investment"
            className="bg-[#B9AA96] hover:bg-[#928763] uppercase py-3 px-9 rounded-lg tracking-wider text-white cursor-pointer md:text-sm text-xs"
          >
            Pricelist
          </NavLink> */}
        </div>
      </section>
    </>
  );
}
