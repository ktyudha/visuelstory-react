import { useState, useEffect } from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { Datepicker, Label } from "flowbite-react";

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
  minDate?: Date;
  maxDate?: Date;
  onChange: (date: Date | null) => void;
}

export default function DatepickerComponent({
  label,
  name,
  placeholder = "Pilih Tanggal",
  isRequired,
  isReadOnly,
  defaultValue,
  value,
  className,
  minDate,
  maxDate,
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
        <Datepicker
          {...restProps}
          className={clsx([
            "flex-shrink flex-grow flex-auto leading-normal w-px border-0 outline-none font-normal placeholder:text-[14px] placeholder:text-neutral-500",
            isReadOnly && "bg-gray-100",
            className,
          ])}
          {...(name && register(name))}
          id={name}
          name={name}
          placeholder={placeholder}
          key={name}
          defaultValue={defaultValue ?? undefined}
          value={selectedDate}
          required={isRequired}
          readOnly={isReadOnly}
          minDate={minDate}
          maxDate={maxDate}
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
}
