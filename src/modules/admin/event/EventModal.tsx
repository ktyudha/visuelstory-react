import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import DateTimeInput from "@components/DateTimeInput";
import { toast } from "react-toastify";
import { mutate } from "swr";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { HiOutlineCalendar, HiOutlineChatAlt2, HiOutlineLocationMarker, HiOutlineUser } from "react-icons/hi";
import useUpdate from "@services/admin/event/hooks/useUpdate";
import type { Event } from "@services/admin/event/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";
import FormModal from "../shared/FormModal";
import { StatusPill } from "../shared/invoice-ui";
import { btnGhost, btnPrimary, Field, inputCls } from "../shared/ui";

interface Form { date: string; location: string; note: string }

export default function EventModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const { updateData } = useUpdate(event?.id ?? "");
  const { register, control, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm<Form>({ mode: "onChange" });

  useEffect(() => {
    setEditing(false);
    if (event) reset({ date: dayjs(event.date).format("YYYY-MM-DDTHH:mm"), location: event.location, note: event.note === "-" ? "" : event.note });
  }, [event, reset]);

  if (!event) return null;

  const onSubmit = handleSubmit(async (f) => {
    const { error } = await updateData({
      package_id: event.invoice_detail?.package?.id ?? "",
      invoice_id: event.invoice?.id ?? "",
      date: dayjs(f.date).format("YYYY-MM-DD HH:mm:ss"),
      location: f.location.trim(),
      note: f.note.trim() || "-",
    });
    if (error) return void toast.error(error === "Server error" ? "Gagal memperbarui jadwal." : error);
    toast.success("Jadwal diperbarui.");
    mutate((k) => Array.isArray(k) && String(k[0]).startsWith("events-"));
    onClose();
  });

  if (editing) {
    return (
      <FormModal open title="Ubah jadwal" onClose={() => setEditing(false)} onSubmit={onSubmit} submitting={isSubmitting} valid={isValid}>
        <Field label="Tanggal & jam">
          <Controller name="date" control={control} rules={{ required: true }} render={({ field }) => <DateTimeInput value={field.value ?? ""} onChange={field.onChange} className={inputCls} />} />
        </Field>
        <Field label="Lokasi"><textarea rows={2} {...register("location", { required: true })} className={inputCls} /></Field>
        <Field label="Catatan"><textarea rows={3} {...register("note")} className={inputCls} /></Field>
      </FormModal>
    );
  }

  const wa = event.customer?.whatsapp?.replace(/\D/g, "");
  const msg = encodeURIComponent(`Halo ${event.customer?.name ?? ""}, mengingatkan jadwal ${event.invoice_detail?.package?.name ?? "sesi foto"} pada ${dayjs(event.date).format("dddd, D MMMM YYYY HH:mm")} di ${event.location}. Terima kasih 🙏`);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:bg-gray-800 sm:max-w-md sm:rounded-2xl">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div className="text-xs text-gray-500">{event.invoice_detail?.package?.category}</div>
          <h2 className="text-lg font-semibold">{event.invoice_detail?.package?.name}</h2>
          {event.invoice && <div className="mt-1.5 flex items-center gap-2"><StatusPill status={event.invoice.status} /><span className="text-xs text-gray-500">{event.invoice.number}</span></div>}
        </div>

        <dl className="space-y-3 px-5 py-4 text-sm">
          <Row icon={<HiOutlineCalendar />}>{dayjs(event.date).format("dddd, D MMMM YYYY • HH:mm")} WIB</Row>
          <Row icon={<HiOutlineLocationMarker />}>{event.location}</Row>
          <Row icon={<HiOutlineUser />}><span className="capitalize">{event.customer?.name}</span>{event.customer?.whatsapp && <span className="text-gray-500"> • {event.customer.whatsapp}</span>}</Row>
          {event.note && event.note !== "-" && <Row icon={<HiOutlineChatAlt2 />}><span className="whitespace-pre-line italic text-gray-600 dark:text-gray-300">{event.note}</span></Row>}
          {event.invoice && event.invoice.remaining > 0 && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">Sisa tagihan <b>{formattedCurrency(event.invoice.remaining)}</b></div>
          )}
        </dl>

        <div className="flex flex-wrap gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-700">
          {event.invoice && <Link to={`/admin/invoices/show/${event.invoice.id}`} className={`${btnPrimary} flex-1`}>Buka invoice</Link>}
          {wa && <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noreferrer" className={`${btnGhost} flex-1`}>Ingatkan via WA</a>}
          <button className={btnGhost} onClick={() => setEditing(true)}>Ubah jadwal</button>
          <button className={btnGhost} onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex gap-3"><span className="mt-0.5 shrink-0 text-gray-400">{icon}</span><div className="min-w-0">{children}</div></div>
);
