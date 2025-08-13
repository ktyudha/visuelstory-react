import { Checkbox, TableRow, TableCell } from "flowbite-react";
import { PackageAddOn } from "@services/admin/package-addon/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: PackageAddOn;
}

export default function TableItem({ item }: Props) {
  console.table(item);
  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox />
      </TableCell>

      <TableCell className="whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white my-auto">
        {item.name}
      </TableCell>

      <TableCell>{formattedCurrency(item.price)}</TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.name} />
      </TableCell>
    </TableRow>
  );
}
