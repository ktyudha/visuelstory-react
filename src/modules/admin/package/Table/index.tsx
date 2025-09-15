// import { useState } from "react";
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
import useGetAll from "@services/admin/package/hooks/useGetAll";

export default function TablePackage() {
  const { data, pagination, setPageNum, loading, setName } = useGetAll();
  // const [expandedId, setExpandedId] = useState<string | null>(null);

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
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
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
                  <TableItem
                    key={`event-table-item-${idx}`}
                    item={item}
                    // expandedId={expandedId}
                    // setExpandedId={setExpandedId}
                  />
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
