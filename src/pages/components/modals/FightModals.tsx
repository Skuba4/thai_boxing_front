import type { FightModalProps, FightNotesModalProps } from "../../homePanelTypes";
import { FormModal, Modal, ModalActions, SubmitButton } from "./Modal";
import { JudgeNoteSheet } from "./JudgeNoteSheet";

export function FightModal({
  fightForm,
  selectedBoxers,
  availableRings,
  submitState,
  title = "Новая пара",
  submitLabel = "Создать",
  onClose,
  onFieldChange,
  onSubmit,
}: FightModalProps) {
  return (
    <FormModal
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
    >
          <label className="field">
            <span>Ринг</span>
            <select
              value={fightForm.ring}
              onChange={(event) => onFieldChange("ring", event.target.value)}
            >
              {availableRings.map((ring) => (
                <option key={ring.name} value={ring.name}>
                  {ring.name}
                </option>
              ))}
            </select>
          </label>

          <div className="fight-preview">
            <div className="fight-preview-corner fight-preview-corner-red">
              <span>Красный угол</span>
              <strong>{selectedBoxers[0] ? `${selectedBoxers[0].last_name} ${selectedBoxers[0].first_name}` : "-"}</strong>
            </div>
            <div className="fight-preview-corner fight-preview-corner-blue">
              <span>Синий угол</span>
              <strong>{selectedBoxers[1] ? `${selectedBoxers[1].last_name} ${selectedBoxers[1].first_name}` : "-"}</strong>
            </div>
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
            <SubmitButton loading={submitState === "loading"} disabled={availableRings.length === 0 || selectedBoxers.length !== 2}>
              {submitLabel}
            </SubmitButton>
          </ModalActions>
    </FormModal>
  );
}

export function FightNotesModal({
  notes,
  gridName,
  redName,
  blueName,
  fightNumber,
  submitState,
  onClose,
}: FightNotesModalProps) {
  const rounds: Array<{ key: "1" | "2" | "3"; label: string }> = [
    { key: "1", label: "Раунд 1" },
    { key: "2", label: "Раунд 2" },
    { key: "3", label: "Раунд 3" },
  ];

  return (
    <Modal
      className="modal-window-fight-notes"
      closeDisabled={submitState === "loading"}
      onClose={onClose}
    >
        {submitState === "loading" ? <p className="modal-text">Загрузка...</p> : null}

        <div className="fight-notes-rounds">
          {rounds.map((round) => {
            const roundNotes = notes.filter((note) => note.round === round.key);

            return (
              <section key={round.key} className="fight-notes-round-section">
                <h4>{round.label}</h4>
                <div className="fight-notes-round-grid">
                  {[0, 1, 2].map((index) => (
                    <article key={`${round.key}-${index}`} className="fight-note-card">
                      <span className="fight-note-card-label">Судья {index + 1}</span>
                      <div className="fight-note-card-body">
                        {roundNotes[index] ? (
                          <JudgeNoteSheet
                            fightNumber={fightNumber}
                            gridName={gridName}
                            redName={redName}
                            blueName={blueName}
                            roundLabel={round.key}
                            redRemark={roundNotes[index].red_remark || ""}
                            blueRemark={roundNotes[index].blue_remark || ""}
                          />
                        ) : (
                          <div className="fight-note-placeholder fight-note-placeholder-empty">
                            <span>Записка еще не пришла.</span>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
    </Modal>
  );
}

export function SideJudgeNoteModal({
  blueName,
  blueRemark,
  fightNumber,
  gridName,
  redName,
  redRemark,
  roundLabel,
  submitState,
  onBlueRemarkChange,
  onClose,
  onRedRemarkChange,
  onSubmit,
}: {
  blueName: string;
  blueRemark: string;
  fightNumber: number | null;
  gridName: string;
  redName: string;
  redRemark: string;
  roundLabel: string;
  submitState: "idle" | "loading" | "success" | "error";
  onBlueRemarkChange: (value: string) => void;
  onClose: () => void;
  onRedRemarkChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Modal className="modal-window-side-note" closeDisabled={submitState === "loading"} onClose={onClose}>
      <div className="side-judge-note-wrap">
        <JudgeNoteSheet
          fightNumber={fightNumber}
          gridName={gridName}
          redName={redName}
          blueName={blueName}
          roundLabel={roundLabel}
          redRemark={redRemark}
          blueRemark={blueRemark}
          editableRemarks
          onRedRemarkChange={onRedRemarkChange}
          onBlueRemarkChange={onBlueRemarkChange}
        />
      </div>
      <ModalActions>
        <SubmitButton type="button" className="sync-button" loading={submitState === "loading"} loadingText="Отправка..." onClick={onSubmit}>
          Отправить
        </SubmitButton>
      </ModalActions>
    </Modal>
  );
}
