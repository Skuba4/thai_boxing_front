import type { CreateRoomModalProps, RoomSettingsModalProps } from "../../homePanelTypes";
import { RingsTab } from "../../room/tabs/RingsTab";
import { RoomApplicationBoxersTable } from "./BoxerModals";
import { FormModal, Modal, ModalActions, SubmitButton } from "./Modal";

export function CreateRoomModal({
  submitState,
  roomForm,
  title,
  submitLabel,
  showStatus = true,
  onClose,
  onSubmit,
  onRoomFormChange,
}: CreateRoomModalProps) {
  return (
    <FormModal
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formClassName="room-create-form modal-form room-create-form-edit"
    >
          <div className="field">
            <span>Название</span>
            <input
              type="text"
              maxLength={30}
              value={roomForm.name}
              onChange={(event) => onRoomFormChange("name", event.target.value.slice(0, 30))}
              placeholder="Название соревнования"
            />
          </div>
          <div className="field">
            <span>Описание</span>
            <input
              type="text"
              maxLength={50}
              value={roomForm.description}
              onChange={(event) => onRoomFormChange("description", event.target.value.slice(0, 50))}
              placeholder="Короткое описание"
            />
          </div>
          <div className="field-grid room-form-grid">
            <label className="field">
              <span>Дата начала</span>
              <input
                type="date"
                value={roomForm.start_date}
                onChange={(event) => onRoomFormChange("start_date", event.target.value)}
              />
            </label>
            {showStatus ? (
              <label className="field">
                <span>Статус</span>
                <select
                  value={roomForm.status}
                  onChange={(event) => onRoomFormChange("status", event.target.value as "0" | "Y" | "N")}
                >
                  <option value="0">Подготовка</option>
                  <option value="Y">Активно</option>
                  <option value="N">Завершено</option>
                </select>
              </label>
            ) : null}
          </div>
          <ModalActions centered>
            <SubmitButton loading={submitState === "loading"} disabled={!roomForm.name || !roomForm.start_date}>
              {submitLabel}
            </SubmitButton>
          </ModalActions>
    </FormModal>
  );
}

export function RoomSettingsModal({
  activeSettingsTab,
  applicationBoxers,
  deleteRoomState,
  roomForm,
  rings,
  ringsState,
  updateRoomState,
  onClose,
  onDeleteRoom,
  onEditRing,
  onOwnerBoxersClear,
  onOwnerBoxerToggle,
  onOwnerBoxersSubmit,
  onRoomFormChange,
  onRoomSubmit,
  onSettingsTabChange,
  selectedApplicationBoxerIds,
  submitState,
  onToggleRing,
}: RoomSettingsModalProps) {
  return (
    <Modal className="modal-window-room-settings" onClose={onClose}>
      <div className="room-settings-modal">
        <div className="room-settings-modal-header">
          <div>
            <h3>Настройки комнаты</h3>
          </div>
        </div>

        <div className="room-settings-tabs">
          <button
            type="button"
            className={activeSettingsTab === "room" ? "room-settings-tab room-settings-tab-active" : "room-settings-tab"}
            onClick={() => onSettingsTabChange("room")}
          >
            Соревнование
          </button>
          <button
            type="button"
            className={activeSettingsTab === "rings" ? "room-settings-tab room-settings-tab-active" : "room-settings-tab"}
            onClick={() => onSettingsTabChange("rings")}
          >
            Ринги
          </button>
          <button
            type="button"
            className={activeSettingsTab === "owner-boxers" ? "room-settings-tab room-settings-tab-active" : "room-settings-tab"}
            onClick={() => onSettingsTabChange("owner-boxers")}
          >
            Мои участники
          </button>
        </div>

        {activeSettingsTab === "room" ? (
          <form className="modal-form room-settings-form" onSubmit={onRoomSubmit}>
            <div className="field">
              <span>Название</span>
              <input
                type="text"
                maxLength={30}
                value={roomForm.name}
                onChange={(event) => onRoomFormChange("name", event.target.value.slice(0, 30))}
                placeholder="Название соревнования"
              />
            </div>
            <div className="field">
              <span>Описание</span>
              <input
                type="text"
                maxLength={50}
                value={roomForm.description}
                onChange={(event) => onRoomFormChange("description", event.target.value.slice(0, 50))}
                placeholder="Короткое описание"
              />
            </div>
            <div className="field-grid room-settings-form-grid">
              <label className="field">
                <span>Дата начала</span>
                <input
                  type="date"
                  value={roomForm.start_date}
                  onChange={(event) => onRoomFormChange("start_date", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Статус</span>
                <select
                  value={roomForm.status}
                  onChange={(event) => onRoomFormChange("status", event.target.value as "0" | "Y" | "N")}
                >
                  <option value="0">Подготовка</option>
                  <option value="Y">Активно</option>
                  <option value="N">Завершено</option>
                </select>
              </label>
            </div>

            <div className="room-settings-danger-zone">
            <div>
              <h4>Безвозвратно удалить комнату?</h4>
            </div>
            <button
              type="button"
              className="danger-button"
              disabled={deleteRoomState === "loading"}
              onClick={onDeleteRoom}
            >
              {deleteRoomState === "loading" ? "Удаляем..." : "Удалить"}
            </button>
          </div>

            <ModalActions centered>
              <SubmitButton loading={updateRoomState === "loading"} disabled={!roomForm.name || !roomForm.start_date}>
                Сохранить
              </SubmitButton>
              <button type="button" className="outline-button" onClick={onClose}>
                Закрыть
              </button>
            </ModalActions>
          </form>
        ) : activeSettingsTab === "rings" ? (
          <section className="room-settings-rings-panel">
            <RingsTab
              activeRings={rings.filter((ring) => ring.status !== "N")}
              inactiveRings={rings.filter((ring) => ring.status === "N")}
              ringsState={ringsState}
              canEdit
              settingsOnly
              onEditRing={onEditRing}
              onOpenRing={() => {}}
              onToggleRing={onToggleRing}
            />
            <ModalActions centered>
              <button type="button" className="outline-button" onClick={onClose}>
                Закрыть
              </button>
            </ModalActions>
          </section>
        ) : (
          <section className="room-settings-rings-panel">
            <form className="modal-form room-settings-owner-boxers-form" onSubmit={onOwnerBoxersSubmit}>
              <RoomApplicationBoxersTable
                boxers={applicationBoxers}
                selectedBoxerIds={selectedApplicationBoxerIds}
                submitState={submitState}
                onToggleBoxer={onOwnerBoxerToggle}
              />
            <ModalActions centered>
              <button type="button" className="danger-button" onClick={onOwnerBoxersClear}>
                Очистить список
              </button>
              <SubmitButton loading={submitState === "loading"} disabled={selectedApplicationBoxerIds.length === 0}>
                Сохранить
              </SubmitButton>
              <button type="button" className="outline-button" onClick={onClose}>
                Закрыть
              </button>
            </ModalActions>
            </form>
          </section>
        )}
      </div>
    </Modal>
  );
}
