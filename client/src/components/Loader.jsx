export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>{label}</p>
      </div>
    </div>
  );
}