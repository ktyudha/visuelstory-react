import {
  Checkbox,
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  TableCell,
} from "flowbite-react";

import PaginationComponent from "@components/Flowbite/Pagination";
import TableItem from "./TableItem";
import TableHeader from "./TableHeader";
import useGetAll from "@services/admin/event/hooks/useGetAll";

export default function TableEvent() {
  const { data, pagination, setPageNum, loading, setName } = useGetAll();
  return (
    <div>
      <TableHeader setSearchCallback={(e) => setName(e)} />
      <div className="overflow-x-auto border rounded-lg">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell className="p-4">
                <Checkbox />
              </TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Price</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading || !data ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading
                </TableCell>
              </TableRow>
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
