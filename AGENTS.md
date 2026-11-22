# Repository Guidelines

## Stack

ShopLedger uses Node.js with CommonJS modules and Express 4. The browser UI is plain HTML, CSS, and JavaScript. Application records are stored in `data/db.json`.

## Module Map

- `server.js` initializes Express, serves `public/`, and mounts the routers.
- `routes/` contains the products, orders, customers, and reports APIs.
- `lib/` contains business logic: pricing, tax, coupons, inventory, orders, ledger, reports, invoices, dates, and JSON storage.
- `public/` contains the UI (`index.html`, `js/app.js`, and `css/style.css`).
- `config.js` contains shop, tax, coupon, inventory, and port settings.
- `data/db.json` contains products, customers, orders, settlements, and audit records.

## Commands

- `npm start` starts the app with `node server.js`; the default port is 3000 and can be changed with `PORT`.
- `npm test` currently prints “Error: no test specified” and exits unsuccessfully. No test framework or build command is configured.

## Change Rules

- Before changing behavior, write characterization tests that capture the current behavior.
- Change only the module the ticket is about. Avoid unrelated cleanup or edits elsewhere.
- Tests must never read from or write to `data/db.json`; use isolated test data.
- Do not add dependencies.

