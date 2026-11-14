import clsx from "clsx";

/** Pembungkus halaman admin: `form` = lebar terbatas untuk form tambah/ubah. */
export default function PageCard({ children, form }: { children: React.ReactNode; form?: boolean }) {
  return (
    <div className={clsx("rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 sm:p-6", form && "max-w-3xl")}>
      {children}
    </div>
  );
}
