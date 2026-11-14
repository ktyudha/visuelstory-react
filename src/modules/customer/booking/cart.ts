import { create } from "zustand";
import type { CatalogPackage } from "@services/customer/types";

export interface CartItem {
  pkg: CatalogPackage;
  quantity: number;
  date: string;
  location: string;
  note: string;
  addons: Record<string, number>; // addonId -> qty
}

interface CartState {
  items: CartItem[];
  /** Tambah paket baru, atau perbarui jumlah & add-on bila sudah ada (jadwal/lokasi dipertahankan). */
  upsert: (pkg: CatalogPackage, quantity: number, addons: Record<string, number>) => void;
  patch: (id: string, p: Partial<CartItem>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

/** Keranjang booking dipakai bersama halaman daftar paket & halaman detail paket. */
const useCart = create<CartState>()((set) => ({
  items: [],
  upsert: (pkg, quantity, addons) =>
    set((s) =>
      s.items.some((i) => i.pkg.id === pkg.id)
        ? { items: s.items.map((i) => (i.pkg.id === pkg.id ? { ...i, quantity, addons } : i)) }
        : { items: [...s.items, { pkg, quantity, addons, date: "", location: "", note: "" }] }
    ),
  patch: (id, p) => set((s) => ({ items: s.items.map((i) => (i.pkg.id === id ? { ...i, ...p } : i)) })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.pkg.id !== id) })),
  clear: () => set({ items: [] }),
}));

export default useCart;
