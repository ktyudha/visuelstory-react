import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import "dayjs/locale/id";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiOutlineExclamationCircle, HiOutlineCollection } from "react-icons/hi";
import axiosInstance from "@lib/axios-instance";
import { formattedCurrency } from "@helpers/currency";
import type { Event } from "@services/admin/event/interfaces/get-all.type";
import { STATUS, StatusPill } from "../shared/invoice-ui";
import { panel } from "../shared/invoice-ui";
import EventModal from "./EventModal";

const COLOR = { unpaid: "#ef4444", down_payment: "#f59e0b", paid: "#10b981" } as const;

const fetchEvents = (from: string, to: string, limit = 100) => (url: string) =>
  axiosInstance({ withToken: true, tokenType: "admin" })
    .get(url, { params: { date_from: from, date_to: to, page_limit: limit } })
    .then((r) => r.data.data as Event[]);

function dayLabel(d: string) {
  const day = dayjs(d);
  if (day.isSame(dayjs(), "day")) return "Hari ini";
  if (day.isSame(dayjs().add(1, "day"), "day")) return "Besok";
  return day.format("ddd, D MMM");
}

export default function AdminEvent() {
  const calRef = useRef<FullCalendar>(null);
  const [range, setRange] = useState({ from: dayjs().startOf("month").format("YYYY-MM-DD"), to: dayjs().endOf("month").format("YYYY-MM-DD 23:59:59"), title: "" });
  const [selected, setSelected] = useState<Event | null>(null);

  // Acara pada rentang kalender yang sedang tampil
  const { data: visible } = useSWR(["events-range", range.from, range.to], () =>
    fetchEvents(range.from, range.to)(`/admin/events`), { keepPreviousData: true });
  // Agenda mendatang (30 hari), independen dari bulan yang dibuka
  const today = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const { data: upcoming } = useSWR(["events-upcoming"], () =>
    fetchEvents(today, dayjs().add(30, "day").format("YYYY-MM-DD 23:59:59"), 50)(`/admin/events`));

  const stats = useMemo(() => {
    const up = upcoming ?? [];
    const todayN = up.filter((e) => dayjs(e.date).isSame(dayjs(), "day")).length;
    const week = up.filter((e) => dayjs(e.date).isBefore(dayjs().add(7, "day").endOf("day"))).length;
    const month = visible?.length ?? 0;
    const unpaid = (visible ?? []).filter((e) => e.invoice?.status !== "paid");
    return { todayN, week, month, unpaidN: unpaid.length, outstanding: unpaid.reduce((s, e) => s + (e.invoice?.remaining ?? 0), 0) };
  }, [upcoming, visible]);

  const events: EventInput[] = useMemo(
    () => (visible ?? []).map((e) => ({
      id: e.id,
      title: `${e.customer?.name ?? "-"} • ${e.invoice_detail?.package?.name ?? ""}`,
      start: e.date as unknown as string,
      backgroundColor: COLOR[e.invoice?.status ?? "unpaid"],
      borderColor: COLOR[e.invoice?.status ?? "unpaid"],
      extendedProps: { item: e },
    })),
    [visible]
  );

  const grouped = useMemo(() => {
    const m = new Map<string, Event[]>();
    (upcoming ?? []).slice(0, 12).forEach((e) => {
      const k = dayjs(e.date).format("YYYY-MM-DD");
      m.set(k, [...(m.get(k) ?? []), e]);
    });
    return [...m.entries()];
  }, [upcoming]);

  const cards = [
    { label: "Hari ini", value: stats.todayN, icon: HiOutlineClock, tone: "text-blue-600" },
    { label: "7 hari ke depan", value: stats.week, icon: HiOutlineCalendar, tone: "text-indigo-600" },
    { label: `Acara ${range.title || "bulan ini"}`, value: stats.month, icon: HiOutlineCollection, tone: "text-gray-700 dark:text-gray-200" },
    { label: "Belum lunas (bulan ini)", value: stats.unpaidN, sub: stats.unpaidN ? `Sisa ${formattedCurrency(stats.outstanding)}` : "Semua lunas", icon: HiOutlineExclamationCircle, tone: "text-red-600" },
  ];

  return (
    <div className="space-y-5">
      {/* Rekapan */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={panel}>
            <c.icon className={`mb-2 ${c.tone}`} size={22} />
            <div className="text-2xl font-semibold">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
            {c.sub && <div className="text-xs text-gray-400">{c.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Kalender */}
        <section className={panel}>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLOR[k] }} /> {STATUS[k].label}
              </span>
            ))}
          </div>
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
            buttonText={{ today: "Hari ini", month: "Bulan", week: "Minggu" }}
            locale="id"
            firstDay={1}
            height="auto"
            dayMaxEvents={3}
            moreLinkText={(n) => `+${n} lagi`}
            events={events}
            eventClick={(a: EventClickArg) => setSelected(a.event.extendedProps.item as Event)}
            eventContent={renderEvent}
            datesSet={(a: DatesSetArg) => {
              const mid = dayjs(a.start).add(Math.floor(dayjs(a.end).diff(a.start, "day") / 2), "day");
              setRange({ from: dayjs(a.start).format("YYYY-MM-DD"), to: dayjs(a.end).format("YYYY-MM-DD 23:59:59"), title: a.view.type === "dayGridMonth" ? mid.format("MMMM") : "minggu ini" });
            }}
          />
        </section>

        {/* Agenda */}
        <aside className={`${panel} xl:sticky xl:top-20`}>
          <h2 className="mb-3 font-semibold">Agenda mendatang</h2>
          {!upcoming && <p className="py-6 text-center text-sm text-gray-500">Memuat...</p>}
          {upcoming?.length === 0 && <p className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">Tidak ada acara 30 hari ke depan.</p>}
          <div className="space-y-4">
            {grouped.map(([day, list]) => (
              <div key={day}>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{dayLabel(day)}</div>
                <ul className="space-y-2">
                  {list.map((e) => (
                    <li key={e.id}>
                      <button onClick={() => setSelected(e)} className="w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-left hover:border-blue-500 dark:border-gray-700"
                        style={{ borderLeft: `4px solid ${COLOR[e.invoice?.status ?? "unpaid"]}` }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium capitalize">{e.customer?.name ?? "-"}</span>
                          <span className="shrink-0 text-xs font-medium text-gray-500">{dayjs(e.date).format("HH:mm")}</span>
                        </div>
                        <div className="truncate text-xs text-gray-500">{e.invoice_detail?.package?.name}</div>
                        <div className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500"><HiOutlineLocationMarker className="shrink-0" />{e.location}</div>
                        {e.invoice && e.invoice.status !== "paid" && (
                          <div className="mt-1.5"><StatusPill status={e.invoice.status} /></div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {(upcoming?.length ?? 0) > 12 && <p className="mt-3 text-center text-xs text-gray-500">+{(upcoming?.length ?? 0) - 12} acara lainnya — lihat di kalender.</p>}
          <Link to="/admin/invoices/create" className="mt-4 block rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">+ Buat invoice baru</Link>
        </aside>
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function renderEvent(info: EventContentArg) {
  return (
    <div className="flex w-full items-center gap-1 overflow-hidden px-1 py-0.5 text-[11px] leading-tight text-white">
      {info.timeText && <b className="shrink-0">{info.timeText}</b>}
      <span className="truncate">{info.event.title}</span>
    </div>
  );
}
