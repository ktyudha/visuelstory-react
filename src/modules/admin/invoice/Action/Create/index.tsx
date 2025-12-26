import { Button } from "flowbite-react";
import {
  HiPlus,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineAnnotation,
  HiPencil,
  HiOutlineTrash,
  HiOutlineFolder,
} from "react-icons/hi";
import { useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

import PackageAddOnCreateHeader from "./Header";

import Skeleton from "@components/Skeleton/Skeleton";
import Select from "@components/Flowbite/Select";
import Form from "@components/Form/Form";
import SelectTwo from "@components/Flowbite/SelectTwo";
import TextInputComponent from "@components/Flowbite/Input";

import { formattedCurrency, formatDateCustom } from "@helpers/index";

import {
  ICreatePayload,
  UiPackageAddOn,
  UiPackagePayload,
} from "@services/admin/invoice/interfaces/create.type";
import useGetAllCustomer from "@services/admin/customer/hooks/useGetAll";
import useGetAllPackage from "@services/admin/package/hooks/useGetAll";
import { Package } from "@services/admin/package/interfaces/get-all.type";
import { UiPackage } from "@services/admin/invoice/interfaces/create.type";
import useCreate from "@services/admin/invoice/hooks/useCreate";

import InvoicePackageModal from "./InvoicePackageModal";
import InvoicePackageAddOnModal from "./InvoicePackageAddOnModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type FormFields = ICreatePayload;

export default function PackageCreate() {
  const navigate = useNavigate();
  const {
    data: dataPackage,
    loading,
    packageCategory,
    setPackageCategory,
  } = useGetAllPackage();

  const { data: dataCustomer, setName: setNameCustomer } = useGetAllCustomer();
  const { createData } = useCreate();

  const customerOptions = useMemo(() => {
    if (!dataCustomer || dataCustomer.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return dataCustomer.map((each: any) => ({
      label: each.whatsapp + " - " + each.name,
      value: each.id,
    }));
  }, [dataCustomer]);

  const methods = useForm<UiPackagePayload>({
    mode: "onChange",
    defaultValues: {
      packages: [],
    },
  });
  const { control, reset, getValues } = methods;
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "packages",
  });

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
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
        reset();
      }
    }
  };

  const [openPackageModal, setOpenPackageModal] = useState<boolean>(false);
  const [openAddOnModal, setOpenAddOnModal] = useState<boolean>(false);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedUiPackage, setSelectedUiPackage] = useState<UiPackage | null>(
    null
  );

  const findPackageIndex = (id: string) =>
    fields.findIndex((pkg) => pkg.id === id);

  const handleCreatePackage = (payload: UiPackage) => {
    if (!selectedPackage) return;

    append(payload);

    setSelectedPackage(null);
  };

  const handleAddOn = (package_addons: UiPackageAddOn[]) => {
    if (!selectedUiPackage) return;

    const index = findPackageIndex(selectedUiPackage.id);
    if (index === -1) return;

    const current = getValues(`packages.${index}`);

    update(index, {
      ...current,
      package_addons,
    });

    setSelectedUiPackage(null);
  };

  return (
    <>
      {selectedPackage && (
        <InvoicePackageModal
          item={selectedPackage}
          onOpen={openPackageModal}
          onClose={() => setOpenPackageModal(false)}
          onSubmitSuccess={handleCreatePackage}
        />
      )}
      {selectedUiPackage && (
        <InvoicePackageAddOnModal
          item={selectedUiPackage}
          onOpen={openAddOnModal}
          onClose={() => setOpenAddOnModal(false)}
          onSubmitSuccess={handleAddOn}
        />
      )}

      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <PackageAddOnCreateHeader
          category={packageCategory}
          setCategoryCallback={setPackageCategory}
        />
        <div className="flex md:flex-row flex-col gap-4 items-start">
          <div className="md:w-3/5 w-full md:border-0 md:pb-0 border-b pb-4 grid md:grid-cols-3 grid-cols-2 gap-4">
            {loading || !dataPackage ? (
              <Skeleton isLoading={loading} />
            ) : (
              dataPackage.map((item, idx) => {
                return (
                  <div
                    key={`package-item-${idx}`}
                    className="w-full p-2 border rounded-lg"
                  >
                    <div className="aspect-16/9 w-full bg-black rounded-md mb-2"></div>

                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <span className="text-xs font-medium">
                      {formattedCurrency(item.price_final)}
                    </span>

                    <Button
                      className="w-full p-0 mt-4 text-xs cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                      size="sm"
                      onClick={() => {
                        setOpenPackageModal(true);
                        setSelectedPackage(item);
                      }}
                    >
                      <HiPlus className="mr-2 h-4 w-4" />
                      Add To Cart
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <div className="md:w-2/5 w-full border p-4 rounded-lg">
            {/* HEADER */}
            <div className="flex justify-between border-b pb-4 mb-4">
              <h4>Order Summary</h4>
            </div>

            <Form {...methods} onSubmit={onSubmit}>
              {/* LIST */}
              {fields.map((pkg, idx) => {
                return (
                  <div
                    key={`invoice-package-${idx}`}
                    className="border p-4 rounded-lg"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="text-md font-semibold my-auto">
                        {pkg.name}
                      </h3>
                      <div className="flex gap-1.5">
                        <Button
                          size="xs"
                          className="cursor-pointer bg-transparent dark:bg-transparent hover:bg-transparent hover:dark:bg-transparent outline outline-black dark:outline-white text-black dark:text-white p-1.5 h-auto rounded-md"
                        >
                          <HiPencil size={12} />
                        </Button>
                        <Button
                          size="xs"
                          className="cursor-pointer bg-transparent dark:bg-transparent hover:bg-transparent hover:dark:bg-transparent outline outline-black dark:outline-white text-black dark:text-white p-1.5 h-auto rounded-md"
                          onClick={() => remove(idx)}
                        >
                          <HiOutlineTrash size={12} />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-2 whitespace-nowrap text-xs">
                      <p className="flex gap-2">
                        <HiOutlineCalendar className="my-auto" />
                        {formatDateCustom(pkg.date)} WIB
                      </p>
                      <p className="flex gap-2">
                        <HiOutlineLocationMarker className="my-auto" />
                        {pkg.location}
                      </p>

                      <div className="flex gap-2">
                        <HiOutlineAnnotation className="my-auto" />
                        <div
                          className="text-orange-500 italic"
                          dangerouslySetInnerHTML={{
                            __html: pkg.note,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs my-auto">Add On</span>
                        <Button
                          size="xs"
                          className="cursor-pointer bg-transparent dark:bg-transparent hover:bg-transparent hover:dark:bg-transparent outline outline-black dark:outline-white text-black dark:text-white p-1.5 h-auto rounded-md"
                          onClick={() => {
                            setOpenAddOnModal(true);
                            setSelectedUiPackage(pkg);
                          }}
                        >
                          <HiOutlineFolder size={12} />
                        </Button>
                      </div>
                      {pkg.package_addons?.map((addon, addonIdx) => (
                        <div
                          key={`invoice-package-addon-${addonIdx}`}
                          className="flex justify-between pl-4"
                        >
                          <span className="text-xs my-auto font-normal">
                            {addon.quantity}x {addon.name}
                          </span>

                          <span className="text-xs font-normal my-auto">
                            {formattedCurrency(addon.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between my-2">
                      <span className="text-xs my-auto">Package</span>

                      <div className="text-end">
                        <span className="text-xs font-normal my-auto">
                          {formattedCurrency(pkg.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* SUBTOTAL */}
              <div className="border p-4 rounded-lg flex justify-between mb-4">
                <h4 className="text-md font-medium">Subtotal</h4>

                <span className="text-md font-medium my-auto">
                  {formattedCurrency(0)}
                </span>
              </div>

              <div className="border p-4 rounded-lg mb-4 flex flex-col gap-3">
                <SelectTwo
                  label="Customer"
                  name={`customer_id`}
                  isSearchable
                  isRequired
                  selectTwoOptions={customerOptions}
                  onInputChange={setNameCustomer}
                />
                <Select
                  label="Transaction Status"
                  name="transaction_status"
                  isRequired
                  selectOptions={[
                    {
                      label: "Paid",
                      value: "paid",
                    },
                    { label: "Down Payment (DP)", value: "down_payment" },
                    { label: "Unpaid", value: "unpaid" },
                  ]}
                />

                <TextInputComponent
                  label={`Paid Amount`}
                  type="number"
                  name={`amount_paid`}
                  placeholder="Quantity of package invoice"
                  isRequired
                />
              </div>

              {/* BUTTON PAYMENT */}
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                onClick={() => onSubmit}
              >
                Confirm Payment
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
