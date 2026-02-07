import { Select as MantineSelect, type SelectProps as MantineSelectProps } from "@mantine/core";
import { forwardRef } from "react";

/**
 * Custom Select component wrapping Mantine Select
 * Provides consistent styling and behavior for dropdown selections
 */

export interface SelectProps extends Omit<MantineSelectProps, 'data' | 'error'> {
  /** Select label */
  label?: string;
  /** Select placeholder */
  placeholder?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error message */
  error?: string | boolean;
  /** Helper text */
  description?: string;
  /** Select options */
  data: Array<string | { value: string; label: string; disabled?: boolean }>;
  /** Searchable select */
  searchable?: boolean;
  /** Clearable select */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Create new options on the fly */
  creatable?: boolean;
  /** Callback when creating new option */
  onCreate?: (query: string) => string | { value: string; label: string } | null | undefined;
}

/**
 * Common Select component
 * 
 * @example
 * ```tsx
 * <Select 
 *   label="Customer" 
 *   placeholder="Select customer"
 *   data={customers.map(c => ({ value: c.id, label: c.name }))}
 *   searchable
 * />
 * <Select 
 *   label="Status"
 *   data={['Active', 'Inactive']}
 * />
 * ```
 */
export const Select = forwardRef<HTMLInputElement, SelectProps>(
  (props, ref) => {
    return <MantineSelect ref={ref} {...props} />;
  }
);

Select.displayName = "Select";
