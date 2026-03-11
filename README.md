# POS and Inventory Frontend

React, TypeScript, Vite, Mantine, and React Query frontend for the 7 Star Traders POS and inventory workflow.

## Core Features

- Sales invoices, quotations, sale returns, and draft restore
- Purchase orders, purchase invoices, GRNs, and purchase returns
- Products, categories, colors, stock reporting, and inventory views
- Customers, suppliers, expenses, payment vouchers, and receipt vouchers
- Authenticated cashier shift flow backed by `GET /session/active`, `POST /session/open`, and `POST /session/close`

## Local Development

```bash
npm install
npm run dev
```

Default local frontend URL: `http://localhost:5173`

## Environment Variables

Create a `.env` file in this folder when you need to override defaults.

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=7 Star Traders
VITE_APP_VERSION=1.0.0
```

Notes:

- `VITE_API_URL` should point to the Nest backend base URL.
- If `VITE_API_URL` is omitted, development defaults to `http://localhost:3000`.
- Production builds fall back to the hardcoded deployed API URL from `src/lib/env.ts`, but setting `VITE_API_URL` explicitly is safer.

## Production Build

```bash
npm install
npm run build
npm run preview
```

The build output is written to `dist/`.

## Production Setup

1. Set `VITE_API_URL` to the public backend origin.
2. Build with `npm run build`.
3. Deploy the `dist/` directory to your static host.
4. Make sure the backend `ALLOWED_ORIGINS` includes the deployed frontend origin.

## Recommended Deployment Checks

- Log in with a seeded or bootstrap admin account.
- Verify sales invoice creation is blocked until a shift is opened.
- Verify receipt voucher and sale return routes resolve correctly.
- Verify paginated sales, purchase invoices, and product lists load from the backend.
