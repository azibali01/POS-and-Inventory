// Add route to Payment Voucher page in Accounts section

import { lazy } from "react";

const PaymentVoucher = lazy(() => import("./PaymentVoucher"));

export default [
  // ...existing routes
  {
    path: "/accounts/payment-voucher",
    element: <PaymentVoucher />,
  },
];
