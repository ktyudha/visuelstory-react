import { Button } from "flowbite-react";
import {
  HiPlus,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineAnnotation,
  HiPencil,
  HiTrash,
} from "react-icons/hi";

import { formattedCurrency, formatDateCustom } from "@helpers/index";

import PackageAddOnCreateHeader from "./Header";

import useGetAllPackage from "@services/admin/package/hooks/useGetAll";
import Skeleton from "@components/Skeleton/Skeleton";
import Select from "@components/Flowbite/Select";
import Form from "@components/Form/Form";
import { ICreatePayload } from "@services/admin/invoice/interfaces/create.type";
import { SubmitHandler, useForm } from "react-hook-form";
import TextInputComponent from "@components/Flowbite/Input";

type FormFields = ICreatePayload;

export default function PackageAddOnCreate() {
  const {
    data: dataPackage,
    loading,
    packageCategory,
    setPackageCategory,
  } = useGetAllPackage();

  const methods = useForm<FormFields>({ mode: "onChange" });

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    console.log(state);
    // const { error, response } = await createData({
    //   ...state,
    //   proof: imageFile,
    // });
    // if (error || response) {
    //   if (error) {
    //     toast.error("Failed to add!", {
    //       position: "top-center",
    //     });
    //   } else {
    //     navigate(-1);
    //     toast.success("Added successfully.", {
    //       position: "top-center",
    //     });
    //     methods.reset();
    //   }
    // }
  };

  return (
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
            <div className="border p-4 rounded-lg mb-4">
              <h3 className="text-md font-semibold mb-2">Sweet</h3>

              <div className="mb-4 whitespace-nowrap text-xs">
                <p className="flex gap-2">
                  <HiOutlineCalendar className="my-auto" />
                  {formatDateCustom(new Date())} WIB
                </p>
                <p className="flex gap-2">
                  <HiOutlineLocationMarker className="my-auto" />
                  Graha KBM, Krian, Sidoarjo
                </p>

                <div className="flex gap-2">
                  <HiOutlineAnnotation className="my-auto" />
                  <div
                    className="text-orange-500 italic"
                    dangerouslySetInnerHTML={{
                      __html: "08:00 WIB ready on spot [rumah mas fajar]",
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-md font-medium my-auto">
                  {formattedCurrency(100000)}
                </span>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="cursor-pointer px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                  >
                    <HiPencil />
                  </Button>
                  <Button
                    size="sm"
                    className="cursor-pointer px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                  >
                    <HiTrash />
                  </Button>
                </div>
              </div>
            </div>

            {/* SUBTOTAL */}
            <div className="border p-4 rounded-lg flex justify-between mb-4">
              <h4 className="text-md font-medium">Subtotal</h4>

              <span className="text-md font-medium my-auto">
                {formattedCurrency(100000)}
              </span>
            </div>

            <div className="border p-4 rounded-lg mb-4 flex flex-col gap-3">
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
              size="sm"
              className="cursor-pointer w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
            >
              Confirm Payment
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
