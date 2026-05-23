/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import type { ReactNode } from "react";

export function useModalEscape(onClose: () => void, disabled = false) {
  useEffect(() => {
    if (disabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onClose]);
}

export function Modal({
  children,
  className = "",
  closeDisabled = false,
  onClose,
}: {
  children: ReactNode;
  className?: string;
  closeDisabled?: boolean;
  onClose: () => void;
}) {
  useModalEscape(onClose, closeDisabled);

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!closeDisabled) {
          onClose();
        }
      }}
    >
      <div
        className={`modal-window ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalActions({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={`profile-actions${centered ? " profile-actions-center" : ""}`}>
      {children}
    </div>
  );
}

export function SubmitButton({
  children,
  className,
  disabled = false,
  loading,
  loadingText = "Сохраняем...",
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading: boolean;
  loadingText?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      className={className}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? loadingText : children}
    </button>
  );
}

export function FormModal({
  children,
  className,
  closeDisabled,
  formClassName = "modal-form",
  title,
  onClose,
  onSubmit,
}: {
  children: ReactNode;
  className?: string;
  closeDisabled: boolean;
  formClassName?: string;
  title?: ReactNode;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal className={className} closeDisabled={closeDisabled} onClose={onClose}>
      {title ? <h3>{title}</h3> : null}
      <form className={formClassName} onSubmit={onSubmit}>
        {children}
      </form>
    </Modal>
  );
}
