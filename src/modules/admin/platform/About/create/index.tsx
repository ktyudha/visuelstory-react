import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useCreateAbout from "@services/admin/about/hooks/create.type";
import useUpdateAbout from "@services/admin/about/hooks/update.type";
import useGetAllAbout from "@services/admin/about/hooks/get-all.type";
import { ICreateUpdateAboutPayload } from "@services/admin/about/interfaces/create-update-about.types";
import { IGetAllAboutResponse } from "@services/admin/about/interfaces/get-all.types";

import Card from "@components/Card";
import Spinner from "@components/Reusable/Spinner";
import FormInput from "@components/Form/FormInput";
import Skeleton from "@components/Skeleton/Skeleton";

type FormFields = ICreateUpdateAboutPayload;

export default function AboutCreate() {
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const [about, setAbout] = useState<IGetAllAboutResponse | null>(null);

  const { data, isLoading } = useGetAllAbout();
  const { createAbout } = useCreateAbout();
  const { updateAbout } = useUpdateAbout();

  useEffect(() => {
    if (data?.length) {
      setAbout(data?.[0] as IGetAllAboutResponse);
    }
  }, [data]);

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
        methods.reset();
      }
    } catch (error: any) {
      toast.error((error as Error).message, {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    if (about) {
      methods.reset(about);
    }
  }, [about, methods]);

  return (
    <>
      <div className="mb-1">
        <h2 className="font-medium">About</h2>
      </div>

      <Card>
        <FormProvider {...methods}>
          <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="flex gap-5 mb-3">
              <div className="flex-1">
                <div className="flex flex-col gap-3 mb-3">
                  <Skeleton isLoading={isLoading} height="40px">
                    <FormInput
                      label="Title"
                      type="text"
                      placeholder="Title"
                      name="title"
                      defaultValue={about?.title}
                      isRequired
                    />
                  </Skeleton>
                  <Skeleton isLoading={isLoading} height="100px">
                    <FormInput
                      label="Description"
                      type="textarea"
                      placeholder="Description"
                      name="description"
                      defaultValue={about?.description}
                      isRequired
                      className="lg:h-auto h-[100px]"
                    />
                  </Skeleton>
                </div>
              </div>
            </div>

            <div className="md:w-3xs w-full mt-6 mb-3 flex gap-5 justify-center">
              <Skeleton isLoading={isLoading} height="40PX">
                <button
                  type="submit"
                  className={`w-full rounded-lg py-2 font-medium text-base text-white ${
                    !isValid || isSubmitting
                      ? "bg-[#9fe194] cursor-not-allowed focus:outline-none disabled:opacity-100"
                      : "bg-[#4bb43a] hover:bg-[#379029]"
                  }`}
                  disabled={!isValid || isSubmitting}
                >
                  {!isSubmitting ? (
                    about?.id ? (
                      "Update"
                    ) : (
                      "Submit"
                    )
                  ) : (
                    <Spinner />
                  )}
                </button>
              </Skeleton>
            </div>
          </form>
        </FormProvider>
      </Card>
    </>
  );
}
