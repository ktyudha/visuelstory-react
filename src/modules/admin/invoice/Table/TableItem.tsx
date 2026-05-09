import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { Invoice } from "@services/admin/invoice/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";
import useGlobalStore from "@store/useStore";
import { formatDateCustom } from "@helpers/index";

interface Props {
  item: Invoice;
}

export default function TableItem({ item }: Props) {
  const selectedIds = useGlobalStore((state) => state.selectedIds);
  const setIsSelectedId = useGlobalStore((state) => state.setIsSelectedId);

  const detailCount = item.invoice_details.length;
  const isChecked = selectedIds.includes(item.id);

  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox
          className="cursor-pointer"
          checked={isChecked}
          onChange={() => setIsSelectedId(item.id)}
        />
      </TableCell>

      <TableCell className="text-gray-900 dark:text-white whitespace-nowrap">
        <span className="text-xs">{formatDateCustom(item.created_at)}</span>
        <br />
        <span className="uppercase font-medium">{item.invoice_number}</span>
      </TableCell>

      <TableCell className="capitalize whitespace-nowrap font-medium text-gray-900 dark:text-white my-auto">
        {item.customer.name}
      </TableCell>

      <TableCell className="!py-1 whitespace-nowrap flex flex-col text-gray-900 dark:text-white">
        {item.invoice_details.map((detail, index) => {
          const isLast = detailCount == index++;

          return (
            <>
              {detail.events && detail.events.map((event) => <span className="text-xs">{formatDateCustom(event.date)}</span>)}

              <Badge className={`justify-center w-fit ${detailCount > 1 && !isLast ? 'mb-2' : ''}`} size="sm" color="indigo">
                {detail.package.category} - {detail.package.name}
              </Badge>
            </>
          )
        }
        )}
      </TableCell>

      <TableCell className="!py-1 text-gray-900 dark:text-white font-medium text-end">
        {item.invoice_details.map((detail) => (
          <p>
            {formattedCurrency(detail.amount)}
          </p>
        ))}
      </TableCell>

      <TableCell className="uppercase text-gray-900 dark:text-white font-medium whitespace-nowrap">
        <Badge
          className="justify-center w-fit capitalize"
          size="sm"
          color={
            item.transaction_status == "paid"
              ? "success"
              : item.transaction_status == "unpaid"
                ? "red"
                : "purple"
          }
        >
          {item.transaction_status === "down_payment"
            ? "down payment"
            : item.transaction_status}
        </Badge>
      </TableCell>

      <TableCell>
        <TableItemMenu id={item.id} invoice_number={item.invoice_number} />
      </TableCell>
    </TableRow >
  );
}
