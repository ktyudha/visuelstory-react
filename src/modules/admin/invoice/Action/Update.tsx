import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Spinner, Button } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import { useRef, useMemo, } from "react";
// import { formattedCurrency } from "@helpers/currency";

import TextInputComponent from "@components/Flowbite/Input";
// import TextareaComponent from "@components/Flowbite/Textarea";
// import SelectTwo from "@components/Flowbite/SelectTwo";
import Select from "@components/Flowbite/Select";
import Form from "@components/Form/Form";
import Skeleton from "@components/Skeleton/Skeleton";

import { ICreatePayload } from "@services/admin/invoice/interfaces/create.type";
import useUpdate from "@services/admin/invoice/hooks/useUpdate";
import useGet from "@services/admin/invoice/hooks/useGet";
// import useGetAll from "@services/admin/package/hooks/useGetAll";
import useGetAllCustomer from "@services/admin/customer/hooks/useGetAll";

type FormFields = ICreatePayload;

export default function InvoiceUpdate() {
  const navigate = useNavigate();
  const params = useParams();

  /** call api */
  const { data: dataCustomer } = useGetAllCustomer();
  // const { data, setName } = useGetAll();

  const { data: invoice, loading } = useGet(params.invoiceId as string);

  const customerOptions = useMemo(() => {
    if (!dataCustomer || dataCustomer.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return dataCustomer.map((each: any) => ({
      label: each.whatsapp + " - " + each.name,
      value: each.id,
    }));
  }, [dataCustomer]);

  // const packageOptions = useMemo(() => {
  //   if (!data || data.length === 0) {
  //     return [{ label: "Data tidak ditemukan", value: "" }];
  //   }
  //   return data.map((each: any) => ({
  //     label:
  //       each.package_category.name +
  //       " - " +
  //       each.name +
  //       " - " +
  //       formattedCurrency(each.price),
  //     value: each.id,
  //   }));
  // }, [data]);

  const uploadsRef = useRef<HTMLInputElement | null>(null);

  const methods = useForm<FormFields>({ mode: "onChange" });

  // const customer = methods.watch("customer_id");

  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const { updateData } = useUpdate(params.invoiceId as string);

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    const imageFile = uploadsRef.current?.files?.[0];
    const { error, response } = await updateData({
      ...state,
      proof: imageFile,
    });
    if (error || response) {
      if (error) {
        toast.error("Failed to Update!", {
          position: "top-center",
        });
      } else {
        navigate(-1);
        toast.success("Update successfully.", {
          position: "top-center",
        });
        methods.reset();
      }
    }
  };

  // useEffect(() => {
  //   console.log(methods.getValues("customer_id"));
  // }, [customer]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Form {...methods} onSubmit={onSubmit}>
        <div className="w-full flex flex-col gap-4">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <Skeleton isLoading={loading} height="2.5rem">

              <Select
                label="Customer"
                name="customer_id"
                defaultValue={invoice?.customer.id}
                selectOptions={customerOptions}
                isRequired
                isDisabled
              />

            </Skeleton>

            <Skeleton isLoading={loading} height="2.5rem">
              <Select
                label="Transaction Status"
                name="transaction_status"
                defaultValue={invoice?.transaction_status}
                isRequired
                isDisabled
                selectOptions={[
                  {
                    label: "Paid",
                    value: "paid",
                  },
                  { label: "Down Payment (DP)", value: "down_payment" },
                  { label: "Unpaid", value: "unpaid" },
                ]}
              ></Select>
            </Skeleton>
            {/* <Skeleton isLoading={loading} height="2.5rem">
              <SelectTwo
                label="Package"
                name={`packages[0][id]`}
                isSearchable
                isRequired
                selectTwoOptions={packageOptions}
                onInputChange={setName}
                defaultValue={
                  invoice?.invoice_details[0]?.package.id
                    ? packageOptions.find(
                        (opt) =>
                          opt.value === invoice?.invoice_details[0]?.package.id
                      )
                    : null
                }
              />
            </Skeleton> */}

            {/* <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label={`Quantity`}
                type="number"
                name={`packages[0][quantity]`}
                placeholder="Quantity of package invoice"
                defaultValue={1}
                isRequired
              />
            </Skeleton>

            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label={`Date of Event`}
                type="datetime-local"
                name={`packages[0][date]`}
                placeholder="Package of invoice"
                defaultValue={invoice?.invoice_details[0]?.events[0]?.date}
                isRequired
              />
            </Skeleton>

            <Skeleton isLoading={loading} height="5rem">
              <TextareaComponent
                label="Note"
                name={`packages[0][note]`}
                placeholder="Note of package invoice"
                defaultValue={invoice?.invoice_details[0]?.events[0]?.note}
              />
            </Skeleton>

            <Skeleton isLoading={loading} height="5rem">
              <TextareaComponent
                label="Location"
                name={`packages[0][location]`}
                placeholder="Location of package invoice"
                defaultValue={invoice?.invoice_details[0]?.events[0]?.location}
              />
            </Skeleton> */}

            {/* <Skeleton isLoading={loading} height="2.5rem">
              <div>
                <Label className="mb-3 block">Proof</Label>
                <FileInput
                  ref={uploadsRef}
                  accept="image/*"
                  // onChange={handleChangeImage}
                  // required
                />
                {invoice?.proof && (
                  <img
                    src={invoice?.proof}
                    alt={`proof-${invoice.invoice_number}`}
                    className="aspect-16/9 object-fit img-cover"
                  />
                )}
              </div>
            </Skeleton> */}

            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label={`Total`}
                type="number"
                name={`total_price`}
                placeholder="Total price of invoice"
                defaultValue={Number(invoice?.total_price)}
                isRequired
                isReadOnly
              />
            </Skeleton>
            <Skeleton isLoading={loading} height="2.5rem">
              <TextInputComponent
                label={`Paid Amount`}
                type="number"
                name={`amount_paid`}
                placeholder="Quantity of package invoice"
                defaultValue={Number(invoice?.amount_paid)}
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
            <Button
              type="submit"
              className={`md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${!isValid || isSubmitting
                ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed focus:outline-none disabled:opacity-100"
                : " bg-gradient-to-r from-cyan-500 to-blue-500 text-white cursor-pointer hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                }`}
              disabled={!isValid || isSubmitting}
            >
              {!isSubmitting ? "Update" : <Spinner />}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
