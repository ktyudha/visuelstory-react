import ModalComponent from "@components/Flowbite/Modal";
import Form from "@components/Form/Form";
import TextareaComponent from "@components/Flowbite/Textarea";
import TextInputComponent from "@components/Flowbite/Input";

import { Package } from "@services/admin/package/interfaces/get-all.type";
import { UiPackage } from "@services/admin/invoice/interfaces/create.type";

import { SubmitHandler, useForm } from "react-hook-form";
import { Spinner, Button } from "flowbite-react";

interface Props {
  onOpen: boolean;
  onClose: () => void;
  item: Package;
  onSubmitSuccess: (payload: UiPackage) => void;
}

export default function InvoicePackageModal({
  onOpen,
  onClose,
  item,
  onSubmitSuccess,
}: Props) {
  const methods = useForm<UiPackage>({
    mode: "onChange",
  });
  const { reset } = methods;

  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  const onSubmit: SubmitHandler<UiPackage> = async (state) => {
    const { package_category, ...pkg } = item; // remove package_category
    const payload = {
      ...state,
      ...pkg,
      quantity: 1,
    };

    onSubmitSuccess(payload);
    onClose();
    reset();
  };

  return (
    <ModalComponent
      onOpen={onOpen}
      onClose={onClose}
      size="md"
      title={item.name}
    >
      <Form {...methods} onSubmit={onSubmit}>
        <TextInputComponent
          label="Date"
          name="date"
          type="datetime-local"
          isRequired
        />
        <TextareaComponent label="Location" name="location" isRequired />
        <TextareaComponent label="Note" name="note" isRequired />

        <div className="flex md:flex-row flex-col md:justify-end md:mt-4 gap-2">
          <Button
            type="submit"
            className={`cursor-pointer md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${
              !isValid || isSubmitting
                ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed focus:outline-none disabled:opacity-100"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
            }`}
            disabled={!isValid || isSubmitting}
          >
            {!isSubmitting ? "Create" : <Spinner />}
          </Button>
        </div>
      </Form>
    </ModalComponent>
  );
}
