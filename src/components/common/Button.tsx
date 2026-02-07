import { Button as MantineButton, type ButtonProps as MantineButtonProps } from "@mantine/core";
import { forwardRef } from "react";

/**
 * Custom Button component wrapping Mantine Button
 * Provides consistent styling and behavior across the application
 */

export interface ButtonProps extends MantineButtonProps {
  /** Button variant - defaults to 'filled' */
  variant?: "filled" | "light" | "outline" | "subtle" | "default" | "white";
  /** Button size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Button color - uses Mantine theme colors */
  color?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Common Button component
 * 
 * @example
 * ```tsx
 * <Button onClick={handleClick}>Click Me</Button>
 * <Button variant="outline" color="red">Delete</Button>
 * <Button loading>Saving...</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <MantineButton ref={ref} {...props}>
        {children}
      </MantineButton>
    );
  }
);

Button.displayName = "Button";
