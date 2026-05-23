import type { RingModalProps } from "../../homePanelTypes";
import { FormModal, ModalActions, SubmitButton } from "./Modal";

function getRingLabel(name: string) {
  return name.startsWith("Ринг") ? name : `Ринг ${name}`;
}

export function RingModal({
  ring,
  ringForm,
  submitState,
  onClose,
  onFieldChange,
  onSubmit,
}: RingModalProps) {
  return (
    <FormModal
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
          <div className="field">
            <span>{`Описание (${getRingLabel(ring.name)})`}</span>
            <input
              type="text"
              maxLength={20}
              value={ringForm.description}
              onChange={(event) =>
                onFieldChange(
                  "description",
                  event.target.value.slice(0, 20),
                )
              }
              placeholder="Описание ринга"
            />
          </div>

          <ModalActions>
            <button
              type="button"
              className="outline-button"
              onClick={onClose}
              disabled={submitState === "loading"}
            >
              Отмена
            </button>
            <SubmitButton loading={submitState === "loading"}>Сохранить</SubmitButton>
          </ModalActions>
    </FormModal>
  );
}
