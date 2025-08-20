import { Checkbox, TableRow, TableCell } from "flowbite-react";
import { Event } from "@services/admin/event/interfaces/get-all.type";
// import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: Event;
}

export default function TableItem({ item }: Props) {
  console.table(item);
  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox />
      </TableCell>

      <TableCell className="whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white my-auto">
        {item.note}
      </TableCell>

      <TableCell>{item.location}</TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.package.name} />
      </TableCell>
    </TableRow>
  );
}
