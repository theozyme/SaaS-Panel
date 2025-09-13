export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card w-[560px] max-w-[94vw]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn btn-ghost" onClick={onClose}>Kapat</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
