import { useEffect, useState } from "react";
import { OtpKit } from "react-otp-kit";

import "react-otp-kit/dist/index.css";
import "./style.css";

interface Props {
  numOfInputs?: number;
  autoFocus?: boolean;
  type?: "number" | "text";
  submitOtpButton?: boolean;
  autoSubmit?: boolean;
  onChange: (param: string) => void;
}

export default function OtpInput({
  onChange,
  numOfInputs = 6,
  autoFocus = false,
  submitOtpButton = false,
  autoSubmit = true,
  type = "number",
}: Props) {
  const [otp, setOtp] = useState("");

  const handleChange = (newOtp: string) => {
    setOtp(newOtp);
  };

  useEffect(() => {
    onChange(otp);
  }, [otp]);

  return (
    <OtpKit
      value={otp}
      onChange={handleChange}
      numOfInputs={numOfInputs}
      type={type}
      autoFocus={autoFocus}
      autoSubmit={autoSubmit}
      submitOtpButton={{ show: submitOtpButton }}
    />
  );
}
