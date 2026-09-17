import { useState, useRef } from "react";
import {
  RX_UUID,
  TX_UUID,
  STATUS_UUID,
  SERVICE_UUID
} from "./ble";
import Controls from "./components/Controls";
import StatusPanel from "./components/StatusPanel";
import "./App.css";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState({ speed: 0, direction: "stopped" });
  const [log, setLog] = useState([]);

  const deviceRef = useRef(null);
  const rxRef = useRef(null);

  const appendLog = (msg) => setLog((prev) => [...prev, msg]);

  // Safe JSON decoder
  const decodeJSON = (value) => {
    const text = new TextDecoder().decode(value);
    try {
      return JSON.parse(text);
    } catch {
      appendLog("Non‑JSON message: " + text);
      return null;
    }
  };

  const connect = async () => {
    try {
      appendLog("Requesting BLE device…");

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID]   // MUST match getPrimaryService()
      });

      deviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        appendLog("Disconnected");
        setConnected(false);
      });

      const server = await device.gatt.connect();
      appendLog("Connected to GATT server");

      const service = await server.getPrimaryService(SERVICE_UUID);
      appendLog("Primary service found");

      // RX (write)
      rxRef.current = await service.getCharacteristic(RX_UUID);

      // TX (notify)
      const txChar = await service.getCharacteristic(TX_UUID);
      await txChar.startNotifications();
      txChar.addEventListener("characteristicvaluechanged", (e) => {
        const text = new TextDecoder().decode(e.target.value);
        appendLog("TX: " + text);
      });

      // STATUS (read + notify)
      const statusChar = await service.getCharacteristic(STATUS_UUID);

      // Initial read (may be empty)
      const initial = await statusChar.readValue();
      const parsed = decodeJSON(initial);
      if (parsed) setStatus(parsed);

      await statusChar.startNotifications();
      statusChar.addEventListener("characteristicvaluechanged", (e) => {
        const parsed = decodeJSON(e.target.value);
        if (parsed) setStatus(parsed);
      });

      setConnected(true);
      appendLog("Connected to Engine-Control");
    } catch (err) {
      appendLog("Error: " + err);
    }
  };

  const sendCmd = async (cmd) => {
    if (!rxRef.current) return;
    appendLog("CMD: " + cmd);
    await rxRef.current.writeValue(new TextEncoder().encode(cmd));
  };

  return (
    <div className="app">
      <h1>Engine Controller</h1>

      {!connected && (
        <button className="connect-btn" onClick={connect}>
          Connect to Engine
        </button>
      )}

      {connected && (
        <>
          <StatusPanel status={status} />
          <Controls sendCmd={sendCmd} />
        </>
      )}

      <div className="log">
        <h3>Log</h3>
        <pre>{log.join("\n")}</pre>
      </div>
    </div>
  );
}
