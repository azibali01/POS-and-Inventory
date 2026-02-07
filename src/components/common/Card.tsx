import { Card as MantineCard, type CardProps as MantineCardProps } from "@mantine/core";
import type { ReactNode } from "react";

/**
 * Custom Card component wrapping Mantine Card
 * Provides consistent styling for card containers
 */

export interface CardProps extends MantineCardProps {
  /** Card children */
  children: ReactNode;
  /** Card padding */
  padding?: "xs" | "sm" | "md" | "lg" | "xl" | string | number;
  /** Card shadow */
  shadow?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Card radius */
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  /** With border */
  withBorder?: boolean;
}

/**
 * Common Card component
 * 
 * @example
 * ```tsx
 * <Card shadow="sm" padding="lg">
 *   <h3>Customer Details</h3>
 *   <p>Content here...</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  padding = "md",
  shadow = "sm",
  radius = "md",
  withBorder = true,
  ...props
}: CardProps) {
  return (
    <MantineCard
      padding={padding}
      shadow={shadow}
      radius={radius}
      withBorder={withBorder}
      {...props}
    >
      {children}
    </MantineCard>
  );
}
