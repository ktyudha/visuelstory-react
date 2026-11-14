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
import useGetAll from "@services/admin/package/hooks/useGetAll";

export default function TablePackage() {
  const { data, pagination, setPageNum, loading, setName, packageCategory, setPackageCategory } = useGetAll();
  // const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <TableHeader
        setSearchCallback={(e) => { setName(e); setPageNum(1); }}
        category={packageCategory}
        setCategoryCallback={(id) => { setPackageCategory(id); setPageNum(1); }}
      />
      <div className="overflow-x-auto border rounded-lg">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Information</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading || !data ? (
              <LoadingRows cols={4} />
            ) : data.length === 0 ? (
              <EmptyRow cols={4} text="Paket tidak ditemukan." />
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
