import {
  FunctionComponent,
  HTMLInputTypeAttribute,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import Icon from "../Icon";
// gak work sama react form hook
import { MaskOptions, useMask } from "@react-input/mask";

interface Props {
  label?: string;
  name: string;
  type: HTMLInputTypeAttribute | "textarea";
  placeholder: string;
  error?: string;
  withShowPasswordButton?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  defaultValue?: any;
  value?: any;
  fontSizeLabel?: string;
  fontWeightLabel?: string;
  min?: number;
  wrapperClassName?: string;
  className?: string;
  errorMessage?: string;
  maskOptions?: MaskOptions;
}

const FormInput: FunctionComponent<Props> = ({
  label,
  name,
  type = "text",
  placeholder,
  withShowPasswordButton,
  isRequired = false,
  isReadOnly = false,
  defaultValue,
  value,
  min,
  wrapperClassName,
  className,
  errorMessage = "",
  maskOptions,
  ...restProps
}) => {
  const { register, unregister, watch } = useFormContext();
  const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
  const [inputType, setInputType] = useState<
    HTMLInputTypeAttribute | "textarea"
  >(type);
  const Tag = inputType === "textarea" ? "textarea" : "input";
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

  const onSwitchPasswordType = useCallback(() => {
    if (inputType === "password") {
      setInputType("text");
    } else {
      setInputType("password");
    }
    setIsPasswordShow((prev) => !prev);
    return;
  }, [inputType, setIsPasswordShow]);

  return (
    <div className="flex flex-col font-sans">
      {label && (
        <label
          htmlFor={name}
          className="flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 font-normal"
        >
          {label}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex flex-col gap-1">
        <div
          className={clsx([
            wrapperClassName
              ? wrapperClassName
              : "py-2 px-3 rounded-lg flex flex-wrap items-stretch w-full border-2 border-neutral-200",
            borderColor,
            isReadOnly && "bg-gray-100",
          ])}
        >
          <Tag
            ref={inputRef as any}
            {...restProps}
            className={clsx([
              "flex-shrink flex-grow flex-auto leading-normal w-px border-0 outline-none font-normal placeholder:text-[14px] placeholder:text-neutral-500",
              isReadOnly && "bg-gray-100",
              className,
            ])}
            name={name}
            type={inputType}
            placeholder={placeholder}
            {...(name &&
              register(name, {
                required: isRequired && {
                  value: true,
                  message: "Tidak Boleh Kosong",
                },
              }))}
            key={name}
            min={min}
            defaultValue={defaultValue}
            value={value}
            required={isRequired}
            readOnly={isReadOnly}
          />
          {withShowPasswordButton && (
            <button
              type="button"
              onClick={() => onSwitchPasswordType()}
              className="flex items-center justify-center ml-2 -mr-px"
            >
              <span className="flex items-center bg-white rounded whitespace-no-wrap text-gray-600">
                <Icon name={isPasswordShow ? "eye" : "eye-closed"} />
              </span>
            </button>
          )}
        </div>

        {/* Error Message */}
        {errorMessage !== "" && (
          <span className="text-danger-400 text-[12px]">{errorMessage}</span>
        )}
      </div>
    </div>
  );
};

export default FormInput;
