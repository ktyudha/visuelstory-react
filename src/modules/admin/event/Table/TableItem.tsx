import { Checkbox, TableRow, TableCell, Badge } from "flowbite-react";
import { isEmpty } from "lodash";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";

import { Event } from "@services/admin/event/interfaces/get-all.type";
import { formatDateCustom } from "@helpers/date";

import TableItemMenu from "./TableItemMenu";

interface Props {
  item: Event;
}

export default function TableItem({ item }: Props) {
  return (
    <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <TableCell className="px-4">
        <Checkbox />
      </TableCell>

      <TableCell>
        <span className="font-semibold text-base text-black dark:text-white">
          {item.customer.name}
        </span>
        <div className="mb-4 whitespace-nowrap">
          <p className="flex gap-2">
            <HiOutlineCalendar className="my-auto" />
            {formatDateCustom(item.date)} WIB
          </p>
          <p className="flex gap-2">
            <HiOutlineLocationMarker className="my-auto" />
            {item.location}
          </p>
        </div>

        <span className="italic text-black dark:text-white">Note</span>
        <div
          className="text-orange-500 italic"
          dangerouslySetInnerHTML={{
            __html: item.note,
          }}
        />
      </TableCell>

      <TableCell>
        <Badge className="inline-flex justify-center mb-4" size="sm">
          {item.invoice_detail.package.category} -{" "}
          {item.invoice_detail.package.name}
        </Badge>
        <div
          className="whitespace-nowrap"
          dangerouslySetInnerHTML={{
            __html: item.invoice_detail.package.description
              .split("\n")
              .map((line) => `${line}<br/>`)
              .join(""),
          }}
        />
      </TableCell>
      <TableCell>
        {isEmpty(item.invoice_detail.invoice_detail_addons) ? (
          <p>Empty</p>
        ) : (
          item.invoice_detail.invoice_detail_addons.map((value, idx) => (
            <p className="whitespace-nowrap" key={`package-addon-${idx}`}>
              {value.quantity} {value.package_addon.name}
            </p>
          ))
        )}
      </TableCell>
      <TableCell>
        <TableItemMenu id={item.id} name={item.customer.name} />
      </TableCell>
    </TableRow>
  );
}
