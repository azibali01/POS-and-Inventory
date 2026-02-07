import { TextInput as MantineTextInput, type TextInputProps as MantineTextInputProps } from "@mantine/core";
import { forwardRef } from "react";

/**
 * Custom TextInput component wrapping Mantine TextInput
 * Provides consistent styling and behavior across the application
 */

export interface TextInputProps extends Omit<MantineTextInputProps, 'error'> {
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
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
}

/**
 * Common TextInput component
 * 
 * @example
 * ```tsx
 * <TextInput 
 *   label="Customer Name" 
 *   placeholder="Enter name"
 *   required
 * />
 * <TextInput 
 *   label="Email" 
 *   error="Invalid email format"
 * />
 * ```
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    return <MantineTextInput ref={ref} {...props} />;
  }
);

TextInput.displayName = "TextInput";
