import { useState, useCallback } from "react";
import { validateSchema, type ValidationSchema } from "@/utils/validation/validators";

/**
 * Custom hook for form validation
 * Provides validation state management and error handling
 */
export function useFormValidation<T extends Record<string, unknown>>(
  schema: ValidationSchema
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Validate entire form
   */
  const validate = useCallback(
    (data: T): boolean => {
      const validationErrors = validateSchema(data, schema);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    },
    [schema]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: string, value: unknown): string | null => {
      const fieldSchema = { [fieldName]: schema[fieldName] };
      const fieldData = { [fieldName]: value };
      const validationErrors = validateSchema(fieldData, fieldSchema);
      
      const error = validationErrors[fieldName] || null;
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || "",
      }));
      
      return error;
    },
    [schema]
  );

  /**
   * Mark a field as touched
   */
  const touchField = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Set a custom error for a field
   */
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  /**
   * Check if form has errors
   */
  const hasErrors = Object.keys(errors).some((key) => errors[key]);

  /**
   * Get error for a specific field (only if touched)
   */
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return touched[fieldName] ? errors[fieldName] : undefined;
    },
    [errors, touched]
  );

  return {
    errors,
    touched,
    hasErrors,
    validate,
    validateField,
    touchField,
    clearErrors,
    setFieldError,
    getFieldError,
  };
}
