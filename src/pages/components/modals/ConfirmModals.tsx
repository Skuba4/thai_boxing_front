import type { ConfirmDeleteApplicationModalProps, ConfirmDeleteRoomModalProps, UnsavedChangesModalProps } from "../../homePanelTypes";
import type { ReactNode } from "react";
import { Modal, ModalActions, SubmitButton } from "./Modal";

function ConfirmShell({
  className = "",
  children,
  submitState,
  onCancel,
}: {
  className?: string;
  children: ReactNode;
  submitState: "idle" | "loading" | "success" | "error";
  onCancel: () => void;
}) {
  return (
    <Modal
      className={`modal-window-small modal-window-centered ${className}`.trim()}
      closeDisabled={submitState === "loading"}
      onClose={onCancel}
    >
      {children}
    </Modal>
  );
}

export function ConfirmDeleteRoomModal({
  roomName,
  submitState,
  onCancel,
  onConfirm,
}: ConfirmDeleteRoomModalProps) {
  return (
    <ConfirmShell submitState={submitState} onCancel={onCancel}>
        <h3>Удалить соревнование?</h3>
        <p className="modal-text">
          Ты собираешься удалить соревнование <strong>{roomName}</strong>.
        </p>
        <p className="modal-text">
          Вместе с ним исчезнут связанные данные. Отменить это действие потом нельзя.
        </p>
        <ModalActions>
            <button
              type="button"
              className="outline-button"
              onClick={onCancel}
              disabled={submitState === "loading"}
            >
              Отмена
            </button>
          <SubmitButton type="button" className="danger-button" loading={submitState === "loading"} loadingText="Удаляем..." onClick={onConfirm}>
            Да, удалить
          </SubmitButton>
        </ModalActions>
    </ConfirmShell>
  );
}

export function ConfirmDeleteApplicationModal({
  title = "Удалить заявку?",
  description = "Это удалит заявку без возможности восстановления.",
  descriptionClassName = "modal-text",
  className = "",
  content,
  confirmLabel = "Да, удалить",
  confirmButtonClassName = "danger-button",
  showCancelButton = true,
  submitState,
  onCancel,
  onConfirm,
}: ConfirmDeleteApplicationModalProps) {
  return (
    <ConfirmShell
      className={`${content ? "modal-window-confirm" : ""} ${className}`.trim()}
      submitState={submitState}
      onCancel={onCancel}
    >
        {title ? <h3>{title}</h3> : null}
        {description ? <p className={descriptionClassName}>{description}</p> : null}
        {content}
        <ModalActions>
          {showCancelButton ? (
            <button
              type="button"
              className="outline-button"
              onClick={onCancel}
              disabled={submitState === "loading"}
            >
              Отмена
            </button>
          ) : null}
          <SubmitButton type="button" className={confirmButtonClassName} loading={submitState === "loading"} loadingText="Обрабатываем..." onClick={onConfirm}>
            {confirmLabel}
          </SubmitButton>
        </ModalActions>
    </ConfirmShell>
  );
}

export function UnsavedChangesModal({
  submitState,
  onCancel,
  onSave,
  onReset,
}: UnsavedChangesModalProps) {
  return (
    <ConfirmShell submitState={submitState} onCancel={onCancel}>
        <h3>Есть несохраненные изменения</h3>
        <ModalActions>
          <SubmitButton type="button" className="sync-button" loading={submitState === "loading"} onClick={onSave}>
            Сохранить
          </SubmitButton>
          <button
            type="button"
            className="danger-button"
            onClick={onReset}
            disabled={submitState === "loading"}
          >
            Сбросить
          </button>
        </ModalActions>
    </ConfirmShell>
  );
}
