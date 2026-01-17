// import TableEvent from "./Table";

// import Calendar from "@components/Flowbite/Calendar";
import { useEffect, useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import useGetAll from "@services/admin/event/hooks/useGetAll";
import ModalComponent from "@components/Flowbite/Modal";
import { useModal } from "@hooks/useModal";
import { Event } from "@services/admin/event/interfaces/get-all.type";
import TextInputComponent from "@components/Flowbite/Input";
import Form from "@components/Form/Form";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICreatePayload } from "@services/admin/event/interfaces/create.type";
import TextareaComponent from "@components/Flowbite/Textarea";
import { formattedDateTime } from "@helpers/date";

import { Spinner, Button } from "flowbite-react";
import useUpdate from "@services/admin/event/hooks/useUpdate";
import { toast } from "react-toastify";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    item: Event;
  };
}

type FormFields = ICreatePayload;

export default function AdminEvent() {
  const { isOpen, openModal, closeModal } = useModal();

  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  /** call api */
  const { data } = useGetAll();
  const { updateData } = useUpdate(selectedEvent?.extendedProps.item.id as string);


  /** form */
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;


  /** handle event */
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    openModal();
  };

  useEffect(() => {
    const eventData: CalendarEvent[] = (data ?? []).map(item => ({
      id: String(item.id),
      title: item.invoice_detail.package.name,
      start: item.date,
      end: item.date,
      extendedProps: {
        calendar: "Primary",
        customer: item.customer.name,
        item,
      },
    }));

    setEvents(eventData);
  }, [data]);


  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    console.log(state);
    const { error, response } = await updateData({
      ...state,
      package_id: selectedEvent?.extendedProps.item.invoice_detail.package.id as string,
      invoice_id: selectedEvent?.extendedProps.item.invoice.id as string
    });
    if (error || response) {
      if (error) {
        toast.error("Failed to Update!");
      } else {
        // useGoBack();
        methods.reset();
        closeModal();

        toast.success("Update successfully.");

      }
    }
  }

  return (
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* <TableEvent /> */}
        <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              selectable={true}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              customButtons={{
                addEventButton: {
                  text: "Add Event +",
                  click: () => console.log("add Event"),
                },
              }}
            />
          </div>
        </div>
      </div>

      <ModalComponent onOpen={isOpen} onClose={closeModal} size="xl" title={`EVENT | ${selectedEvent?.extendedProps.item.invoice.number}`}>


        <Form {...methods} onSubmit={onSubmit}>
          <TextInputComponent label="Customer" name="customer_id" type="text" defaultValue={selectedEvent?.extendedProps.item.customer.name} isReadOnly isRequired />
          <TextInputComponent label="Package" name="package_name" type="text" defaultValue={selectedEvent?.extendedProps.item.invoice_detail.package.name} isReadOnly isRequired />
          <TextInputComponent label="Date" name="date" type="datetime-local" defaultValue={selectedEvent ? formattedDateTime(selectedEvent?.extendedProps.item.date) : null} isRequired />
          <TextareaComponent label="Note" name="note" defaultValue={selectedEvent?.extendedProps.item.note} isRequired />
          <TextareaComponent label="Location" name="location" defaultValue={selectedEvent?.extendedProps.item.location} isRequired />

          <div className="flex md:flex-row flex-col md:justify-end md:mt-4 gap-2">
            <Button
              type="submit"
              className={`cursor-pointer md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${!isValid || isSubmitting
                ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed focus:outline-none disabled:opacity-100"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                }`}
              disabled={!isValid || isSubmitting}
            >
              {!isSubmitting ? "Save" : <Spinner />}
            </Button>
          </div>
        </Form>

      </ModalComponent >
    </>
  );
}

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm cursor-pointer`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};
