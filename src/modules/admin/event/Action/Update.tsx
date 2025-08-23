import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Spinner, Button } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";

import TextInputComponent from "@components/Flowbite/Input";
import Form from "@components/Form/Form";
import Skeleton from "@components/Skeleton/Skeleton";

import { ICreatePayload } from "@services/admin/package-addon/interfaces/create.type";
import useUpdate from "@services/admin/package-addon/hooks/useUpdate";
import useGet from "@services/admin/package-addon/hooks/useGet";

type FormFields = ICreatePayload;

export default function PackageAddOnCreate() {
  const navigate = useNavigate();
  const params = useParams();

  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const { data, loading } = useGet(params.packageAddOnId as string);

  const { updateData } = useUpdate(params.packageAddOnId as string);

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    const { error, response } = await updateData(state);
    if (error || response) {
      if (error) {
        toast.error("Failed to update!", {
          position: "top-center",
        });
      } else {
        navigate(-1);
        toast.success("Updated successfully.", {
          position: "top-center",
        });
        methods.reset();
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Form {...methods} onSubmit={onSubmit}>
        <div className="w-full flex flex-col gap-4">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label="Name"
                type="text"
                name="name"
                defaultValue={data?.name}
                placeholder="Name of package addon"
                isRequired
              />
            </Skeleton>
            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label="Price"
                type="number"
                name="price"
                defaultValue={data?.price}
                placeholder="Price of package addon"
                isRequired
              />
            </Skeleton>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="group flex items-center cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800 px-4 py-2 rounded-lg"
            >
              <HiChevronLeft size={22} />
              <span className="transition-all duration-300 ease-in-out opacity-0 max-w-0 overflow-hidden group-hover:opacity-100 group-hover:max-w-[50px]">
                Back
              </span>
            </Button>
            <Skeleton isLoading={loading} height="5rem">
              <Button
                type="submit"
                className={`md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${
                  !isValid || isSubmitting
                    ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed focus:outline-none disabled:opacity-100"
                    : " bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                }`}
                disabled={!isValid || isSubmitting}
              >
                {!isSubmitting ? "Update" : <Spinner />}
              </Button>
            </Skeleton>
          </div>
        </div>
      </Form>
    </div>
  );
}
