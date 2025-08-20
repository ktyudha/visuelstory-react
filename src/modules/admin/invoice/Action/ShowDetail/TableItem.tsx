import { TableRow, TableCell } from "flowbite-react";
import { InvoiceDetail } from "@services/admin/invoice/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";
import { isEmpty } from "lodash";
import { formatDateCustom } from "@helpers/date";
import { HiLocationMarker, HiChat, HiCalendar } from "react-icons/hi";

interface Props {
  invoice_detail: InvoiceDetail;
}

export default function ShowTableItem({ invoice_detail }: Props) {
  const addonSum = invoice_detail.invoice_detail_addons?.reduce(
    (addonTotal, addon) => addonTotal + addon.amount,
    0
  );

  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="capitalize my-auto">
        <p className="mb-2 font-medium text-gray-900 dark:text-white capitalize">
          {invoice_detail.package.category} - {invoice_detail.package.name}
        </p>

        <div
          dangerouslySetInnerHTML={{
            __html: invoice_detail.package.description
              .split("\n")
              .map((line) => `${line}<br/>`)
              .join(""),
          }}
        />
        <br />
        {invoice_detail.events.map((event, idx) => {
          return (
            <div
              key={`information-event-${idx}`}
              className="truncate overflow-hidden"
            >
              <div className="flex gap-2">
                <HiCalendar className="my-auto" />

                <span className="capitalize">
                  {formatDateCustom(event.date)}
                </span>
              </div>
              <div className="flex gap-2">
                <HiLocationMarker className="my-auto" />
                <span>{event.location}</span>
              </div>
              <div className="flex gap-2">
                <HiChat className="my-auto" />
                <span>{event.note}</span>
              </div>
            </div>
          );
        })}
      </TableCell>
      <TableCell className="whitespace-nowrap capitalize text-gray-900 dark:text-white">
        {formattedCurrency(invoice_detail.amount)}
      </TableCell>

      <TableCell className="whitespace-nowrap text-gray-900 dark:text-white">
        {!isEmpty(invoice_detail.invoice_detail_addons)
          ? invoice_detail.invoice_detail_addons.map((addon, idx) => (
              <div className="flex justify-between" key={`add-on-${idx}`}>
                <p>
                  {addon.quantity}x {addon.package_addon.name}
                </p>
                <p>{formattedCurrency(addon.amount)}</p>
              </div>
            ))
          : "-"}
      </TableCell>
      <TableCell className="whitespace-nowrap text-gray-900 dark:text-white">
        {formattedCurrency(
          invoice_detail.amount * invoice_detail.quantity + addonSum
        )}
      </TableCell>
    </TableRow>
  );
}
