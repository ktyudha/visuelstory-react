import { Link } from "react-router-dom";
import { TableRow, TableCell } from "flowbite-react";
import { Customer } from "@services/admin/customer/interfaces/get-all.type";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: Customer;
}

export default function TableItem({ item }: Props) {
  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">

      <TableCell className="whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white my-auto">
        <Link to={`show/${item.id}`} className="hover:text-blue-600 hover:underline">{item.name || "(tanpa nama)"}</Link>
      </TableCell>
      <TableCell className="whitespace-nowrap">{item.email}</TableCell>
      <TableCell className="whitespace-nowrap">{item.whatsapp}</TableCell>
      <TableCell className="prose dark:prose-invert whitespace-nowrap text-sm">
        {item.address}
      </TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.name} />
      </TableCell>
    </TableRow>
  );
}
