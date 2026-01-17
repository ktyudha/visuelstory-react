import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { Invoice } from "@services/admin/invoice/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";
import { isEmpty } from "lodash";
import useGlobalStore from "@store/useStore";

interface Props {
  item: Invoice;
}

export default function TableItem({ item }: Props) {
  const selectedIds = useGlobalStore((state) => state.selectedIds);
  const setIsSelectedId = useGlobalStore((state) => state.setIsSelectedId);

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

      <TableCell className="capitalize font-medium text-gray-900 dark:text-white my-auto">
        {item.customer.name}
      </TableCell>

      <TableCell className="uppercase text-gray-900 dark:text-white font-medium whitespace-nowrap">
        {item.invoice_number}
      </TableCell>

      <TableCell className="whitespace-nowrap flex flex-col gap-2">
        {!isEmpty(item.invoice_details) ? (
          item.invoice_details.map((pkg) => (
            <Badge className="justify-center" size="sm" color="indigo">
              {pkg.package.category} - {pkg.package.name}
            </Badge>
          ))
        ) : (
          <Badge className="justify-center" size="sm" color="failure">
            Not Yet
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-gray-900 dark:text-white font-medium">
        {formattedCurrency(item.total_price)}
      </TableCell>

      <TableCell className="uppercase text-gray-900 dark:text-white font-medium whitespace-nowrap">
        <Badge
          className="justify-center capitalize"
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
    </TableRow>
  );
}
