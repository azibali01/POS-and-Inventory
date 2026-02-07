import { useState, useCallback } from "react";

/**
 * Custom hook for managing modal state
 * Provides open/close/toggle functionality
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Custom hook for managing confirmation dialogs
 * Handles confirmation state with callback execution
 */
export function useConfirmation<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    message: string;
    onConfirm: () => void;
    data?: T;
  } | null>(null);

  const confirm = useCallback(
    (message: string, onConfirm: () => void, data?: T) => {
      setPendingAction({ message, onConfirm, data });
      setIsOpen(true);
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (pendingAction) {
      pendingAction.onConfirm();
    }
    setIsOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isOpen,
    message: pendingAction?.message || "",
    data: pendingAction?.data,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
