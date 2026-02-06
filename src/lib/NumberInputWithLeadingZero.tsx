import { NumberInput } from "@mantine/core";
import type { NumberInputProps } from "@mantine/core";
import {
  formatNumberWithLeadingZero,
  parseNumberWithLeadingZero,
} from "./number-utils";

/**
 * NumberInput component that automatically adds a leading zero for numbers less than 10
 */
export function NumberInputWithLeadingZero(props: NumberInputProps) {
  const { value, onChange, ...rest } = props;

  const handleChange = (val: string | number) => {
    const numValue = parseNumberWithLeadingZero(val);
    if (onChange) {
      onChange(numValue);
    }
  };

  // Format the display value
  const displayValue =
    value !== undefined
      ? formatNumberWithLeadingZero(value)
      : undefined;

  return <NumberInput {...rest} value={displayValue} onChange={handleChange} />;
}

export default NumberInputWithLeadingZero;
