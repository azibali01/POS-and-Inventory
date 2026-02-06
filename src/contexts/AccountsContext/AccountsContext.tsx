/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { createContext, useState, useCallback, useRef } from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../lib/api";
import { ensureArray } from "../../lib/api-response-utils";
import { logger } from "../../lib/logger";
import type {
  ReceiptVoucher,
  PaymentVoucher,
  AccountsContextType,
} from "./types";

const AccountsContext = createContext<AccountsContextType | undefined>(
  undefined
);

/**
 * Accounts Context Provider
 *
 * Manages state for:
 * - Receipt Vouchers
 * - Payment Vouchers
 */
export function AccountsProvider({ children }: { children: React.ReactNode }) {
  // Receipt Vouchers State
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>([]);
  const [receiptVouchersLoading, setReceiptVouchersLoading] = useState(false);
  const [receiptVouchersError, setReceiptVouchersError] = useState<
    string | null
  >(null);

  // Payment Vouchers State
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
  const [paymentVouchersLoading, setPaymentVouchersLoading] = useState(false);
  const [paymentVouchersError, setPaymentVouchersError] = useState<
    string | null
  >(null);

  // Refs to track loading promises
  const receiptVouchersPromiseRef = useRef<Promise<ReceiptVoucher[]> | null>(
    null
  );
  const paymentVouchersPromiseRef = useRef<Promise<PaymentVoucher[]> | null>(
    null
  );

  /**
   * Load Receipt Vouchers
   */
  const loadReceiptVouchers = useCallback(async (): Promise<
    ReceiptVoucher[]
  > => {
    if (receiptVouchersPromiseRef.current) {
      return receiptVouchersPromiseRef.current;
    }

    setReceiptVouchersLoading(true);
    setReceiptVouchersError(null);

    const promise = api
      .getAllReceiptVouchers()
      .then((data) => {
        const validated = ensureArray<ReceiptVoucher>(data, "receipt vouchers");
        setReceiptVouchers(validated);
        setReceiptVouchersLoading(false);
        logger.log("Receipt vouchers loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load receipt vouchers";
        setReceiptVouchersError(message);
        setReceiptVouchersLoading(false);
        logger.error("Failed to load receipt vouchers:", error);
        showNotification({
          title: "Error",
          message: "Failed to load receipt vouchers",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        receiptVouchersPromiseRef.current = null;
      });

    receiptVouchersPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Payment Vouchers
   */
  const loadPaymentVouchers = useCallback(async (): Promise<
    PaymentVoucher[]
  > => {
    if (paymentVouchersPromiseRef.current) {
      return paymentVouchersPromiseRef.current;
    }

    setPaymentVouchersLoading(true);
    setPaymentVouchersError(null);

    const promise = api
      .getAllPaymentVouchers()
      .then((data) => {
        const validated = ensureArray<PaymentVoucher>(data, "payment vouchers");
        setPaymentVouchers(validated);
        setPaymentVouchersLoading(false);
        logger.log("Payment vouchers loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load payment vouchers";
        setPaymentVouchersError(message);
        setPaymentVouchersLoading(false);
        logger.error("Failed to load payment vouchers:", error);
        showNotification({
          title: "Error",
          message: "Failed to load payment vouchers",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        paymentVouchersPromiseRef.current = null;
      });

    paymentVouchersPromiseRef.current = promise;
    return promise;
  }, []);

  const value: AccountsContextType = {
    receiptVouchers,
    receiptVouchersLoading,
    receiptVouchersError,
    setReceiptVouchers,
    loadReceiptVouchers,

    paymentVouchers,
    paymentVouchersLoading,
    paymentVouchersError,
    setPaymentVouchers,
    loadPaymentVouchers,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

/**
 * Hook to use Accounts Context
 */
export function useAccounts(): AccountsContextType {
  const context = React.useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
}

export { AccountsContext };
export type { ReceiptVoucher, PaymentVoucher };
