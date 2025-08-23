import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { Invoice } from "@services/admin/invoice/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";
import { isEmpty } from "lodash";

interface Props {
  item: Invoice;
}

export default function TableItem({ item }: Props) {
  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox />
      </TableCell>

      <TableCell className="capitalize font-medium text-gray-900 dark:text-white my-auto">
        {item.customer.name}
      </TableCell>

      <TableCell className="uppercase text-gray-900 dark:text-white font-medium">
        {item.invoice_number}
      </TableCell>

      <TableCell>
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

      <TableCell>
        <TableItemMenu id={item.id} name={item.invoice_number} />
      </TableCell>
    </TableRow>
  );
}
