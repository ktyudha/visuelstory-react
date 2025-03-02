import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useCreateContact from "@services/admin/contact/hooks/create.type";
import useUpdateContact from "@services/admin/contact/hooks/update.type";
import useGetAllContact from "@services/admin/contact/hooks/get-all.type";
import { ICreateUpdateContactPayload } from "@services/admin/contact/interfaces/create-update.types";
import { IGetAllContactResponse } from "@services/admin/contact/interfaces/get-all.types";

import Card from "@components/Card";
import Spinner from "@components/Reusable/Spinner";
import FormInput from "@components/Form/FormInput";
import Skeleton from "@components/Skeleton/Skeleton";

type FormFields = ICreateUpdateContactPayload;

export default function ContactCreate() {
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const [contact, setContact] = useState<IGetAllContactResponse | null>(null);

  const { data, isLoading } = useGetAllContact();
  const { createContact } = useCreateContact();
  const { updateContact } = useUpdateContact();

  useEffect(() => {
    if (data?.length) {
      setContact(data?.[0] as IGetAllContactResponse);
    }
  }, [data]);

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    try {
      const { error } = contact?.id
        ? await updateContact(contact?.id, { ...state })
        : await createContact({ ...state });

      if (error) {
        toast.error(`Gagal ${contact?.id ? "Mengupdate" : "Menambahkan"}`, {
          position: "top-right",
        });
      } else {
        toast.success(
          `Berhasil ${contact?.id ? "Mengupdate" : "Menambahkan"}`,
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
    if (contact) {
      methods.reset(contact);
    }
  }, [contact, methods]);

  return (
    <>
      <div className="mb-1">
        <h2 className="font-medium">Contact</h2>
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
                      defaultValue={contact?.title}
                      isRequired
                    />
                  </Skeleton>
                  <Skeleton isLoading={isLoading} height="40px">
                    <FormInput
                      label="Short Description"
                      type="text"
                      placeholder="Short Description"
                      name="short_description"
                      defaultValue={contact?.short_description}
                      isRequired
                    />
                  </Skeleton>
                  <Skeleton isLoading={isLoading} height="70px">
                    <FormInput
                      label="Description"
                      type="textarea"
                      placeholder="Description"
                      name="description"
                      defaultValue={contact?.description}
                      isRequired
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
                    contact?.id ? (
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
