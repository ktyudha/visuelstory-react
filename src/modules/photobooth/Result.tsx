import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { fetchResult } from "./api";

/** Halaman tujuan QR: pengunjung mengunduh soft file berwarna. */
export default function KioskResult() {
  const { id = "" } = useParams();
  const [state, setState] = useState<"loading" | "missing" | { imageUrl: string; expiresAt?: string }>("loading");
  useEffect(() => {
    document.title = "Foto kamu · Receipt Photobooth";
    fetchResult(id).then((r) => setState(r ?? "missing")).catch(() => setState("missing"));
  }, [id]);

  const download = async () => {
    if (typeof state === "string") return;
    const blob = await (await fetch(state.imageUrl)).blob(); // lintas-domain tetap bisa diunduh sebagai file
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `receipt-photobooth-${id}.jpg`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="min-h-dvh bg-[#faf8f4] px-5 py-8 text-neutral-900">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5 text-center">
        <div><h1 className="font-serif text-3xl font-bold italic">Visuelstory</h1><p className="text-[11px] font-semibold tracking-[0.35em] text-neutral-500">RECEIPT PHOTOBOOTH</p></div>
        {state === "loading" && <p className="text-neutral-500">Memuat…</p>}
        {state === "missing" && <p className="text-neutral-600">Foto tidak ditemukan atau sudah kedaluwarsa.</p>}
        {typeof state === "object" && (
          <>
            <img src={state.imageUrl} alt="Foto photobooth" className="w-full rounded-md shadow-2xl" />
            <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c9a24a] py-4 font-extrabold text-neutral-950 shadow-[0_6px_0_#85671f] active:translate-y-1"><Download className="size-5" />Unduh soft file</button>
            {state.expiresAt && <p className="text-xs text-neutral-500">Tersedia sampai {new Date(state.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>}
          </>
        )}
      </div>
    </div>
  );
}
