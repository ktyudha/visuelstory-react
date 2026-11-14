import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Trash2 } from "lucide-react";
import Metadata from "@components/Metadata";
import { formattedCurrency } from "@helpers/currency";
import { useCatalog } from "@services/customer/api";
import useCart from "./cart";
import { Addons, PackageSheet, Stepper } from "./parts";
import { PackageDetailSkeleton } from "../shared/skeletons";
import { btnDangerSoft, btnPrimary, Card, ErrorState } from "../shared/ui";

/** Halaman detail paket: rincian, jumlah, add-on, lalu tambahkan ke pesanan. */
export default function PackageDetail() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { catalog, error, loading, retry } = useCatalog();
  const existing = useCart((s) => s.items.find((i) => i.pkg.id === packageId));
  const upsert = useCart((s) => s.upsert);
  const remove = useCart((s) => s.remove);

  // Draf lokal: baru disimpan ke pesanan saat tombol ditekan
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addons, setAddons] = useState<Record<string, number>>(existing?.addons ?? {});

  if (loading) return <PackageDetailSkeleton />;
  const pkg = catalog?.packages.find((p) => p.id === packageId);
  if (error || !catalog || !pkg) return <ErrorState message="Paket tidak ditemukan." onRetry={() => retry()} />;

  const addonPrice = new Map(catalog.addons.map((a) => [a.id, a.price]));
  const total = pkg.price_final * quantity + Object.entries(addons).reduce((s, [id, q]) => s + (addonPrice.get(id) ?? 0) * q, 0);

  const save = () => {
    upsert(pkg, quantity, Object.fromEntries(Object.entries(addons).filter(([, q]) => q > 0)));
    navigate("/booking", { replace: true });
  };

  return (
    <div className="mx-auto max-w-xl pb-28 md:pb-0">
      <Metadata title={pkg.name} />

      {/* Ringkas: rincian lengkap ada di bottom sheet */}
      <button type="button" onClick={() => setSheetOpen(true)} className="block w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-950 p-4 text-left text-white">
        <div className="text-[11px] uppercase tracking-widest text-gold-400">{pkg.package_category?.name}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <h2 className="truncate text-lg font-bold">{pkg.name}</h2>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-gold-300">Lihat detail <ChevronRight className="size-4" /></span>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="font-bold text-gold-300">{formattedCurrency(pkg.price_final)}</span>
          {pkg.discount > 0 && <span className="text-xs text-white/50 line-through">{formattedCurrency(pkg.price)}</span>}
        </div>
      </button>

      <Card className="mt-4 flex items-center justify-between gap-3 p-4">
        <div>
          <div className="text-sm font-semibold">Jumlah paket</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{formattedCurrency(pkg.price_final)} / paket</div>
        </div>
        <Stepper value={quantity} min={1} max={20} onChange={setQuantity} />
      </Card>

      {catalog.addons.length > 0 && (
        <Card className="mt-4 p-4">
          <Addons addons={catalog.addons} value={addons} onChange={setAddons} />
        </Card>
      )}

      {existing && (
        <button onClick={() => { remove(pkg.id); navigate("/booking", { replace: true }); }}
          className={`${btnDangerSoft} mt-5 w-full`}>
          <Trash2 className="size-[18px]" /> Hapus dari pesanan
        </button>
      )}

      {/* Bar aksi menempel */}
      <div className="glass fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 rounded-2xl md:static md:mt-6 md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-none dark:md:bg-transparent">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 md:px-0">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Total</div>
            <div className="truncate text-lg font-bold">{formattedCurrency(total)}</div>
          </div>
          <button onClick={save} className={`${btnPrimary} shrink-0`}>{existing ? "Simpan perubahan" : "Tambah ke pesanan"}</button>
        </div>
      </div>

      {sheetOpen && (
        <PackageSheet pkg={pkg} onClose={() => setSheetOpen(false)}>
          <button onClick={() => setSheetOpen(false)} className={`${btnPrimary} w-full`}>Tutup</button>
        </PackageSheet>
      )}
    </div>
  );
}
