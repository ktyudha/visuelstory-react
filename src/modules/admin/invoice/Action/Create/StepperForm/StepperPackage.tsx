import { useMemo } from "react";

import TextInputComponent from "@components/Flowbite/Input";
import TextareaComponent from "@components/Flowbite/Textarea";
import SelectTwo from "@components/Flowbite/SelectTwo";

import useGetAll from "@services/admin/package/hooks/useGetAll";
import { formattedCurrency } from "@helpers/currency";

export default function StepperPackage() {
  const { data, setName } = useGetAll();

  const packageOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return data.map((each: any) => ({
      label:
        each.package_category.name +
        " - " +
        each.name +
        " - " +
        formattedCurrency(each.price),
      value: each.id,
    }));
  }, [data]);
  return (
    <div>
      <SelectTwo
        label="Package"
        name={`packages[0][id]`}
        isSearchable
        isRequired
        selectTwoOptions={packageOptions}
        onInputChange={setName}
      />

      <TextInputComponent
        label={`Quantity`}
        type="number"
        name={`packages[0][quantity]`}
        placeholder="Quantity of package invoice"
        defaultValue={1}
        isRequired
      />

      <TextInputComponent
        label={`Date of Event`}
        type="datetime-local"
        name={`packages[0][date]`}
        placeholder="Package of invoice"
        isRequired
      />

      <TextareaComponent
        label="Note"
        name={`packages[0][note]`}
        placeholder="Note of package invoice"
      />

      <TextareaComponent
        label="Location"
        name={`packages[0][location]`}
        placeholder="Location of package invoice"
      />
    </div>
  );
}
