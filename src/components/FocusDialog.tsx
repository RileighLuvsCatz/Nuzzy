import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
export default function FocusDialog({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = old;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  function finish() {
    (document.activeElement as HTMLElement | null)?.blur();
    onClose();
  }
  return (
    <dialog
      ref={ref}
      className="tracker-focus"
      onCancel={(event) => {
        event.preventDefault();
        finish();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          finish();
      }}
      aria-labelledby="focus-title"
    >
      <header className="focus-heading">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2 id="focus-title">{title}</h2>
        </div>
        <button
          type="button"
          className="focus-close"
          aria-label="Close details"
          onClick={finish}
          autoFocus
        >
          ×
        </button>
      </header>
      <div className="focus-content">{children}</div>
    </dialog>
  );
}
