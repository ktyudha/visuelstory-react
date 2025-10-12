import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Spinner } from "flowbite-react";
import { HiChevronLeft } from "react-icons/hi";
import { toast } from "react-toastify";

import InvoiceCreateStepper from "./CreateStepper";
import StepperUser from "./StepperForm/StepperUser.tsx";

import Form from "@components/Form/Form";

import { ICreatePayload } from "@services/admin/invoice/interfaces/create.type";
import useCreate from "@services/admin/invoice/hooks/useCreate";
import { useNavigate } from "react-router-dom";
import StepperPackage from "./StepperForm/StepperPackage.tsx";
import StepperPayment from "./StepperForm/StepperPayment.tsx";

type FormFields = ICreatePayload;

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  const uploadsRef = useRef<HTMLInputElement | null>(null);

  const methods = useForm<FormFields>({
    mode: "onChange",
    shouldUnregister: false,
  });

  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const { createData } = useCreate();

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    // console.log(state);
    const imageFile = uploadsRef.current?.files?.[0];
    const { error, response } = await createData({
      ...state,
      proof: imageFile,
    });
    if (error || response) {
      if (error) {
        toast.error("Failed to add!", {
          position: "top-center",
        });
      } else {
        navigate(-1);
        toast.success("Added successfully.", {
          position: "top-center",
        });
        methods.reset();
      }
    }
  };

  const handleNext = async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    if (step < 2) setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (step == 0) navigate(-1);
    if (step > 0) setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div>
      <InvoiceCreateStepper activeStep={step} />

      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mt-6">
        <Form {...methods} onSubmit={onSubmit}>
          <div className="w-full flex flex-col gap-4">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              {step == 0 && <StepperUser />}
              {step == 1 && <StepperPackage />}
              {step == 2 && <StepperPayment uploadsRef={uploadsRef} />}
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              type="button"
              onClick={handleBack}
              className="group flex items-center cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800 px-4 py-2 rounded-lg"
            >
              <HiChevronLeft size={22} />
              <span className="transition-all duration-300 ease-in-out opacity-0 max-w-0 overflow-hidden group-hover:opacity-100 group-hover:max-w-[50px]">
                Back
              </span>
            </Button>

            <Button
              type={step == 2 ? "submit" : "button"}
              onClick={step === 2 ? undefined : handleNext}
              className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
              disabled={!isValid || isSubmitting}
            >
              {step == 2 ? !isSubmitting ? "Create" : <Spinner /> : "Next"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
