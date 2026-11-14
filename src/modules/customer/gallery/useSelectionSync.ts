import { useCallback, useEffect, useRef, useState } from "react";

export type SyncStatus = "idle" | "pending" | "saving" | "saved" | "error";
export interface SyncPayload { ids: string[]; note: string }

interface Options {
  /** Simpan ke server (dipanggil berurutan, tidak pernah paralel). */
  save: (p: SyncPayload) => Promise<void>;
  /** Kegagalan yang tidak perlu diulang (mis. 422/403): berhenti & beri tahu. */
  isFatal?: (e: unknown) => boolean;
  onFatal?: (e: unknown) => void;
  /** Dipanggil saat halaman ditutup dengan perubahan yang belum tersimpan (fetch keepalive). */
  keepalive?: (p: SyncPayload) => void;
  delay?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Simpan otomatis yang aman:
 *  - hanya SATU permintaan berjalan; perubahan baru selama menyimpan digabung & dikirim setelahnya
 *    (tidak ada permintaan lama yang menimpa yang baru),
 *  - gagal jaringan diulang 3x dengan jeda bertambah, lalu status "error" + bisa retry,
 *  - perubahan yang tertunda tetap dikirim saat halaman ditutup/pindah.
 */
export function useSelectionSync(opts: Options) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const latest = useRef<SyncPayload | null>(null);
  const inflight = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retries = useRef(0);
  const stopped = useRef(false);
  const o = useRef(opts);
  o.current = opts;

  const drain = useCallback((): Promise<void> => {
    if (inflight.current) return inflight.current;
    const run = (async () => {
      while (latest.current && !stopped.current) {
        const snap = latest.current;
        setStatus("saving");
        try {
          await o.current.save(snap);
          if (latest.current === snap) latest.current = null; // tidak ada perubahan baru selama menyimpan
          retries.current = 0;
        } catch (e) {
          if (o.current.isFatal?.(e)) {
            stopped.current = true;
            latest.current = null;
            setStatus("error");
            o.current.onFatal?.(e);
            return;
          }
          if (++retries.current > 3) { retries.current = 0; setStatus("error"); return; }
          await sleep(1000 * 2 ** (retries.current - 1));
        }
      }
      if (!latest.current && !stopped.current) setStatus("saved");
    })().finally(() => { inflight.current = null; });
    inflight.current = run;
    return run;
  }, []);

  const schedule = useCallback((p: SyncPayload) => {
    if (stopped.current) return;
    latest.current = p;
    setStatus("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void drain(), o.current.delay ?? 700);
  }, [drain]);

  /** Pastikan semuanya tersimpan (sebelum kirim final). Melempar bila gagal. */
  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    await drain();
    if (latest.current) throw new Error("save-failed");
  }, [drain]);

  const retry = useCallback(() => { retries.current = 0; void drain(); }, [drain]);
  const stop = useCallback(() => { stopped.current = true; latest.current = null; clearTimeout(timer.current); }, []);

  // Tutup tab / pindah halaman: kirim sisa perubahan.
  useEffect(() => {
    const flushOnLeave = () => {
      if (latest.current && !stopped.current) o.current.keepalive?.(latest.current);
    };
    const onHide = () => document.visibilityState === "hidden" && flushOnLeave();
    window.addEventListener("pagehide", flushOnLeave);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flushOnLeave);
      document.removeEventListener("visibilitychange", onHide);
      clearTimeout(timer.current);
      flushOnLeave(); // pindah halaman di dalam aplikasi
    };
  }, []);

  return { status, schedule, flush, retry, stop };
}
