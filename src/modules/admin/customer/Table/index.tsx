import { EmptyRow, LoadingRows } from "../../shared/TableState";
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";

import PaginationComponent from "@components/Flowbite/Pagination";
import TableItem from "./TableItem";
import TableHeader from "./TableHeader";
import useGetAll from "@services/admin/customer/hooks/useGetAll";

export default function TableCustomer() {
  const { data, pagination, setPageNum, loading, setName } = useGetAll();

  return (
    <div>
      <TableHeader setSearchCallback={(e) => setName(e)} />
      <div className="overflow-x-auto border rounded-lg">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Whatsapp</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Address</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading || !data ? (
              <LoadingRows cols={5} />
            ) : data.length === 0 ? (
              <EmptyRow cols={5} text="Customer tidak ditemukan." />
            ) : (
              data.map((item, idx) => {
                return (
                  <TableItem key={`event-table-item-${idx}`} item={item} />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationComponent
        setPageNum={setPageNum}
        maxPageNum={pagination?.last_page || 1}
        perPage={pagination?.per_page ?? 10}
        total={pagination?.total ?? 10}
      />
    </div>
  );
}
