import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Spinner, Button, FileInput, Label } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import { useMemo, useRef, useEffect, useState } from "react";
import { formattedCurrency } from "@helpers/currency";
import useMapInputOptions from "@hooks/useMapInputOptions";

import TextInputComponent from "@components/Flowbite/Input";
import TextareaComponent from "@components/Flowbite/Textarea";
import SelectTwo from "@components/Flowbite/SelectTwo";
import Form from "@components/Form/Form";
import SelectComponent from "@components/Flowbite/Select";

import { ICreatePayload } from "@services/admin/invoice/interfaces/create.type";
import useCreate from "@services/admin/invoice/hooks/useCreate";
import useGetAll from "@services/admin/package/hooks/useGetAll";
import useGetAllCustomer from "@services/admin/customer/hooks/useGetAll";
import useGetAllAddOn from "@services/admin/package-addon/hooks/useGetAll";

type FormFields = ICreatePayload;

export default function PackageAddOnCreate() {
  const navigate = useNavigate();

  const [selectedAddOns, setSelectedAddOns] = useState([
    { id: "", quantity: 1 },
  ]);

  /** call api */
  const { data: dataCustomer, setName: setNameCustomer } = useGetAllCustomer();
  const { data: dataAddOn } = useGetAllAddOn();
  const { data, setName } = useGetAll();

  const addonOptions = useMapInputOptions(dataAddOn);
  const customerOptions = useMemo(() => {
    if (!dataCustomer || dataCustomer.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return dataCustomer.map((each: any) => ({
      label: each.whatsapp + " - " + each.name,
      value: each.id,
    }));
  }, [data]);

  const packageOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return data.map((each: any) => ({
      label:
        each.package_category.name +
        " - " +
        each.name +
        " - " +
        formattedCurrency(each.price),
      value: each.id,
    }));
  }, [data]);

  const addAddon = () => {
    setSelectedAddOns([...selectedAddOns, { id: "", quantity: 1 }]);
  };

  const removeAddon = (index: number) => {
    setSelectedAddOns(selectedAddOns.filter((_, i) => i !== index));
  };

  const uploadsRef = useRef<HTMLInputElement | null>(null);

  const methods = useForm<FormFields>({ mode: "onChange" });

  const customer = methods.watch("customer_id");

  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const { createData } = useCreate();

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
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

  useEffect(() => {
    console.log(methods.getValues("customer_id"));
  }, [customer]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Form {...methods} onSubmit={onSubmit}>
        <div className="w-full flex flex-col gap-4">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <SelectTwo
              label="Customer"
              name={`customer_id`}
              isSearchable
              isRequired
              selectTwoOptions={customerOptions}
              onInputChange={setNameCustomer}
            />

            <SelectTwo
              label="Package"
              name={`packages[0][id]`}
              isSearchable
              isRequired
              selectTwoOptions={packageOptions}
              onInputChange={setName}
            />

            <TextInputComponent
              label={`Quantity`}
              type="number"
              name={`packages[0][quantity]`}
              placeholder="Quantity of package invoice"
              value={1}
              isRequired
            />

            <TextInputComponent
              label={`Date of Event`}
              type="datetime-local"
              name={`packages[0][date]`}
              placeholder="Package of invoice"
              isRequired
            />

            <TextareaComponent
              label="Note"
              name={`packages[0][note]`}
              placeholder="Note of package invoice"
            />

            <TextareaComponent
              label="Location"
              name={`packages[0][location]`}
              placeholder="Location of package invoice"
            />

            <div>
              <Label className="mb-3 block">
                Proof of payment <span className="text-red-500">*</span>
              </Label>
              <FileInput
                ref={uploadsRef}
                accept="image/*"
                // onChange={handleChangeImage}
                required
              />
            </div>

            <TextInputComponent
              label={`Paid Amount`}
              type="number"
              name={`amount_paid`}
              placeholder="Quantity of package invoice"
              isRequired
            />
          </div>

          <div>
            <Label className="mb-3 block">Add On</Label>
            <Button
              type="button"
              color="blue"
              onClick={addAddon}
              className="mt-2"
            >
              + Tambah Addon
            </Button>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              {selectedAddOns.map((addon, idx) => (
                <div key={idx}>
                  <SelectComponent
                    label="Item"
                    name={`packages[0][package_addons][${idx}][id]`}
                    selectOptions={addonOptions}
                    // isRequired
                  />

                  <TextInputComponent
                    label={`Quantity`}
                    type="number"
                    name={`packages[0][package_addons][${idx}][quantity]`}
                    placeholder="Quantity of package invoice"
                    defaultValue={addon.quantity}
                    // isRequired
                  />

                  {idx > 0 && (
                    <Button
                      size="xs"
                      onClick={() => removeAddon(idx)}
                      className="col-span-2 w-fit !bg-red-500 mt-2"
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
