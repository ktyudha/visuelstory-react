import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Spinner, Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import { useState, useMemo } from "react";

import TextInputComponent from "@components/Flowbite/Input";
import TextareaComponent from "@components/Flowbite/Textarea";
import SelectTwo from "@components/Flowbite/SelectTwo";
import Form from "@components/Form/Form";

import { ICreatePayload } from "@services/admin/invoice/interfaces/create.type";
import useCreate from "@services/admin/invoice/hooks/useCreate";
import useGetAll from "@services/admin/package/hooks/useGetAll";

type FormFields = ICreatePayload;

export default function PackageAddOnCreate() {
  const navigate = useNavigate();

  /** call api */
  const { data, setName } = useGetAll();

  const packageOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return data.map((each: any) => ({
      label: each.package_category.name + " - " + each.name,
      value: each.id,
    }));
  }, [data]);

  const [packages, setPackages] = useState([{ id: "" }]);

  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const { createData } = useCreate();

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    // console.log(state);
    const { error, response } = await createData(state);
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Form {...methods} onSubmit={onSubmit}>
        <div className="w-full flex flex-col gap-4">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <TextInputComponent
              label="Customer"
              type="text"
              name="customer_id"
              placeholder="Customer of invoice"
              isRequired
            />
            <TextInputComponent
              label="Proof"
              type="file"
              name="proof"
              placeholder="Proof of invoice"
              isRequired
            />

            {packages.map((pkg, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <SelectTwo
                  label="Package"
                  name={`packages[${idx}][id]`}
                  isSearchable
                  isRequired
                  selectTwoOptions={packageOptions}
                  onInputChange={setName}
                />

                <TextInputComponent
                  label={`Quantity`}
                  type="number"
                  name={`packages[${idx}][quantity]`}
                  placeholder="quantity of package invoice"
                  isRequired
                />

                <TextInputComponent
                  label={`Date of Event`}
                  type="datetime-local"
                  name={`packages[${idx}][date]`}
                  placeholder="package of invoice"
                  isRequired
                />

                <TextareaComponent
                  label="Note"
                  name={`packages[${idx}][note]`}
                  placeholder="note of package invoice"
                />

                <TextareaComponent
                  label="Location"
                  name={`packages[${idx}][location]`}
                  placeholder="location of package invoice"
                />
                {/* <Button
                onClick={() => {
                  const newPackages = packages.filter((_, i) => i !== idx); // hapus index tertentu
                  setPackages(newPackages);
                }}
                type="button"
                className="cursor-pointer"
              >
                Delete
              </Button> */}
              </div>
            ))}

            <Button
              onClick={() => setPackages([...packages, { id: "" }])}
              type="button"
              className="cursor-pointer"
            >
              Add
            </Button>
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
            <Button
              type="submit"
              className={`md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${
                !isValid || isSubmitting
                  ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed focus:outline-none disabled:opacity-100"
                  : " bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
              }`}
              disabled={!isValid || isSubmitting}
            >
              {!isSubmitting ? "Create" : <Spinner />}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
