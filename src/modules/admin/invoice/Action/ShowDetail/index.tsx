import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  TableCell,
} from "flowbite-react";
import { InvoiceDetail } from "@services/admin/invoice/interfaces/get-all.type";

import ShowTableItem from "./TableItem";
import { isEmpty } from "lodash";

interface Props {
  items: InvoiceDetail[];
}

export default function ShowDetail({ items }: Props) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell>Information</TableHeadCell>
            {/* <TableHeadCell>Facility</TableHeadCell> */}
            <TableHeadCell>price</TableHeadCell>
            <TableHeadCell>add on</TableHeadCell>
            {/* <TableHeadCell>discount</TableHeadCell> */}
            <TableHeadCell>total price</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isEmpty(items) ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center cursor-not-allowed">
                Data Not Found
              </TableCell>
            </TableRow>
          ) : (
            items.map((invoice_detail, idx) => {
              return (
                <ShowTableItem
                  key={`invoice-detail-table-item-${idx}`}
                  invoice_detail={invoice_detail}
                />
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
