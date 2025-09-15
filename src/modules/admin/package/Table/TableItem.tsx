import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { Package } from "@services/admin/package/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: Package;
  // expandedId: string | null;
  // setExpandedId: (id: string | null) => void;
}

export default function TableItem({ item }: Props) {
  // const isExpanded = expandedId === item.id;

  // const shortText = item.description?.slice(0, 120);
  // const displayText = isExpanded ? item.description : shortText;

  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox />
      </TableCell>

      <TableCell className="whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white my-auto">
        {item.name}
      </TableCell>
      <TableCell className="prose dark:prose-invert whitespace-nowrap">
        <div
          dangerouslySetInnerHTML={{
            __html: item.description
              .split("\n")
              .map((line) => `${line}<br/>`)
              .join(""),
          }}
        />
      </TableCell>
      {/* <TableCell className="prose dark:prose-invert">
        <div
          dangerouslySetInnerHTML={{
            __html: displayText
              .split("\n")
              .map((line) => `${line}<br/>`)
              .join(""),
          }}
        />
        {item.description.length > 150 && (
          <button
            type="button"
            onClick={() => setExpandedId(isExpanded ? null : item.id)}
            className="cursor-pointer hover:underline"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </TableCell> */}
      <TableCell className="whitespace-nowrap">
        {item.package_category ? (
          <Badge className="justify-center" size="sm">
            {item.package_category.name}
          </Badge>
        ) : (
          <Badge className="justify-center" size="sm" color="failure">
            Not Yet
          </Badge>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap min-w-56">
        <div className="flex justify-between">
          <p>Price</p>
          <p>{formattedCurrency(item.price)}</p>
        </div>
        <div className="flex justify-between text-red-500">
          <p>Discount</p>
          <p>{item.discount}%</p>
        </div>
        <div className="flex justify-between text-teal-400">
          <p className="dark:text-white text-base font-semibold">Final</p>
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
