const files = import.meta.glob("../../../assets/images/*.png", { eager: true, import: "default" }) as Record<string, string>;

/** URL gambar dari src/assets/images berdasarkan nama berkas tanpa ekstensi (mis. "slider-1"). */
export const img = (name: string): string => files[`../../../assets/images/${name}.png`] ?? "";

export const WHATSAPP = "6285144920131";
export const INSTAGRAM = "https://instagram.com/visuelstory";
