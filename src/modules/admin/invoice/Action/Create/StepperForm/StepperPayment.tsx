import { Label, FileInput } from "flowbite-react";

import TextInputComponent from "@components/Flowbite/Input";

interface Props {
  uploadsRef: React.RefObject<HTMLInputElement | null>;
}

export default function StepperPayment({ uploadsRef }: Props) {
  return (
    <div>
      <div>
        <Label className="mb-3 block">
          Proof of payment <span className="text-red-500">*</span>
        </Label>
        <FileInput
          ref={uploadsRef}
          accept="image/*"
          // onChange={handleChangeImage}
          required
        />
      </div>

      <TextInputComponent
        label={`Paid Amount`}
        type="number"
        name={`packages[0][paid_amount]`}
        placeholder="Quantity of package invoice"
        isRequired
      />
    </div>
  );
}
