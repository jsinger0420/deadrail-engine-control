export default function Controls({ sendCmd }) {
  return (
    <div className="controls">
      <button onClick={() => sendCmd("START")}>Start</button>
      <button onClick={() => sendCmd("STOP")}>Stop</button>

      <button onClick={() => sendCmd("INC")}>Speed +</button>
      <button onClick={() => sendCmd("DEC")}>Speed -</button>

      <button onClick={() => sendCmd("FORWARD")}>Forward</button>
      <button onClick={() => sendCmd("REVERSE")}>Reverse</button>

      <button className="shutdown" onClick={() => sendCmd("SHUTDOWN")}>
        Shutdown
      </button>
    </div>
  );
}
