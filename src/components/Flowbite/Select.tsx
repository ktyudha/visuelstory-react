import { Label, Select } from "flowbite-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  label?: string;
  name: string;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  defaultValue?: any;
  value?: any;
  selectOptions: {
    label: string;
    value: string | number;
  }[];
  textTransform?: string;
  fontSizeLabel?: string;
  fontWeightLabel?: string;
}

export default function SelectComponent({
  label,
  name,
  error,
  isRequired,
  isDisabled,
  defaultValue,
  value,
  selectOptions,
  textTransform,
  fontSizeLabel = "text-md",
  fontWeightLabel = "font-normal",
  ...restProps
}: Props) {
  const { register, unregister } = useFormContext();

  useEffect(
    () => () => {
      unregister(name);
    },
    [name, unregister]
  );

  return (
    <div className="flex flex-col">
      {label && (
        <div className="mb-2 block">
          <Label htmlFor={name}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
        </div>
      )}
      <div>
        <Select
          {...restProps}
          name={name}
          {...(name &&
            register(name, {
              required: isRequired && {
                value: true,
                message: "Tidak Boleh Kosong",
              },
            }))}
          key={name}
          value={value ?? undefined}
          defaultValue={defaultValue ?? undefined}
          required={isRequired}
          disabled={isDisabled}
        >
          <option value="" selected>
            Pilih {label}
          </option>
          {selectOptions?.map((option) => (
            <option
              key={`select-item-${option.value}`}
              value={option.value}
              selected={option.value === defaultValue}
            >
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
