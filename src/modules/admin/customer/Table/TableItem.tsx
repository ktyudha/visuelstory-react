import { Checkbox, TableRow, TableCell } from "flowbite-react";
import { Customer } from "@services/admin/customer/interfaces/get-all.type";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: Customer;
}

export default function TableItem({ item }: Props) {
  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox />
      </TableCell>

      <TableCell className="whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white my-auto">
        {item.name}
      </TableCell>
      <TableCell className="whitespace-nowrap">{item.email}</TableCell>
      <TableCell className="whitespace-nowrap">{item.whatsapp}</TableCell>
      <TableCell className="prose dark:prose-invert whitespace-nowrap">
        {item.address}
      </TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.name} />
      </TableCell>
    </TableRow>
  );
}
