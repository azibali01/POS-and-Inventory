import { NumberInput as MantineNumberInput, type NumberInputProps as MantineNumberInputProps } from "@mantine/core";
import { forwardRef } from "react";

/**
 * Custom NumberInput component wrapping Mantine NumberInput
 * Provides consistent styling and behavior for numeric inputs
 */

export interface NumberInputProps extends Omit<MantineNumberInputProps, 'error'> {
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error message */
  error?: string | boolean;
  /** Helper text */
  description?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step value */
  step?: number;
  /** Number of decimal places */
  decimalScale?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Hide controls */
  hideControls?: boolean;
}

/**
 * Common NumberInput component
 * 
 * @example
 * ```tsx
 * <NumberInput 
 *   label="Quantity" 
 *   min={0}
 *   step={1}
 *   hideControls
 * />
 * <NumberInput 
 *   label="Price" 
 *   min={0}
 *   decimalScale={2}
 *   prefix="$"
 * />
 * ```
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    return <MantineNumberInput ref={ref} {...props} />;
  }
);

NumberInput.displayName = "NumberInput";
