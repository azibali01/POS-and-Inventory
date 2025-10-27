export function validateArrayResponse(name: string, v: unknown) {
  // returns undefined when ok, otherwise returns a warning string
  if (Array.isArray(v)) return undefined;
  if (v && typeof v === "object") {
    const maybe = v as { [k: string]: unknown };
    if (Array.isArray(maybe.data)) return undefined;
  }
  return `Unexpected response shape for ${name}: expected array or { data: [...] }`;
}
export default validateArrayResponse;
