import type { BoxerModalProps, RoomApplicationBoxersModalProps, RoomBoxerModalProps } from "../../homePanelTypes";
import type { Boxer } from "../../../features/auth/authApi";
import { formatBoxerDate, getBoxerRankClassName, getBoxerSexLabel, getMaxBoxerBirthDate, isValidBoxerForm, isValidRoomBoxerForm } from "../../homeBoxers";
import { FormModal, ModalActions, SubmitButton } from "./Modal";

export function RoomApplicationBoxersTable({
  boxers,
  selectedBoxerIds,
  submitState,
  onToggleBoxer,
}: {
  boxers: Boxer[];
  selectedBoxerIds: string[];
  submitState: "idle" | "loading" | "success" | "error";
  onToggleBoxer: (boxerUuid: string) => void;
}) {
  return (
    <div className="room-application-boxers-list">
      {boxers.length ? (
        <div className="room-application-boxers-table">
          <div className="room-application-boxers-row room-application-boxers-row-head">
            <span className="room-application-boxers-index-head" aria-hidden="true" />
            <span className="room-application-boxers-select-head" />
            <span>ФИО</span>
            <span>Класс</span>
            <span>Вес</span>
            <span>Дата</span>
            <span>Пол</span>
          </div>

          {boxers.map((boxer: Boxer, index) => {
            const isSelected = selectedBoxerIds.includes(boxer.uuid);

            return (
              <label
                key={boxer.uuid}
                className={`room-application-boxers-row${isSelected ? " room-application-boxers-row-selected" : ""}`}
              >
                <span className="room-application-boxers-index-cell">{index + 1}</span>
                <span className="room-application-boxers-select-cell">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleBoxer(boxer.uuid)}
                    disabled={submitState === "loading"}
                  />
                </span>
                <span className="room-application-boxer-name" title={`${boxer.last_name} ${boxer.first_name}`.trim()}>
                  {`${boxer.last_name} ${boxer.first_name}`.trim()}
                </span>
                <span>
                  <span className={getBoxerRankClassName(boxer.rank)}>{boxer.rank}</span>
                </span>
                <span>{boxer.weight}</span>
                <span>{formatBoxerDate(boxer.birth_date)}</span>
                <span>{getBoxerSexLabel(boxer.sex)}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function BoxerModal({
  boxerForm,
  submitState,
  title,
  submitLabel,
  onClose,
  onFieldChange,
  onSubmit,
}: BoxerModalProps) {
  return (
    <FormModal
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
    >
          <div className="field-grid">
            <label className="field">
              <span>Фамилия</span>
              <input
                type="text"
                maxLength={30}
                value={boxerForm.last_name}
                onChange={(event) => onFieldChange("last_name", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Имя</span>
              <input
                type="text"
                maxLength={30}
                value={boxerForm.first_name}
                onChange={(event) => onFieldChange("first_name", event.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>Отчество, если есть</span>
            <input
              type="text"
              maxLength={30}
              value={boxerForm.middle_name}
              onChange={(event) => onFieldChange("middle_name", event.target.value)}
              placeholder="Необязательно"
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Дата рождения</span>
              <input
                type="date"
                max={getMaxBoxerBirthDate()}
                value={boxerForm.birth_date}
                onChange={(event) => onFieldChange("birth_date", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Пол</span>
              <select
                value={boxerForm.sex}
                onChange={(event) => onFieldChange("sex", event.target.value)}
              >
                <option value="M">Мальчик</option>
                <option value="F">Девочка</option>
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Класс</span>
              <select
                value={boxerForm.rank}
                onChange={(event) => onFieldChange("rank", event.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </label>
            <label className="field">
              <span>Вес</span>
              <input
                type="text"
                inputMode="decimal"
                value={boxerForm.weight}
                onChange={(event) => onFieldChange("weight", event.target.value)}
                placeholder="0.0"
              />
            </label>
          </div>

          <ModalActions centered>
            <SubmitButton loading={submitState === "loading"} disabled={!isValidBoxerForm(boxerForm)}>
              {submitLabel}
            </SubmitButton>
          </ModalActions>
    </FormModal>
  );
}

export function RoomBoxerModal({
  boxerForm,
  submitState,
  title,
  submitLabel,
  onClose,
  onFieldChange,
  onSubmit,
}: RoomBoxerModalProps) {
  return (
    <FormModal
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
    >
          <div className="field-grid">
            <label className="field">
              <span>Фамилия</span>
              <input
                type="text"
                maxLength={30}
                value={boxerForm.last_name}
                onChange={(event) => onFieldChange("last_name", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Имя</span>
              <input
                type="text"
                maxLength={30}
                value={boxerForm.first_name}
                onChange={(event) => onFieldChange("first_name", event.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>Отчество, если есть</span>
            <input
              type="text"
              maxLength={30}
              value={boxerForm.middle_name}
              onChange={(event) => onFieldChange("middle_name", event.target.value)}
              placeholder="Необязательно"
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Возраст</span>
              <input
                type="number"
                min="5"
                value={boxerForm.age}
                onChange={(event) => onFieldChange("age", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Пол</span>
              <select
                value={boxerForm.sex}
                onChange={(event) => onFieldChange("sex", event.target.value)}
              >
                <option value="M">Мальчик</option>
                <option value="F">Девочка</option>
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Класс</span>
              <select
                value={boxerForm.rank}
                onChange={(event) => onFieldChange("rank", event.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </label>
            <label className="field">
              <span>Вес</span>
              <input
                type="text"
                value={boxerForm.weight}
                onChange={(event) => onFieldChange("weight", event.target.value)}
                placeholder="Например, 45.5"
              />
            </label>
          </div>

          <ModalActions centered>
            <SubmitButton loading={submitState === "loading"} disabled={!isValidRoomBoxerForm(boxerForm)}>
              {submitLabel}
            </SubmitButton>
          </ModalActions>
    </FormModal>
  );
}

export function RoomApplicationBoxersModal({
  boxers,
  selectedBoxerIds,
  submitState,
  submitLabel = "Отправить",
  onClose,
  onToggleBoxer,
  onSubmit,
}: RoomApplicationBoxersModalProps) {
  return (
    <FormModal
      className="modal-window-grid modal-window-application-boxers"
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
      formClassName="modal-form modal-form-compact"
    >
          <RoomApplicationBoxersTable
            boxers={boxers}
            selectedBoxerIds={selectedBoxerIds}
            submitState={submitState}
            onToggleBoxer={onToggleBoxer}
          />

          <ModalActions centered>
            <SubmitButton loading={submitState === "loading"} loadingText="Отправляем..." disabled={selectedBoxerIds.length === 0}>
              {submitLabel}
            </SubmitButton>
          </ModalActions>
    </FormModal>
  );
}
