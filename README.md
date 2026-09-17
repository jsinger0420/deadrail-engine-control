# Deadrail Engine Control

A web-based remote control for a "deadrail" (battery-powered, DCC-free) model train engine. It connects directly to the engine's onboard controller over Bluetooth Low Energy (BLE) using the Web Bluetooth API — no app install required, just a browser.

## Features

- **Wireless control** over BLE — start/stop, speed up/down, direction, and emergency shutdown
- **Live status** display (speed and direction) via BLE notifications
- **Connection log** showing BLE events and raw TX messages for debugging

## Tech Stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) for dev server and bundling
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) for BLE communication (no external BLE libraries)

## Prerequisites

- Node.js and npm
- A browser with Web Bluetooth support (Chrome or Edge on desktop/Android). Web Bluetooth is **not** supported in Safari or Firefox.
- Web Bluetooth requires a secure context — `localhost` works for local dev, otherwise the app must be served over HTTPS (e.g. the Vercel deployment).
- An engine controller advertising a BLE GATT service with the UUIDs below.

## Getting Started

```bash
npm install
npm run dev
```

Then open the dev server URL in a supported browser, click **Connect to Engine**, and select your device from the browser's Bluetooth pairing prompt.

Other scripts:

```bash
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## BLE Protocol

The app expects a GATT service (a Nordic UART Service-style UUID) exposing three characteristics, defined in [src/ble.js](src/ble.js):

| Characteristic | UUID                                   | Direction         | Purpose                          |
| --------------- | -------------------------------------- | ------------------ | --------------------------------- |
| RX              | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` | App → Engine       | Write plain-text commands         |
| TX              | `6e400003-b5a3-f393-e0a9-e50e24dcca9e` | Engine → App       | Notify with debug/log text        |
| STATUS          | `6e400004-b5a3-f393-e0a9-e50e24dcca9e` | Engine → App       | Read/notify JSON `{ speed, direction }` |

Commands sent on RX (see [src/components/Controls.jsx](src/components/Controls.jsx)):

- `START` / `STOP`
- `INC` / `DEC` (speed step up/down)
- `FORWARD` / `REVERSE`
- `SHUTDOWN`

## Project Structure

```
src/
  App.jsx                    # BLE connection lifecycle and top-level layout
  ble.js                     # GATT service/characteristic UUIDs
  components/
    Controls.jsx             # Command buttons
    StatusPanel.jsx          # Live speed/direction display
```

## Deployment

This project is configured for [Vercel](https://vercel.com/) (see `.vercel/`). Since Web Bluetooth requires HTTPS, deploying to Vercel (or any HTTPS host) is required for use outside of `localhost`.

## Further Reading

- [The Hidden Quirks of Web Bluetooth on the Raspberry Pi Pico](https://singerlinks.com/2026/06/the-hidden-quirks-of-web-bluetooth-on-the-raspberry-pi-pico/) — gotchas encountered when implementing the BLE peripheral side on a Pico, relevant if the engine controller is Pico-based.
