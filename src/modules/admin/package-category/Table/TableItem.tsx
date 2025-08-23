import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { PackageCategory } from "@services/admin/package-category/interfaces/get-all-package-category.type";

import TableItemMenu from "./TableItemMenu";
import { isEmpty } from "lodash";

interface Props {
  item: PackageCategory;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}

export default function TableItem({ item, expandedId, setExpandedId }: Props) {
  const isExpanded = expandedId === item.id;

  const shortText = item.description?.slice(0, 120);
  const displayText = isExpanded ? item.description : shortText;

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
            __html: displayText
              .split("\n")
              .map((line) => `${line}<br/>`)
              .join(""),
          }}
        />
        {item.description.length > 100 && (
          <button
            type="button"
            onClick={() => setExpandedId(isExpanded ? null : item.id)}
            className="cursor-pointer hover:underline"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </TableCell>

      <TableCell className="flex gap-2 max-w-md">
        {!isEmpty(item.packages) ? (
          item.packages.map((pkg) => (
            <Badge className="justify-center" size="sm" color="indigo">
              {pkg.name}
            </Badge>
          ))
        ) : (
          <Badge className="justify-center" size="sm" color="failure">
            Not Yet
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.name} />
      </TableCell>
    </TableRow>
  );
}
