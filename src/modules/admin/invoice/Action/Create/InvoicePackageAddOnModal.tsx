import TextInputComponent from "@components/Flowbite/Input";
import ModalComponent from "@components/Flowbite/Modal";
import SelectComponent from "@components/Flowbite/Select";
import Form from "@components/Form/Form";
import useMapInputOptions from "@hooks/useMapInputOptions";
import { UiPackage, UiPackageAddOn } from "@services/admin/invoice/interfaces/create.type";
import { Button, Spinner } from "flowbite-react";
import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import useGetAllAddOn from "@services/admin/package-addon/hooks/useGetAll";
import { HiPlus } from "react-icons/hi";
import { useEffect, } from "react";

interface Props {
  onOpen: boolean;
  onClose: () => void;
  item: UiPackage;
  onSubmitSuccess: (payload: UiPackageAddOn[]) => void;
}

const emptyAddOn: UiPackageAddOn = { id: "", name: "", price: 0, quantity: 1 };

export default function InvoicePackageAddOnModal({ onOpen, onClose, item, onSubmitSuccess }: Props) {
  const { data: dataAddOn } = useGetAllAddOn();
  const addonOptions = useMapInputOptions(dataAddOn);

  const methods = useForm<UiPackage>({
    mode: "onChange",
    defaultValues: { package_addons: [emptyAddOn] },
  });

  const { control, reset, setValue, getValues } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: "package_addons" });
  const watchedAddons = useWatch({ control, name: "package_addons" });
  const { isSubmitting, isValid } = methods.formState;

  useEffect(() => {
    if (!onOpen) {
      reset({ package_addons: [emptyAddOn] });
    }
  }, [onOpen, reset]);

  useEffect(() => {
    if (onOpen) {
      reset({ package_addons: item.package_addons?.length ? item.package_addons : [emptyAddOn] });
    }
  }, [onOpen, item, reset]);

  useEffect(() => {
    if (!dataAddOn) return;

    const currentAddons = getValues("package_addons");
    if (!currentAddons?.length) return;

    for (let idx = currentAddons.length - 1; idx >= 0; idx--) {
      const addon = currentAddons[idx];
      if (!addon?.id) continue;

      const selected = dataAddOn.find((a) => a.id === addon.id);
      if (!selected) continue;

      // Sync name & price
      if (addon.name !== selected.name) {
        setValue(`package_addons.${idx}.name`, selected.name, {
          shouldDirty: false, shouldTouch: false, shouldValidate: false,
        });
      }
      if (addon.price !== selected.price) {
        setValue(`package_addons.${idx}.price`, selected.price, {
          shouldDirty: false, shouldTouch: false, shouldValidate: false,
        });
      }

      const duplicateIndex = currentAddons.findIndex((a, i) => a.id === addon.id && i < idx);

      if (duplicateIndex !== -1) {
        const existingQty = Number(currentAddons[duplicateIndex]?.quantity ?? 0);
        const addedQty = Number(currentAddons[idx]?.quantity ?? 1);

        remove(idx);
        setTimeout(() => {
          setValue(`package_addons.${duplicateIndex}.quantity`, existingQty + addedQty, {
            shouldDirty: true,
          });
        }, 0);
        break; // satu merge per cycle, stop loop
      }
    }

  }, [watchedAddons, dataAddOn, getValues, setValue, remove]);// tetap depend pada watchedAddons agar trigger saat ada perubahan

  const onSubmit: SubmitHandler<UiPackage> = async (state) => {
    onSubmitSuccess(state.package_addons ?? []);
    onClose();
  };

  return (
    <ModalComponent onOpen={onOpen} onClose={onClose} size="lg" title={item.name}>
      <Form {...methods} onSubmit={onSubmit}>
        <Button
          type="button"
          size="sm"
          onClick={() => append(emptyAddOn)}
          className="md:w-fit w-full md:flex hidden mb-3 cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
        >
          <HiPlus className="mr-2 h-4 w-4" /> Add On
        </Button>

        <div className="grid md:grid-cols-2 gap-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex flex-col gap-2">
              <SelectComponent
                label="Item"
                name={`package_addons.${idx}.id`}
                selectOptions={addonOptions}
                isRequired
              />
              <TextInputComponent
                label="Quantity"
                type="number"
                name={`package_addons.${idx}.quantity`}
                placeholder="Quantity of package invoice"
                defaultValue={field.quantity}
                isRequired
              />
              <Button
                size="xs"
                onClick={() => remove(idx)}
                className="col-span-2 w-fit mt-2 cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800 rounded-lg"
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>

        <div className="flex md:flex-row flex-col md:justify-end md:mt-4 gap-2">
          <Button
            type="button"
            onClick={() => append(emptyAddOn)}
            className="md:w-fit w-full md:hidden visible py-2 cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
          >
            <HiPlus className="mr-2 h-4 w-4" /> Add On
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`md:w-fit w-full md:px-5 rounded-lg py-2 font-medium text-base ${!isValid || isSubmitting
              ? "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
              }`}
          >
            {isSubmitting ? <Spinner /> : "Simpan"}
          </Button>
        </div>
      </Form>
    </ModalComponent>
  );
}