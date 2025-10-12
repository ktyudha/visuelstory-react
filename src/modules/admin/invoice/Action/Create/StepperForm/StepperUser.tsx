import { useMemo } from "react";

import SelectTwo from "@components/Flowbite/SelectTwo";

import useGetAllCustomer from "@services/admin/customer/hooks/useGetAll";

export default function StepperUser() {
  const { data: dataCustomer, setName: setNameCustomer } = useGetAllCustomer();

  const customerOptions = useMemo(() => {
    if (!dataCustomer || dataCustomer.length === 0) {
      return [{ label: "Data tidak ditemukan", value: "" }];
    }
    return dataCustomer.map((each: any) => ({
      label: each.whatsapp + " - " + each.name,
      value: each.id,
    }));
  }, [dataCustomer]);

  return (
    <div>
      <SelectTwo
        label="Customer"
        name={`customer_id`}
        isSearchable
        isRequired
        selectTwoOptions={customerOptions}
        onInputChange={setNameCustomer}
      />
    </div>
  );
}
