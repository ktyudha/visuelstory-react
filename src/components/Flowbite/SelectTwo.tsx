import { FunctionComponent, useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useFormContext } from "react-hook-form";
import { Label } from "flowbite-react";
import clsx from "clsx";

export interface OptionValue {
  label: string;
  value: string | number;
}
interface Props {
  label?: string;
  name: string;
  isMulti?: boolean;
  isRequired?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  value?: any;
  defaultValue?: any;
  textTransform?: string;
  selectTwoOptions: {
    label: string;
    value: string | number;
  }[];
  onInputChange?: (inputValue: string) => void;
}

const SelectTwo: FunctionComponent<Props> = ({
  label,
  name,
  isMulti,
  isRequired,
  isSearchable = false,
  isClearable,
  value,
  defaultValue,
  selectTwoOptions,
  textTransform,
  ...restProps
}) => {
  const { register, unregister, setValue } = useFormContext();
  const [selectedValue, setSelectedValue] = useState<null | OptionValue>(null);

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
      setValue(name, value); // Sinkronkan nilai awal dengan react-hook-form
    }
  }, [value, name, setValue]);

  useEffect(() => {
    if (!selectedValue && defaultValue) {
      setSelectedValue(defaultValue);
      setValue(name, defaultValue[0].value); // Pastikan juga react-hook-form mendapatkan nilai awal
    }
  }, [defaultValue, selectedValue, setValue, name]);

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

      <ReactSelect
        {...restProps}
        name={name}
        className={clsx(`${isMulti ? "basic-multi-select" : "basic-single"}`)}
        classNamePrefix={`select-${label}`}
        placeholder={`Pilih ${label}`}
        {...(name &&
          register(name, {
            required: isRequired && {
              value: false,
              message: "Tidak Boleh Kosong",
            },
          }))}
        key={name}
        options={[
          // {
          //   label: `Pilih ${label}`,
          //   value: "",
          // },
          ...selectTwoOptions,
        ]}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isMulti={isMulti}
        defaultValue={selectedValue ?? defaultValue}
        required={isRequired}
        classNames={{
          control: () =>
            clsx("dark:!bg-gray-700 dark:!border-gray-600 !text-white "),
          menu: () => "dark:!bg-gray-700 !rounded-lg",
          menuList: () => "dark:!bg-gray-700 !rounded-lg !p-0",
          option: () =>
            clsx(
              "dark:!bg-gray-700 !cursor-pointer hover:dark:!bg-gray-800",
              textTransform ?? "capitalize"
            ),
          singleValue: () =>
            clsx("dark:!text-white", textTransform ?? "capitalize"),
          input: () => clsx("dark:!text-white"),
          placeholder: () => "dark:!text-gray-400 text-sm",
        }}
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "8px",
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "4px", // Tambah ruang dalam elemen
          }),
        }}
        onChange={(e: any) => {
          // Ambil hanya nilai value jika multi-select, jika single-select, ambil langsung value
          const selectedValues = isMulti
            ? e.map((item: any) => item.value)
            : e
            ? e.value
            : null;
          setSelectedValue(selectedValues);
          setValue(name, selectedValues);
        }}
        onInputChange={(inputValue, { action }) => {
          if (action === "input-change" && restProps.onInputChange) {
            restProps.onInputChange(inputValue);
          }
        }}
      />
    </div>
  );
};
export default SelectTwo;
