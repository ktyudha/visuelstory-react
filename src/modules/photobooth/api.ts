/**
 * Penyimpanan hasil foto.
 *  - Tanpa VITE_KIOSK_API_URL  : mode sementara — disimpan di IndexedDB browser ini (QR hanya terbuka di perangkat yang sama).
 *  - Dengan VITE_KIOSK_API_URL : kontrak untuk backend Laravel (nanti):
 *      POST {BASE}/kiosk/sessions   multipart  field `image`   -> { data: { id } }   (id = kode pendek 5 karakter, mis. K7M2Q)
 *      GET  {BASE}/kiosk/sessions/:id                          -> { data: { image_url, expires_at } }
 *      POST {BASE}/kiosk/sessions/:id/whatsapp  json { phone }  -> 2xx bila link terkirim (nomor format 62xxxxxxxxxx; jangan disimpan lama)
 *      POST {BASE}/kiosk/feedback  json { session_id?, rating 1-5, tags[], comment }  -> 2xx
 */
/** Kode pendek mudah diketik (tanpa 0/O/1/I): 5 karakter ≈ 28 juta kombinasi. Backend sebaiknya memakai format sama. */
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const shortCode = (n = 5) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => ALPHA[b % ALPHA.length]).join("");

const BASE = (import.meta.env.VITE_KIOSK_API_URL as string | undefined)?.replace(/\/$/, "");

const idb = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open("kiosk-mock", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("r");
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const tx = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
  const db = await idb();
  return new Promise<T>((res, rej) => { const r = fn(db.transaction("r", mode).objectStore("r")); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
};

export async function uploadResult(blob: Blob): Promise<{ id: string }> {
  if (BASE) {
    const fd = new FormData();
    fd.append("image", blob, "photo.jpg");
    const r = await fetch(`${BASE}/kiosk/sessions`, { method: "POST", body: fd, headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("Upload gagal");
    return { id: (await r.json()).data.id };
  }
  const id = shortCode();
  await tx("readwrite", (s) => s.put(blob, id));
  return { id };
}

export async function fetchResult(id: string): Promise<{ imageUrl: string; expiresAt?: string } | null> {
  if (BASE) {
    const r = await fetch(`${BASE}/kiosk/sessions/${encodeURIComponent(id)}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const d = (await r.json()).data;
    return { imageUrl: d.image_url, expiresAt: d.expires_at };
  }
  const blob = await tx<Blob | undefined>("readonly", (s) => s.get(id.toUpperCase()));
  return blob ? { imageUrl: URL.createObjectURL(blob) } : null;
}

/** Kirim link soft file ke WhatsApp pengunjung. Mode sementara (tanpa backend): tidak mengirim apa pun -> false. */
export async function sendLink(id: string, phone: string, url: string): Promise<boolean> {
  if (!BASE) { console.info("[photobooth] mode sementara: WhatsApp tidak dikirim", { id, url }); return false; }
  const r = await fetch(`${BASE}/kiosk/sessions/${encodeURIComponent(id)}/whatsapp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ phone }) });
  return r.ok;
}

export type Feedback = { id?: string; rating: number; tags: string[]; comment: string };
/** Kritik & saran. Mode sementara: ditampung di localStorage perangkat ini. */
export async function sendFeedback(f: Feedback): Promise<boolean> {
  if (!BASE) {
    try { const k = "photobooth-feedback"; localStorage.setItem(k, JSON.stringify([...JSON.parse(localStorage.getItem(k) || "[]"), { ...f, at: new Date().toISOString() }])); } catch { /* abaikan */ }
    return true;
  }
  const r = await fetch(`${BASE}/kiosk/feedback`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ session_id: f.id, rating: f.rating, tags: f.tags, comment: f.comment }) });
  return r.ok;
}
