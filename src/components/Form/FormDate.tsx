import { FunctionComponent, ChangeEvent, useState, useEffect } from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import "./form-style.css";

interface FormDateProps {
  label?: string;
  name: string;
  placeholder?: string;
  formatPattern?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  defaultValue?: any;
  value?: any;
  className?: string;
  minDate?: string;
  maxDate?: string;
  onChange: (date: Date) => void;
}

const FormDate: FunctionComponent<FormDateProps> = ({
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
}) => {
  const { register, unregister } = useFormContext();
  const [selectedDate, setSelectedDate] = useState<string>(value || null);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(e.target.value);
      onChange(date);
    }
  };

  useEffect(
    () => () => {
      unregister(name);
    },
    [name, unregister]
  );

  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={name}
          className={clsx([
            "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md",
          ])}
        >
          {label} {isRequired && <div className="text-red-500">*</div>}
        </label>
      )}

      <div
        className={clsx([
          "border-2 py-2 px-3 rounded-lg flex flex-wrap items-stretch w-full",
          isReadOnly && "bg-gray-100",
        ])}
      >
        <input
          {...restProps}
          className={clsx([
            "flex-shrink flex-grow flex-auto leading-normal w-px border-0 outline-none font-normal placeholder:text-[14px] placeholder:text-neutral-500",
            isReadOnly && "bg-gray-100",
            className,
          ])}
          {...(name &&
            register(name, {
              required: isRequired && {
                value: true,
                message: "Tidak Boleh Kosong",
              },
            }))}
          id={name}
          name={name}
          type="date"
          placeholder={placeholder}
          key={name}
          defaultValue={defaultValue}
          value={selectedDate}
          required={isRequired}
          readOnly={isReadOnly}
          min={minDate}
          max={maxDate}
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
};

export default FormDate;
