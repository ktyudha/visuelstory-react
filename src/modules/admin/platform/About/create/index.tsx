import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useCreateAbout from "@services/admin/about/hooks/create.type";
import useGetOneAbout from "@services/admin/about/hooks/get-one.types";
import { ICreateUpdateAboutPayload } from "@services/admin/about/interfaces/create-update-about.types";

import Spinner from "@components/Reusable/Spinner";
import FormInput from "@components/Form/FormInput";

type FormFields = ICreateUpdateAboutPayload;

export default function AboutCreate() {
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const aboutId = "x5g1aXJ1sx30rVFP6Nsd";

  const { createAbout } = useCreateAbout();
  const { data, loading } = useGetOneAbout(aboutId);
  console.log(data);

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    const { error, response } = await createAbout({ ...state });
    if (error || response) {
      if (error) {
        toast.error("Gagal Menambahkan Obat", {
          position: "top-right",
        });
      } else {
        toast.success("Sukses Menambahkan Obat", {
          position: "top-right",
        });

        methods.reset();
      }
    }
  };
  return (
    <>
      <div className="mb-1">
        <h2 className="font-medium">About Create</h2>
      </div>
      <FormProvider {...methods}>
        <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="flex gap-5 mb-3">
            <div className="flex-1">
              <div className="flex flex-col gap-3 mb-3">
                <FormInput
                  label="Title"
                  type="text"
                  placeholder="Title"
                  name="title"
                  isRequired
                />
                <FormInput
                  label="Description"
                  type="textarea"
                  placeholder="Description"
                  name="description"
                  isRequired
                />
              </div>
            </div>
          </div>

          <div className="w-full mt-6 mb-3 flex gap-5 justify-center">
            <button
              type="submit"
              className={`w-full rounded-lg py-2 font-medium text-base text-white ${
                !isValid || isSubmitting
                  ? "bg-[#9fe194] cursor-not-allowed focus:outline-none disabled:opacity-100"
                  : "bg-[#4bb43a] hover:bg-[#379029]"
              }`}
              disabled={!isValid || isSubmitting}
            >
              {!isSubmitting ? "Submit" : <Spinner />}
            </button>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
