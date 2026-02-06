/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select, type SelectProps } from "@mantine/core";
type SelectItem = { value: string; label: string; [key: string]: unknown };
type RawSelectData = unknown[] | null | undefined;
type RawSelectItem =
  | string
  | number
  | {
      value?: unknown;
      label?: unknown;
      id?: unknown;
      _id?: unknown;
      name?: unknown;
      [key: string]: unknown;
    }
  | null
  | undefined;

export default function SafeSelect(props: SelectProps) {
  const raw = (props.data as RawSelectData) || [];
  const sanitized = ((Array.isArray(raw) ? raw : []) as RawSelectItem[]).reduce<SelectItem[]>(
    (acc: SelectItem[], it: RawSelectItem) => {
      if (it == null) return acc;
      if (typeof it === "string" || typeof it === "number") {
        const s = String(it);
        if (s && s !== "undefined") acc.push({ value: s, label: s });
        return acc;
      }
      if (typeof it === "object") {
        // Use type-safe destructuring
        const {
          value: rawValue,
          label: rawLabel,
          id,
          _id,
          name,
          ...rest
        } = it as {
          value?: unknown;
          label?: unknown;
          id?: unknown;
          _id?: unknown;
          name?: unknown;
          [key: string]: unknown;
        };
        const value =
          rawValue !== undefined
            ? rawValue
            : id ?? _id ?? name ?? rawLabel ?? undefined;
        const label = rawLabel !== undefined ? rawLabel : name ?? value;
        const labelStr = label == null ? "" : String(label as any);
        const valueStr = value == null ? labelStr : String(value as any);
        // Only add if valueStr is not undefined, not empty, and not 'undefined'
        if (valueStr && valueStr !== "undefined") {
          acc.push({ value: valueStr, label: labelStr, ...rest });
        }
        return acc;
      }
      return acc;
    },
    []
  );

  // Use the sanitized data
  return <Select {...props} data={sanitized} />;
}
