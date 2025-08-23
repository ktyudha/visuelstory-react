import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Button, Badge } from "flowbite-react";
import { HiPrinter } from "react-icons/hi";

import { formatDateCustom } from "@helpers/date";
import { formattedCurrency } from "@helpers/currency";
import ShowDetail from "./ShowDetail";

import useGet from "@services/admin/invoice/hooks/useGet";
import LogoCirlce from "@assets/logo/logo-circle.svg";

export default function Show() {
  const params = useParams();
  const { data } = useGet(params.invoiceId as string);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const totalPackage = data?.invoice_details?.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalAddon = data?.invoice_details?.reduce((sum, detail) => {
    const addonSum = detail.invoice_detail_addons?.reduce(
      (addonTotal, addon) => addonTotal + addon.amount,
      0
    );
    return sum + addonSum;
  }, 0);

  console.log(data);

  if (!data) return;

  return (
    <div
      className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg print:bg-white"
      ref={contentRef}
    >
      {/* Header Button */}
      <div className="flex lg:flex-row flex-col-reverse gap-4 justify-between mb-4">
        <div className="flex gap-2">
          <img src={LogoCirlce} alt="" className="w-6 w-6" />
          <span className="my-auto text-xl tracking-wide font-light font-serif italic">
            Kisah Dalam Cerita
          </span>
        </div>
        {/* <div className="flex gap-4 order-1">
          <Button
            color={"alternative"}
            className="cursor-pointer lg:w-auto w-full"
          >
            Download
          </Button> */}
        <Button
          onClick={reactToPrintFn}
          className="group lg:w-auto w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
        >
          <HiPrinter />
          <span className="transition-all duration-300 ease-in-out opacity-0 group-hover:ml-2 max-w-0 overflow-hidden group-hover:opacity-100 group-hover:max-w-[50px]">
            Print
          </span>
        </Button>
        {/* </div> */}
      </div>

      {/* Body */}
      <div>
        <div className="flex lg:flex-row flex-col justify-between border-b border-t py-3.5 mb-6">
          <h3 className="font-semibold text-lg my-auto">
            {data?.invoice_number}
          </h3>
          <p className=" dark:text-gray-400 text-gray-500">
            {formatDateCustom(data.created_at)}
          </p>
        </div>

        <div className="flex lg:flex-row flex-col lg:gap-0 gap-4 justify-between mb-12">
          <div>
            <h3 className="text-lg lg:mb-4 mb-1">Billed by</h3>
            <div className="w-full italic">
              <span className="uppercase">Visuelstory</span>
              <br />
              <span className="dark:text-gray-400 text-gray-500">
                Sidoarjo, Jawa Timur <br /> Kode Pos 61275
              </span>
              <br />
              <span className="italic">+62 858 4825 0548</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg lg:mb-4 mb-1">Invoice for</h3>
            <div className="lg:max-w-64 w-full italic">
              <span className="capitalize">{data?.customer.name}</span>
              <br />
              <span className="dark:text-gray-400 text-gray-500">
                {data?.customer.address}
              </span>
            </div>
            {/* <span className="italic">{data?.customer.email}</span> */}
            {/* <br /> */}
            <span className="italic">{data?.customer.phone}</span>
          </div>
        </div>

        {/* Invoice Detail */}
        <ShowDetail items={data.invoice_details} />

        <div className="max-w-sm ml-auto mt-10">
          <div className="flex justify-between">
            <h5 className="font-medium text-md text-left mb-2">
              Order Summary
            </h5>
            <Badge
              className="justify-center capitalize"
              size="sm"
              color={
                data?.transaction_status == "paid"
                  ? "success"
                  : data?.transaction_status == "unpaid"
                  ? "red"
                  : "purple"
              }
            >
              {data?.transaction_status === "down_payment"
                ? "down payment"
                : data?.transaction_status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="dark:text-gray-400 text-gray-500">Package</div>
            <div className="text-end">
              {formattedCurrency(Number(totalPackage))}
            </div>
            <div className="dark:text-gray-400 text-gray-500">Add On</div>
            <div className="text-end">
              {formattedCurrency(Number(totalAddon))}
            </div>
            <div className="font-medium text-md text-left">Order Total</div>
            <div className="text-end">
              {formattedCurrency(data?.total_price ?? 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
