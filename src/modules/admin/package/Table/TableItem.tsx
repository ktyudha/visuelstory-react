import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { Package } from "@services/admin/package/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: Package;
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
      <TableCell className="prose dark:prose-invert">
        <div
          dangerouslySetInnerHTML={{
            __html: item.description
              .split("\n")
              .map((line) => `${line}<br/>`)
              .join(""),
          }}
        />
      </TableCell>
      <TableCell>
        <Badge className="justify-center" size="sm">
          {item.package_category.name}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-between">
          <p>Price</p>
          <p>{formattedCurrency(item.price)}</p>
        </div>
        <div className="flex justify-between">
          <p>Discount</p>
          <p>{item.discount}%</p>
        </div>
        <div className="flex justify-between">
          <p>Final</p>
          <p className="dark:text-white text-base font-semibold">
            {formattedCurrency(item.price_final)}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.name} />
      </TableCell>
    </TableRow>
  );
}
