import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Spinner, Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

import useMapInputOptions from "@/hooks/useMapInputOptions";
import TextInputComponent from "@components/Flowbite/Input";
import TextareaComponent from "@components/Flowbite/Textarea";
import SelectTwo from "@components/Flowbite/SelectTwo";
import Form from "@components/Form/Form";

import { ICreatePayload } from "@services/admin/package/interfaces/create.type";
import useCreate from "@services/admin/package/hooks/useCreate";
import useGetAllAdminPackageCategory from "@services/admin/package-category/hooks/useGetAllPackageCategory";

type FormFields = ICreatePayload;

export default function PackageCreate() {
  const navigate = useNavigate();

  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const packageCategory = methods.watch("package_category_id");
  const isValid = methods.formState.isValid && !!packageCategory;

  const { data } = useGetAllAdminPackageCategory();
  const { createData } = useCreate();

  const packageCategoryOptions = useMapInputOptions(data);

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    const { error, response } = await createData(state);

    if (error || response) {
      if (error) {
        toast.error("Failed to add!", {
          position: "top-center",
        });
      } else {
        navigate("/admin/packages");
        toast.success("Added successfully.", {
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
            <TextInputComponent
              label="Name"
              type="text"
              name="name"
              placeholder="Name of package"
              isRequired
            />

            <SelectTwo
              label="Category"
              name="package_category_id"
              isSearchable
              isRequired
              selectTwoOptions={packageCategoryOptions}
            />

            <TextInputComponent
              label="Price"
              type="number"
              name="price"
              placeholder="Price of package"
              isRequired
            />

            <TextInputComponent
              label="Discount"
              type="number"
              max={100}
              name="discount"
              placeholder="Discount of package"
              isRequired
            />
          </div>

          <TextareaComponent
            label="Description"
            placeholder="Description of package"
            name="description"
            rows={5}
            isRequired
          />

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className={`md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${
                !isValid || isSubmitting
                  ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed focus:outline-none disabled:opacity-100"
                  : " bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
              }`}
              disabled={!isValid || isSubmitting}
            >
              {!isSubmitting ? "Submit" : <Spinner />}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
