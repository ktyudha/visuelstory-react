import clsx from "clsx";
import { HiCheck, HiOutlineClock, HiOutlineExclamation } from "react-icons/hi";
import dayjs from "dayjs";
import { timeLeft } from "@helpers/deadline";

export interface Delivery {
  jpeg: { uploaded: boolean; count: number | null; at: string | null };
  selection: { count: number; submitted_at: string | null; limit: number | null; deadline_at?: string | null; closed?: boolean; ready_to_edit?: boolean };
  edited: { prepared: boolean; delivered: boolean; count: number | null; at: string | null };
  video: { applicable: boolean; delivered: boolean; at: string | null };
}

/** done = selesai, todo = giliran ADMIN mengerjakan, wait = menunggu customer / tahap sebelumnya */
export type StepState = "done" | "todo" | "wait";
export interface Step { key: "jpeg" | "selection" | "edited" | "video"; label: string; short: string; state: StepState; detail: string }

const when = (d: string | null) => (d ? dayjs(d).format("D MMM, HH:mm") : "");

export function deliverySteps(d?: Delivery): Step[] {
  if (!d) return [];
  const steps: Step[] = [
    {
      key: "jpeg", label: "File JPEG", short: "JPEG",
      state: d.jpeg.uploaded ? "done" : "todo",
      detail: d.jpeg.uploaded ? `Terupload${d.jpeg.count != null ? ` • ${d.jpeg.count} foto` : ""}` : "Belum diupload",
    },
    {
      key: "selection", label: "Pilihan customer", short: d.selection.count > 0 ? `Pilih ${d.selection.count}` : "Pilihan",
      state: d.selection.submitted_at || d.selection.closed ? "done" : "wait",
      detail: (() => {
        if (d.selection.submitted_at) return `Dikirim • ${d.selection.count} foto`;
        if (d.selection.closed) return d.selection.count > 0 ? `Tenggat berakhir • ${d.selection.count} foto` : "Tenggat berakhir • tidak memilih";
        const left = timeLeft(d.selection.deadline_at);
        const base = d.selection.count > 0 ? `Draft • ${d.selection.count} foto` : d.jpeg.uploaded ? "Menunggu customer memilih" : "Menunggu JPEG";
        return left ? `${base} • ${left.label.toLowerCase()}` : base;
      })(),
    },
    {
      key: "edited", label: "Hasil editan", short: "Editan",
      state: d.edited.delivered ? "done" : d.selection.ready_to_edit ?? !!d.selection.submitted_at ? "todo" : "wait",
      detail: d.edited.delivered ? `Terkirim${d.edited.count != null ? ` • ${d.edited.count} foto` : ""}`
        : (d.selection.ready_to_edit ?? !!d.selection.submitted_at) ? (d.edited.prepared ? "Folder siap, belum dikirim" : "Perlu diedit & dikirim")
        : d.selection.deadline_at ? `Mulai ${dayjs(d.selection.deadline_at).format("D MMM")} (atau saat customer mengirim)` : "Menunggu pilihan customer",
    },
  ];
  if (d.video.applicable) {
    steps.push({ key: "video", label: "Video", short: "Video", state: d.video.delivered ? "done" : "todo", detail: d.video.delivered ? "Link terkirim" : "Belum ada link video" });
  }
  return steps;
}

const tone: Record<StepState, string> = {
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  todo: "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
  wait: "bg-gray-100 text-gray-500 ring-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:ring-gray-600",
};
const Icon = ({ s }: { s: StepState }) => (s === "done" ? <HiCheck /> : s === "todo" ? <HiOutlineExclamation /> : <HiOutlineClock />);

/** Pil ringkas per tahap (dipakai di tabel daftar invoice). */
export function DeliveryChips({ delivery }: { delivery?: Delivery }) {
  const steps = deliverySteps(delivery);
  if (!steps.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {steps.map((s) => (
        <span key={s.key} title={`${s.label}: ${s.detail}`}
          className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1", tone[s.state])}>
          <Icon s={s.state} /> {s.short}
        </span>
      ))}
    </div>
  );
}

/** Garis tahapan lengkap (dipakai di halaman detail invoice). */
export function DeliveryStepper({ delivery }: { delivery?: Delivery }) {
  const steps = deliverySteps(delivery);
  if (!steps.length) return null;
  const nextTodo = steps.find((s) => s.state === "todo");
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Progres pengiriman hasil</h2>
        {nextTodo
          ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"><HiOutlineExclamation /> Berikutnya: {nextTodo.label.toLowerCase()}</span>
          : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><HiCheck /> Semua terkirim</span>}
      </div>
      <ol className={clsx("grid gap-3", steps.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-start gap-3 sm:block">
            <div className="flex items-center sm:mb-2">
              <span className={clsx("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ring-2",
                s.state === "done" ? "bg-emerald-500 text-white ring-emerald-200 dark:ring-emerald-900"
                : s.state === "todo" ? "bg-amber-400 text-gray-900 ring-amber-200 dark:ring-amber-800"
                : "bg-gray-200 text-gray-500 ring-gray-100 dark:bg-gray-700 dark:ring-gray-600")}>
                {s.state === "done" ? <HiCheck /> : i + 1}
              </span>
              {i < steps.length - 1 && <span aria-hidden className={clsx("ml-2 hidden h-0.5 flex-1 rounded sm:block", s.state === "done" ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700")} />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{s.label}</div>
              <div className={clsx("text-xs", s.state === "todo" ? "font-medium text-amber-700 dark:text-amber-300" : "text-gray-500")}>{s.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export { when };
