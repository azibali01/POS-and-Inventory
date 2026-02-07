import { Modal, Text, Group, Button } from "@mantine/core";

/**
 * Confirmation Dialog component
 * Provides a simple yes/no confirmation dialog
 */

export interface ConfirmDialogProps {
  /** Whether dialog is open */
  opened: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Dialog title */
  title?: string;
  /** Confirmation message */
  message: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm button color */
  confirmColor?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * ConfirmDialog component for confirmation prompts
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   opened={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Customer"
 *   message="Are you sure you want to delete this customer?"
 *   confirmLabel="Delete"
 *   confirmColor="red"
 * />
 * ```
 */
export function ConfirmDialog({
  opened,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "blue",
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size="sm"
    >
      <Text size="sm" mb="lg">
        {message}
      </Text>
      <Group justify="flex-end">
        <Button variant="subtle" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          color={confirmColor}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
