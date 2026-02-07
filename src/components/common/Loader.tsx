import { Loader as MantineLoader, type LoaderProps } from "@mantine/core";

/**
 * Common Loader component wrapping Mantine Loader
 * Provides consistent loading indicators
 */

export interface LoaderComponentProps extends LoaderProps {
  /** Loader size */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Loader color */
  color?: string;
  /** Loader variant */
  type?: "bars" | "oval" | "dots";
}

/**
 * Loader component for loading states
 * 
 * @example
 * ```tsx
 * <Loader />
 * <Loader size="lg" color="blue" />
 * ```
 */
export function Loader({ size = "md", color = "blue", type = "oval", ...props }: LoaderComponentProps) {
  return <MantineLoader size={size} color={color} type={type} {...props} />;
}

/**
 * Full page loader with centered positioning
 */
export function FullPageLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Loader size="lg" />
    </div>
  );
}
