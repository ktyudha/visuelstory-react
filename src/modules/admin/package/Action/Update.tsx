import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Spinner, Button } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";

import useMapInputOptions from "@/hooks/useMapInputOptions";
import TextInputComponent from "@components/Flowbite/Input";
import TextareaComponent from "@components/Flowbite/Textarea";
import SelectTwo from "@components/Flowbite/SelectTwo";
import Form from "@components/Form/Form";
import Skeleton from "@components/Skeleton/Skeleton";
import { HiChevronLeft } from "react-icons/hi";

import { ICreatePayload } from "@services/admin/package/interfaces/create.type";
import useUpdate from "@services/admin/package/hooks/useUpdate";
import useGet from "@services/admin/package/hooks/useGet";
import useGetAllAdminPackageCategory from "@services/admin/package-category/hooks/useGetAllPackageCategory";

type FormFields = ICreatePayload;

export default function PackageCreate() {
  const navigate = useNavigate();
  const params = useParams();

  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const packageCategory = methods.watch("package_category_id");
  const isValid = methods.formState.isValid && !!packageCategory;

  const { data: PackageCategories } = useGetAllAdminPackageCategory();
  const { data, loading } = useGet(params.packageId as string);
  const { updateData } = useUpdate(params.packageId as string);

  const packageCategoryOptions = useMapInputOptions(PackageCategories);

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    const { error, response } = await updateData(state);

    if (error || response) {
      if (error) {
        toast.error("Failed to update!", {
          position: "top-center",
        });
      } else {
        navigate("/admin/packages");
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
                placeholder="Name of package"
                isRequired
              />
            </Skeleton>
            <Skeleton isLoading={loading} height="2.5rem">
              <SelectTwo
                label="Category"
                name="package_category_id"
                isSearchable
                isRequired
                defaultValue={
                  data?.package_category?.id
                    ? packageCategoryOptions.filter(
                        (opt) => opt.value === data.package_category.id
                      )
                    : null
                }
                selectTwoOptions={packageCategoryOptions}
              />
            </Skeleton>
            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label="Price"
                type="number"
                name="price"
                defaultValue={data?.price}
                placeholder="Price of package"
                isRequired
              />
            </Skeleton>
            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label="Discount"
                type="number"
                max={100}
                name="discount"
                defaultValue={data?.discount}
                placeholder="Discount of package"
                isRequired
              />
            </Skeleton>
          </div>
          <Skeleton isLoading={loading} height="5rem">
            <TextareaComponent
              label="Description"
              placeholder="Description of package"
              name="description"
              defaultValue={data?.description}
              rows={5}
              isRequired
            />
          </Skeleton>
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
