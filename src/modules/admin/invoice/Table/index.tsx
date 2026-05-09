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
import useGetAll from "@services/admin/invoice/hooks/useGetAll";
import useGlobalStore from "@store/useStore";

export default function TableInvoice() {
  const { data, pagination, setPageNum, loading, setName } = useGetAll();

  const setIsAllSelected = useGlobalStore((state) => state.setIsAllSelected);
  const selectedIds = useGlobalStore((state) => state.selectedIds);
  const setSelectedIds = useGlobalStore((state) => state.setSelectedIds);
  const clearSelectedIds = useGlobalStore((state) => state.clearSelectedIds);

  const invoiceIds = data?.map((invoice) => invoice.id) ?? [];

  const isAllSelected =
    selectedIds.length > 0 &&
    invoiceIds.length > 0 &&
    selectedIds.length === invoiceIds.length;

  const handleAllSelect = () => {
    if (isAllSelected) {
      clearSelectedIds();
    } else {
      setSelectedIds(invoiceIds);
    }
    setIsAllSelected(!isAllSelected);

  };

  console.log('handleAllSelect');
  console.log(selectedIds);
  return (
    <div>
      <TableHeader setSearchCallback={(e) => setName(e)} />
      <div className="overflow-x-auto border rounded-lg">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell className="p-4">
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleAllSelect}
                  className="cursor-pointer"
                />
              </TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Number</TableHeadCell>
              <TableHeadCell>Waktu</TableHeadCell>
              <TableHeadCell>Price</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              {/* <TableHeadCell></TableHeadCell> */}
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
                  <TableItem key={`table-item-invoice-${++idx}`} item={item} />
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
