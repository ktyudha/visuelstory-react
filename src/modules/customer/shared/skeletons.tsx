import clsx from "clsx";
import { Card } from "./ui";

/** Balok kerangka dasar untuk keadaan loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx("animate-pulse rounded-lg bg-neutral-200/80 dark:bg-neutral-800", className)} />;
}

function Wrap({ label, children }: { label: string; children: React.ReactNode }) {
  return <div role="status" aria-busy="true" aria-label={label}>{children}<span className="sr-only">{label}</span></div>;
}

/** Daftar pesanan. */
export function OrdersSkeleton() {
  return (
    <Wrap label="Memuat pesanan">
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="space-y-4 p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-44" /></div>
              <Skeleton className="h-6 w-20 !rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-20" /></div>
          </Card>
        ))}
      </div>
    </Wrap>
  );
}

/** Detail pesanan. */
export function OrderDetailSkeleton() {
  return (
    <Wrap label="Memuat detail pesanan">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-32" /></div>
        <Skeleton className="h-7 w-24 !rounded-full" />
      </div>
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <Card key={i} className="space-y-3 p-5">
            <div className="flex justify-between gap-3"><div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-40" /></div><Skeleton className="h-5 w-24" /></div>
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
      <Card className="ml-auto mt-6 max-w-sm space-y-3 p-5">
        {[0, 1, 2].map((i) => <div key={i} className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /></div>)}
      </Card>
    </Wrap>
  );
}

/** Daftar paket di halaman booking. */
export function CatalogSkeleton() {
  return (
    <Wrap label="Memuat paket">
      <Skeleton className="mb-4 h-11 w-full !rounded-xl" />
      <div className="mb-5 flex gap-6 border-b border-neutral-200 pb-3 dark:border-neutral-800">{["w-12", "w-24", "w-28", "w-20"].map((w) => <Skeleton key={w} className={`h-4 ${w}`} />)}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-1"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-20" /></div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

/** Halaman detail paket. */
export function PackageDetailSkeleton() {
  return (
    <Wrap label="Memuat paket">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="space-y-2 rounded-2xl bg-neutral-900 p-4"><Skeleton className="h-3 w-24 !bg-white/15" /><Skeleton className="h-6 w-48 !bg-white/15" /><Skeleton className="h-4 w-28 !bg-white/15" /></div>
        <Card className="flex items-center justify-between p-4"><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-9 w-28" /></Card>
        <Card className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full !rounded-xl" />)}</Card>
      </div>
    </Wrap>
  );
}

/** Dokumen invoice. */
export function InvoiceSkeleton() {
  return (
    <Wrap label="Memuat invoice">
      <div className="mb-4 flex justify-between gap-3"><Skeleton className="h-7 w-24 !rounded-full" /><Skeleton className="h-12 w-44 !rounded-xl" /></div>
      <div className="rounded-2xl bg-neutral-200/60 p-2 dark:bg-neutral-800 sm:p-6">
        <div className="mx-auto max-w-[794px] space-y-5 bg-white p-6 sm:p-10">
          <div className="flex justify-between"><Skeleton className="h-12 w-40 !bg-neutral-200" /><Skeleton className="h-12 w-32 !bg-neutral-200" /></div>
          <Skeleton className="h-24 w-full !bg-neutral-100" />
          <Skeleton className="h-40 w-full !bg-neutral-100" />
          <Skeleton className="ml-auto h-24 w-64 !bg-neutral-100" />
        </div>
      </div>
    </Wrap>
  );
}
