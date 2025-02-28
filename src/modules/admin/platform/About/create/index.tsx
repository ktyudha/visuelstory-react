import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useCreateAbout from "@services/admin/about/hooks/create.type";
import useUpdateAbout from "@services/admin/about/hooks/update.type";
// import useGetOneAbout from "@services/admin/about/hooks/get-one.types";
import useGetAllAbout from "@services/admin/about/hooks/get-all.type";
import { ICreateUpdateAboutPayload } from "@services/admin/about/interfaces/create-update-about.types";
import { IGetAllAboutResponse } from "@services/admin/about/interfaces/get-all.types";

import Spinner from "@components/Reusable/Spinner";
import FormInput from "@components/Form/FormInput";

type FormFields = ICreateUpdateAboutPayload;

export default function AboutCreate() {
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  // const aboutId = "x5g1aXJ1sx30rVFP6Nsd";
  const [about, setAbout] = useState<IGetAllAboutResponse | null>(null);

  const { data, isLoading } = useGetAllAbout();
  const { createAbout } = useCreateAbout();
  const { updateAbout } = useUpdateAbout();
  // const { data, isLoading, refreshData } = useGetOneAbout(aboutId);

  useEffect(() => {
    if (data?.length) {
      setAbout(data?.[0] as IGetAllAboutResponse);
    }
  }, [data]);

  // console.log(data?.[0]);
  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    try {
      const { error } = about?.id
        ? await updateAbout(about?.id, { ...state })
        : await createAbout({ ...state });

      if (error) {
        toast.error(`Gagal ${about?.id ? "Mengupdate" : "Menambahkan"} About`, {
          position: "top-right",
        });
      } else {
        toast.success(
          `Berhasil ${about?.id ? "Mengupdate" : "Menambahkan"} About`,
          {
            position: "top-right",
          }
        );
        // await refreshData();
        methods.reset();
      }
    } catch (error: any) {
      toast.error((error as Error).message, {
        position: "top-right",
      });
    }

    // const { error, response } = await createAbout({ ...state });
    // if (error || response) {
    //   if (error) {
    //     toast.error("Gagal Menambahkan About", {
    //       position: "top-right",
    //     });
    //   } else {
    //     toast.success("Sukses Menambahkan About", {
    //       position: "top-right",
    //     });

    //     methods.reset();
    //   }
    // }
  };

  useEffect(() => {
    if (about) {
      methods.reset(about);
    }
  }, [about, methods]);

  return (
    <>
      <div className="mb-1">
        <h2 className="font-medium">
          {about?.id ? "Edit About" : "Create About"}
        </h2>
      </div>
      {isLoading || !about ? (
        <Spinner />
      ) : (
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
                    defaultValue={about?.title}
                    isRequired
                  />
                  <FormInput
                    label="Description"
                    type="textarea"
                    placeholder="Description"
                    name="description"
                    defaultValue={about?.description}
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
                {!isSubmitting ? about?.id ? "Update" : "Submit" : <Spinner />}
              </button>
            </div>
          </form>
        </FormProvider>
      )}
    </>
  );
}
