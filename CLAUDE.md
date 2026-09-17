# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server with HMR
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint (flat config, eslint.config.js)
```

There is no test suite in this project.

## Architecture

This is a React + Vite single-page app that acts as a **Web Bluetooth (BLE) remote control** for a "deadrail" (battery-powered, DCC-free) model train engine — the browser talks directly to the engine's onboard BLE controller, no backend/server involved.

- **`src/ble.js`** — the GATT service and characteristic UUIDs the app expects the engine controller to expose (Nordic UART Service-style layout): `SERVICE_UUID`, `RX_UUID` (write commands), `TX_UUID` (notify, debug text), `STATUS_UUID` (read/notify JSON status). Changing the peripheral's firmware UUIDs means updating this file.
- **`src/App.jsx`** — owns the entire BLE connection lifecycle: `navigator.bluetooth.requestDevice` → GATT connect → resolve the three characteristics → subscribe to notifications. Connection state (`connected`), live `status` (`{ speed, direction }`), and a scrolling event `log` all live here as top-level state and are passed down as props; there is no state management library. `sendCmd` writes plain-text command strings to the RX characteristic.
- **`src/components/Controls.jsx`** — buttons that call `sendCmd` with the fixed command vocabulary: `START`, `STOP`, `INC`, `DEC`, `FORWARD`, `REVERSE`, `SHUTDOWN`. Adding a new command means adding it here and handling it in the firmware — there's no shared constant/enum for command strings.
- **`src/components/StatusPanel.jsx`** — presentational display of the current `status` object.

### Web Bluetooth constraints (important when changing connection logic)

- Only Chromium-based browsers (Chrome, Edge) support the Web Bluetooth API — Safari and Firefox do not.
- The API requires a secure context: `localhost` works for dev, otherwise HTTPS is required (the deployed Vercel URL satisfies this).
- BLE behavior cannot be exercised or verified by running code alone — testing a change to the connection/characteristic logic requires an actual paired engine controller and a supported browser.
- See the linked blog post in `README.md` for known Web Bluetooth quirks specific to Raspberry Pi Pico peripherals, relevant if the engine controller firmware runs on a Pico.

## Deployment

Configured for Vercel (see `.vercel/`). `.env.local` holds Vercel CLI state, not app config — there are no app-specific environment variables currently.
