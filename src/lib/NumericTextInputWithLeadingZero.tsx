import { TextInput } from "@mantine/core";
import type { TextInputProps } from "@mantine/core";
import React from "react";

export interface NumericTextInputWithLeadingZeroProps
  extends Omit<TextInputProps, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * TextInput that allows numeric strings with leading zeros (e.g. "03", "09")
 * Only allows digits, optional leading zeros, and empty string.
 */
export function NumericTextInputWithLeadingZero({
  value,
  onChange,
  ...rest
}: NumericTextInputWithLeadingZeroProps) {
  // Allow digits, optional decimal point, and empty string
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.currentTarget.value;
    if (/^\d*\.?\d*$/.test(val)) {
      onChange?.(val);
    }
  };

  return (
    <TextInput
      {...rest}
      value={value ?? ""}
      onChange={handleChange}
      inputMode="decimal"
      pattern="\\d*\\.?\\d*"
      placeholder={rest.placeholder ?? "e.g. 03, 09"}
    />
  );
}

export default NumericTextInputWithLeadingZero;
