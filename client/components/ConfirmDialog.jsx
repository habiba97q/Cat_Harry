"use client";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md space-y-5 rounded-2xl bg-base-100 p-6 shadow-2xl"
      >
        <div>
          <h2 id="confirm-dialog-title" className="text-xl font-bold">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Keep</button>
          <button type="button" className="btn btn-error" onClick={onConfirm} disabled={busy}>
            {busy ? <span className="loading loading-spinner loading-sm" /> : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
