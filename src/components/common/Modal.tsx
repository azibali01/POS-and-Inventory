import { Modal as MantineModal, type ModalProps as MantineModalProps } from "@mantine/core";
import type { ReactNode } from "react";

/**
 * Custom Modal component wrapping Mantine Modal
 * Provides consistent styling and behavior for modals/dialogs
 */

export interface ModalProps extends Omit<MantineModalProps, 'children'> {
  /** Whether modal is open */
  opened: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Modal size */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full" | string | number;
  /** Center modal vertically */
  centered?: boolean;
  /** Close on click outside */
  closeOnClickOutside?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show close button */
  withCloseButton?: boolean;
  /** Modal children */
  children: ReactNode;
}

/**
 * Common Modal component
 * 
 * @example
 * ```tsx
 * <Modal 
 *   opened={isOpen} 
 *   onClose={handleClose}
 *   title="Edit Customer"
 *   size="md"
 * >
 *   <CustomerForm onSubmit={handleSubmit} />
 * </Modal>
 * ```
 */
export function Modal({
  opened,
  onClose,
  title,
  size = "md",
  centered = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withCloseButton = true,
  children,
  ...props
}: ModalProps) {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      centered={centered}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      withCloseButton={withCloseButton}
      {...props}
    >
      {children}
    </MantineModal>
  );
}
