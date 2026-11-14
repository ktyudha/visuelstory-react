import { useEffect, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { HiCheck, HiExternalLink, HiOutlineExclamation, HiOutlineClock, HiRefresh } from "react-icons/hi";
import axiosInstance from "@lib/axios-instance";
import { btnGhost, btnPrimary, Field, inputCls } from "../../shared/ui";
import { panel } from "../../shared/invoice-ui";
import { type StepState } from "../../shared/delivery-ui";
import { timeLeft } from "@helpers/deadline";
import DateTimeInput from "@components/DateTimeInput";

interface Gallery {
  drive_folder_url: string | null; photo_count: number | null; jpeg_uploaded_at: string | null;
  selection_limit: number | null; selection_deadline_at: string | null; selection_closed: boolean; ready_to_edit: boolean;
  submitted_at: string | null; note: string | null;
  selections: { file_id: string; file_name: string }[];
  edited_folder_url: string | null; edited_photo_count: number | null; edited_delivered_at: string | null;
  video_applicable: boolean; video_url: string | null; video_delivered_at: string | null;
}

const http = () => axiosInstance({ withToken: true, tokenType: "admin" });
const fmt = (d: string | null) => (d ? dayjs(d).locale("id").format("D MMM YYYY, HH:mm") : "");

function Chip({ state, children }: { state: StepState; children: React.ReactNode }) {
  const cls = state === "done" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
    : state === "todo" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
  const I = state === "done" ? HiCheck : state === "todo" ? HiOutlineExclamation : HiOutlineClock;
  return <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", cls)}><I /> {children}</span>;
}

function Step({ n, title, state, chip, children }: { n: number; title: string; state: StepState; chip: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={clsx("rounded-xl border p-4", state === "todo" ? "border-amber-300 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/10" : "border-gray-200 dark:border-gray-700")}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className={clsx("grid size-6 place-items-center rounded-full text-xs font-bold",
            state === "done" ? "bg-emerald-500 text-white" : state === "todo" ? "bg-amber-400 text-gray-900" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300")}>
            {state === "done" ? <HiCheck /> : n}
          </span>
          {title}
        </h3>
        {chip}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function DeliveryPanel({ invoiceId, invoiceNumber, customerName, customerWhatsapp }: { invoiceId: string; invoiceNumber: string; customerName?: string; customerWhatsapp?: string }) {
  const key = `/admin/invoices/${invoiceId}/gallery`;
  const { data, mutate } = useSWR<Gallery>(key, (u: string) => http().get(u).then((r) => r.data.data));

  const [jpeg, setJpeg] = useState("");
  const [limit, setLimit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [edited, setEdited] = useState("");
  const [video, setVideo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setJpeg(data.drive_folder_url ?? ""); setLimit(data.selection_limit ? String(data.selection_limit) : "");
    setDeadline(data.selection_deadline_at ? dayjs(data.selection_deadline_at).format("YYYY-MM-DDTHH:mm") : "");
    setEdited(data.edited_folder_url ?? ""); setVideo(data.video_url ?? "");
  }, [data]);

  const run = async (name: string, fn: () => Promise<{ data: { data: Gallery } }>, ok: string) => {
    setBusy(name);
    try {
      const res = await fn();
      await mutate(res.data.data, { revalidate: false });
      globalMutate(`/admin/invoices/${invoiceId}`); // progres di halaman detail
      globalMutate((k) => typeof k === "string" && k.startsWith("/admin/invoices?")); // penanda di daftar
      globalMutate("/admin/dashboard");
      toast.success(ok);
    } catch (e) {
      toast.error(isAxiosError(e) ? e.response?.data?.message ?? "Gagal menyimpan" : "Gagal menyimpan");
    } finally { setBusy(null); }
  };
  const put = (name: string, body: Record<string, unknown>, ok: string) => run(name, () => http().put(key, body), ok);
  const post = (name: string, path: string, ok: string, body?: Record<string, unknown>) => run(name, () => http().post(`${key}/${path}`, body), ok);

  if (!data) return <section className={panel}><p className="py-8 text-center text-sm text-gray-500">Memuat...</p></section>;

  const jpegDone = !!data.drive_folder_url;
  const selectionDone = !!data.submitted_at || data.selection_closed;
  const left = timeLeft(data.selection_deadline_at);
  const editedReady = !!data.edited_folder_url;
  const editedDone = !!data.edited_delivered_at;

  const waMsg = encodeURIComponent(`Halo ${customerName ?? ""}, hasil editan foto Anda (${invoiceNumber}) sudah siap 🎉 Silakan buka akun Anda untuk melihat dan mengunduhnya: ${window.location.origin}/account`);
  const waLink = customerWhatsapp ? `https://wa.me/${customerWhatsapp.replace(/\D/g, "")}?text=${waMsg}` : null;

  return (
    <section className={`${panel} space-y-4 print:hidden`}>
      <div>
        <h2 className="text-lg font-semibold">Pengiriman hasil</h2>
        <p className="text-sm text-gray-500">Ikuti urutannya: upload JPEG → customer memilih → kirim editan{data.video_applicable ? " → kirim video" : ""}.</p>
      </div>

      {/* 1. JPEG */}
      <Step n={1} title="File JPEG (semua foto)" state={jpegDone ? "done" : "todo"}
        chip={jpegDone ? <Chip state="done">Terupload{data.photo_count != null ? ` • ${data.photo_count} foto` : ""}</Chip> : <Chip state="todo">Belum diupload</Chip>}>
        <Field label="Link folder Google Drive" hint="Upload semua JPEG ke satu folder di Drive, lalu tempel linknya. Link dicek saat disimpan.">
          <input value={jpeg} onChange={(e) => setJpeg(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className={inputCls} />
        </Field>
        {jpegDone && data.jpeg_uploaded_at && <p className="text-xs text-gray-500">Terhubung {fmt(data.jpeg_uploaded_at)}. Customer sudah bisa melihat foto.</p>}
        <div className="flex flex-wrap gap-2">
          <button className={btnPrimary} disabled={busy !== null || jpeg.trim() === (data.drive_folder_url ?? "")} onClick={() => put("jpeg", { drive_folder_url: jpeg.trim() || null }, "Folder JPEG disimpan")}>
            {busy === "jpeg" ? "Memeriksa..." : jpegDone ? "Simpan perubahan" : "Hubungkan folder"}
          </button>
          {jpegDone && <>
            <button className={btnGhost} disabled={busy !== null} onClick={() => post("refresh", "refresh", "Jumlah foto diperbarui")}><HiRefresh className={busy === "refresh" ? "animate-spin" : ""} /> Segarkan jumlah</button>
            <a className={btnGhost} href={data.drive_folder_url!} target="_blank" rel="noreferrer">Buka di Drive <HiExternalLink /></a>
          </>}
        </div>
      </Step>

      {/* 2. Pilihan customer */}
      <Step n={2} title="Pilihan customer" state={selectionDone ? "done" : "wait"}
        chip={data.submitted_at ? <Chip state="done">Dikirim • {data.selections.length} foto</Chip>
          : data.selection_closed ? <Chip state="done">Tenggat berakhir • {data.selections.length} foto</Chip>
          : data.selections.length ? <Chip state="wait">Draft • {data.selections.length} foto{left ? ` • ${left.label.toLowerCase()}` : ""}</Chip>
          : <Chip state="wait">{jpegDone ? `Belum memilih${left ? ` • ${left.label.toLowerCase()}` : ""}` : "Menunggu JPEG"}</Chip>}>
        {/* Tenggat memilih */}
        <div className={clsx("rounded-lg border p-3", data.selection_closed ? "border-gray-200 dark:border-gray-700" : left?.urgent ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20" : "border-gray-200 dark:border-gray-700")}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold">Tenggat memilih</span>
            {left ? <span className={clsx("text-xs font-semibold", left.closed ? "text-gray-500" : left.urgent ? "text-amber-700 dark:text-amber-300" : "text-gray-600 dark:text-gray-300")}>{left.label}</span> : <span className="text-xs text-gray-500">Mulai dihitung setelah JPEG diupload</span>}
          </div>
          {data.ready_to_edit
            ? <p className="mb-2 text-xs text-emerald-700 dark:text-emerald-400">Sudah boleh mulai mengedit{data.submitted_at ? " (customer sudah mengirim pilihan)" : " (tenggat berakhir)"}.</p>
            : left && <p className="mb-2 text-xs text-gray-500">Anda bisa mulai mengedit setelah <b>{left.date}</b>, atau lebih awal bila customer menekan “Kirim pilihan”.</p>}
          {jpegDone && (
            <div className="space-y-2">
              <DateTimeInput value={deadline} onChange={setDeadline} className={inputCls} placeholder="Atur tenggat" />
              <div className="flex flex-wrap gap-2">
                {[3, 7].map((n) => (
                  <button key={n} className={btnGhost} disabled={busy !== null} type="button"
                    onClick={() => post(`ext${n}`, "selection/extend", `Tenggat diperpanjang ${n} hari`, { days: n })}>
                    +{n} hari
                  </button>
                ))}
                <button className={btnPrimary} disabled={busy !== null || !deadline || deadline === (data.selection_deadline_at ? dayjs(data.selection_deadline_at).format("YYYY-MM-DDTHH:mm") : "")}
                  onClick={() => put("deadline", { selection_deadline_at: dayjs(deadline).format("YYYY-MM-DD HH:mm:ss") }, "Tenggat disimpan")}>Simpan tenggat</button>
              </div>
            </div>
          )}
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="Batas jumlah foto yang boleh dipilih" hint="Kosongkan jika tanpa batas.">
            <input type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Tanpa batas" className={inputCls} />
          </Field>
          <button className={`${btnGhost} sm:mb-[22px]`} disabled={busy !== null || limit === (data.selection_limit ? String(data.selection_limit) : "")} onClick={() => put("limit", { selection_limit: limit ? Number(limit) : null }, "Batas pilihan disimpan")}>Simpan batas</button>
        </div>
        {data.selections.length > 0 && (
          <div>
            {selectionDone && <p className="mb-2 text-xs text-gray-500">Dikirim customer {fmt(data.submitted_at)}.</p>}
            {data.note && <p className="mb-2 rounded-lg bg-gray-50 p-3 text-sm italic text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">Catatan: {data.note}</p>}
            <ul className="max-h-48 divide-y overflow-auto rounded-lg border text-sm dark:divide-gray-700 dark:border-gray-700">
              {data.selections.map((s) => <li key={s.file_id} className="truncate px-3 py-1.5">{s.file_name}</li>)}
            </ul>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className={btnGhost} onClick={async () => { await navigator.clipboard.writeText(data.selections.map((s) => s.file_name).join("\n")); toast.success("Nama file disalin"); }}>Salin nama file</button>
              {selectionDone && <button className={btnGhost} disabled={busy !== null} onClick={() => post("reopen", "reopen", "Seleksi dibuka kembali untuk customer")}>Buka kembali untuk customer</button>}
            </div>
          </div>
        )}
      </Step>

      {/* 3. Editan */}
      <Step n={3} title="Hasil editan" state={editedDone ? "done" : selectionDone ? "todo" : "wait"}
        chip={editedDone ? <Chip state="done">Terkirim • {data.edited_photo_count ?? 0} foto</Chip> : editedReady ? <Chip state="todo">Folder siap • belum dikirim</Chip> : <Chip state={selectionDone ? "todo" : "wait"}>{selectionDone ? "Perlu dikirim" : "Menunggu pilihan"}</Chip>}>
        <Field label="Link folder hasil editan" hint="Upload foto yang sudah diedit ke folder terpisah di Drive. Customer baru bisa melihatnya setelah Anda menekan “Kirim ke customer”.">
          <input value={edited} onChange={(e) => setEdited(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className={inputCls} />
        </Field>
        {editedDone && <p className="text-xs text-emerald-700 dark:text-emerald-400">Terkirim ke customer {fmt(data.edited_delivered_at)}.</p>}
        <div className="flex flex-wrap gap-2">
          <button className={editedReady ? btnGhost : btnPrimary} disabled={busy !== null || edited.trim() === (data.edited_folder_url ?? "")} onClick={() => put("edited", { edited_folder_url: edited.trim() || null }, "Folder editan disimpan")}>
            {busy === "edited" ? "Memeriksa..." : editedReady ? "Simpan perubahan" : "Simpan folder"}
          </button>
          {editedReady && !editedDone && (
            <button className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40" disabled={busy !== null || edited.trim() !== (data.edited_folder_url ?? "")} onClick={() => post("deliver", "edited/deliver", "Hasil editan dikirim ke customer 🎉")}>
              {busy === "deliver" ? "Mengirim..." : "Kirim ke customer"}
            </button>
          )}
          {editedDone && <>
            {waLink && <a className={btnGhost} href={waLink} target="_blank" rel="noreferrer">Beritahu via WhatsApp</a>}
            <button className={btnGhost} disabled={busy !== null} onClick={() => post("undeliver", "edited/undeliver", "Pengiriman ditarik kembali")}>Tarik kembali</button>
          </>}
          {editedReady && <>
            <button className={btnGhost} disabled={busy !== null} onClick={() => post("refresh", "refresh", "Jumlah foto diperbarui")}><HiRefresh className={busy === "refresh" ? "animate-spin" : ""} /> Segarkan</button>
            <a className={btnGhost} href={data.edited_folder_url!} target="_blank" rel="noreferrer">Buka di Drive <HiExternalLink /></a>
          </>}
        </div>
      </Step>

      {/* 4. Video (hanya bila ada paket video) */}
      {(data.video_applicable || data.video_url) && (
        <Step n={4} title="Video" state={data.video_delivered_at ? "done" : "todo"}
          chip={data.video_delivered_at ? <Chip state="done">Link terkirim</Chip> : <Chip state="todo">Belum ada link</Chip>}>
          <Field label="Link video" hint="Cukup tempel URL (Google Drive, YouTube, dll.). Customer langsung bisa membukanya setelah disimpan.">
            <input type="url" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          {data.video_delivered_at && <p className="text-xs text-emerald-700 dark:text-emerald-400">Terkirim ke customer {fmt(data.video_delivered_at)}.</p>}
          <div className="flex flex-wrap gap-2">
            <button className={btnPrimary} disabled={busy !== null || video.trim() === (data.video_url ?? "")} onClick={() => put("video", { video_url: video.trim() || null }, video.trim() ? "Link video dikirim ke customer" : "Link video dihapus")}>
              {busy === "video" ? "Menyimpan..." : data.video_url ? "Simpan perubahan" : "Kirim link video"}
            </button>
            {data.video_url && <a className={btnGhost} href={data.video_url} target="_blank" rel="noreferrer">Buka video <HiExternalLink /></a>}
          </div>
        </Step>
      )}
    </section>
  );
}
