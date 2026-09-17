export default function StatusPanel({ status }) {
  return (
    <div className="status-panel">
      <h2>Status</h2>
      <p><strong>Speed:</strong> {status.speed}%</p>
      <p><strong>Direction:</strong> {status.direction}</p>
    </div>
  );
}
