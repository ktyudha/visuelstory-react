import { useEffect, useMemo } from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { Textarea, Label } from "flowbite-react";
import { MaskOptions, useMask } from "@react-input/mask";

interface Props {
  label?: string;
  name: string;
  placeholder: string;
  error?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  defaultValue?: any;
  value?: any;
  fontSizeLabel?: string;
  fontWeightLabel?: string;
  rows?: number;
  className?: string;
  errorMessage?: string;
  maskOptions?: MaskOptions;
}

export default function TextareaComponent({
  label,
  name,
  placeholder,
  isRequired = false,
  isReadOnly = false,
  defaultValue,
  value,
  rows,
  className,
  errorMessage = "",
  maskOptions,
  ...restProps
}: Props) {
  const { register, unregister, watch } = useFormContext();
  const inputRef = useMask(maskOptions);
  const borderColor = useMemo(() => {
    if (errorMessage === "") {
      if (watch(name)) {
        return "border-neutral-200";
      } else {
        return "border-neutral-200";
      }
    }

    return "border-red-500";
  }, [name, errorMessage]);

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
      <div className={clsx([borderColor, isReadOnly && "cursor-not-allowed"])}>
        <Textarea
          ref={inputRef as any}
          {...restProps}
          name={name}
          id={name}
          placeholder={placeholder}
          {...(name &&
            register(name, {
              required: isRequired && {
                value: true,
                message: "Tidak Boleh Kosong",
              },
            }))}
          key={name}
          rows={rows}
          defaultValue={defaultValue}
          value={value}
          required={isRequired}
          readOnly={isReadOnly}
        />

        {/* Error Message */}
        {errorMessage !== "" && (
          <span className="text-danger-400 text-[12px]">{errorMessage}</span>
        )}
      </div>
    </div>
  );
}
