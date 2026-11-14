import clsx from "clsx";
import ListHeader from "../../shared/ListHeader";
import { useModalParams } from "../../shared/useModalParams";
import useGetAllCategory from "@services/admin/package-category/hooks/useGetAllPackageCategory";

interface Props {
  setSearchCallback: (param: string) => void;
  category: string;
  setCategoryCallback: (id: string) => void;
}

export default function TableHeader({ setSearchCallback, category, setCategoryCallback }: Props) {
  const { openCreate } = useModalParams();
  const { data: categories } = useGetAllCategory();
  const items = [{ id: "", name: "Semua" }, ...(categories ?? [])];

  return (
    <>
      <ListHeader onSearch={setSearchCallback} placeholder="Cari paket..." createLabel="Tambah paket" onCreate={openCreate} />
      <div role="tablist" aria-label="Filter kategori" className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((c) => {
          const active = category === c.id;
          return (
            <button key={c.id || "all"} role="tab" aria-selected={active} type="button" onClick={() => setCategoryCallback(c.id)}
              className={clsx("shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600")}>
              {c.name}
            </button>
          );
        })}
      </div>
    </>
  );
}
