import clsx from "clsx";
import { HiUser, HiDocumentText, HiQrcode } from "react-icons/hi";

interface Props {
  activeStep: number;
}

export default function InvoiceCreateStepper({ activeStep = 0 }: Props) {
  const stepperItems = [
    { name: "user", icon: HiUser },
    { name: "package", icon: HiDocumentText },
    { name: "payment", icon: HiQrcode },
  ];

  return (
    <ol className="flex w-full">
      {stepperItems.map((item, idx) => {
        const isActive = idx <= activeStep;
        const isLast = stepperItems.length === idx + 1;
        const IconStepper = item.icon;

        return (
          <li
            // onClick={() => setActiveStep(idx)}
            className={clsx(
              "cursor-pointer flex items-center",
              !isLast &&
                "w-full after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block",
              isActive
                ? "text-blue-600 dark:text-white after:border-blue-100 dark:after:border-white"
                : "after:border-gray-100 dark:after:border-gray-700"
            )}
          >
            <span
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0",
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
                  : "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <IconStepper
                size={20}
                className={
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-100"
                }
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
