import { useState, useEffect } from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { Label } from "flowbite-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";

interface Props {
  label?: string;
  name: string;
  placeholder?: string;
  formatPattern?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  defaultValue?: Date | null;
  value?: Date | null;
  className?: string;
  onChange: (date: Date | null) => void;
}

export default function DatetimeRangePickerComponent({
  label,
  name,
  placeholder = "Pilih Tanggal",
  isRequired,
  isReadOnly,
  defaultValue,
  value,
  className,
  onChange,
  ...restProps
}: Props) {
  const { register, unregister } = useFormContext();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value || defaultValue || null
  );

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onChange(date);
    }
  };

  const [range, setRange] = useState<[Date?, Date?]>([]);
  const handleChange = (dates: Date[]) => {
    if (dates.length === 2) {
      setRange(dates as [Date?, Date?]);
    }
  };

  useEffect(() => {
    if (range) console.log(range);
  }, [range, setRange]);

  useEffect(() => {
    setSelectedDate(value || defaultValue || null);
  }, [value, defaultValue]);

  useEffect(
    () => () => {
      unregister(name);
    },
    [name, unregister]
  );

  return (
    <div className="flex flex-col">
      <div className="mb-2 block">
        {label && (
          <Label htmlFor={name}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
        )}
      </div>
      <div
        className={clsx([
          "rounded-lg flex flex-wrap items-stretch w-full",
          isReadOnly && "bg-gray-100",
        ])}
      >
        <Flatpickr
          options={{
            mode: "range",
            dateFormat: "Y-m-d H:i",
            enableTime: true,
            time_24hr: true,
            minuteIncrement: 1,
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          placeholder="Pilih tanggal dan waktu mulai & selesai"
          onChange={(selectedDates: Date[]) => {
            if (selectedDates.length === 2) {
              setRange([selectedDates[0], selectedDates[1]]);
              console.log([selectedDates[0], selectedDates[1]]);
            }
          }}
        />
      </div>
    </div>
  );
}
