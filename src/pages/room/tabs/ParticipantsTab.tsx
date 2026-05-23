import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { RoomBoxer } from "../../../features/auth/authApi";
import { getBoxerFullName, getBoxerRankClassName, getBoxerSexLabel } from "../../homeBoxers";
import type { RequestState } from "../../homeSharedTypes";
import type { RoomBoxerSortField } from "../types";

type ParticipantsTabProps = {
  activeBoxers: RoomBoxer[];
  boxersState: RequestState;
  canEdit: boolean;
  deleteState: RequestState;
  deletingBoxerId: string | null;
  inactiveBoxers: RoomBoxer[];
  search: string;
  selectedBoxerIds: string[];
  renderSortButton: (field: RoomBoxerSortField, label: string) => ReactNode;
  onBoxerDelete: (boxerUuid: string) => void;
  onBoxerEdit: (boxer: RoomBoxer) => void;
  onGridOpen: () => void;
  onSearchChange: (value: string) => void;
  onToggleBoxer: (boxerUuid: string) => void;
};

export function ParticipantsTab({
  activeBoxers,
  boxersState,
  canEdit,
  deleteState,
  deletingBoxerId,
  inactiveBoxers,
  search,
  selectedBoxerIds,
  renderSortButton,
  onBoxerDelete,
  onBoxerEdit,
  onGridOpen,
  onSearchChange,
  onToggleBoxer,
}: ParticipantsTabProps) {
  return canEdit ? (
    <>
      <div className="room-boxers-toolbar room-boxers-toolbar-sticky">
        <SearchToolbar search={search} onSearchChange={onSearchChange}>
          <button
            type="button"
            className="outline-button"
            disabled={selectedBoxerIds.length === 0}
            onClick={onGridOpen}
          >
            Отправить
          </button>
        </SearchToolbar>
      </div>

      <div className="room-boxers-table">
        <div className="room-boxers-row room-boxers-row-head">
          <span className="room-boxers-index-cell" aria-hidden="true" />
          <span className="room-boxers-select-head" />
          <span>ФИО</span>
          {renderSortButton("rank", "Класс")}
          {renderSortButton("weight", "Вес (кг)")}
          {renderSortButton("age", "Возраст")}
          {renderSortButton("sex", "Пол")}
          {renderSortButton("club", "Клуб")}
          <span className="room-boxers-actions-head" />
        </div>

        {boxersState === "loading" ? <p className="panel-message">Загружаем участников...</p> : null}

        {activeBoxers.map((boxer, index) => (
          <EditableBoxerRow
            key={boxer.uuid}
            boxer={boxer}
            deleteState={deleteState}
            deletingBoxerId={deletingBoxerId}
            index={index + 1}
            selectedBoxerIds={selectedBoxerIds}
            onBoxerDelete={onBoxerDelete}
            onBoxerEdit={onBoxerEdit}
            onToggleBoxer={onToggleBoxer}
          />
        ))}

        {activeBoxers.length && inactiveBoxers.length ? (
          <div className="room-boxers-grid-divider" aria-hidden="true" />
        ) : null}

        {inactiveBoxers.map((boxer, index) => (
          <EditableBoxerRow
            key={boxer.uuid}
            boxer={boxer}
            deleteState={deleteState}
            deletingBoxerId={deletingBoxerId}
            index={activeBoxers.length + index + 1}
            isInactive
            selectedBoxerIds={selectedBoxerIds}
            onBoxerDelete={onBoxerDelete}
            onBoxerEdit={onBoxerEdit}
            onToggleBoxer={onToggleBoxer}
          />
        ))}
      </div>
    </>
  ) : (
    <>
      <div className="room-boxers-table">
        <div className="room-boxers-row room-boxers-row-head room-boxers-row-guest">
          <span className="room-boxers-index-cell" aria-hidden="true" />
          <span>ФИО</span>
          {renderSortButton("rank", "Класс")}
          {renderSortButton("weight", "Вес (кг)")}
          {renderSortButton("age", "Возраст")}
          {renderSortButton("sex", "Пол")}
          {renderSortButton("club", "Клуб")}
        </div>

        {boxersState === "loading" ? <p className="panel-message">Загружаем участников...</p> : null}

        {activeBoxers.map((boxer, index) => (
          <ReadOnlyBoxerRow key={boxer.uuid} boxer={boxer} index={index + 1} />
        ))}

        {activeBoxers.length && inactiveBoxers.length ? (
          <div className="room-boxers-grid-divider" aria-hidden="true" />
        ) : null}

        {inactiveBoxers.map((boxer, index) => (
          <ReadOnlyBoxerRow
            key={boxer.uuid}
            boxer={boxer}
            index={activeBoxers.length + index + 1}
            isInactive
          />
        ))}
      </div>
    </>
  );
}

function SearchToolbar({
  children,
  search,
  onSearchChange,
}: {
  children?: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <>
      <input
        className="boxers-search"
        type="search"
        placeholder="Поиск"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="room-owner-actions">
        {children}
      </div>
    </>
  );
}

function EditableBoxerRow({
  boxer,
  deleteState,
  deletingBoxerId,
  index,
  isInactive = false,
  selectedBoxerIds,
  onBoxerDelete,
  onBoxerEdit,
  onToggleBoxer,
}: {
  boxer: RoomBoxer;
  deleteState: RequestState;
  deletingBoxerId: string | null;
  index: number;
  isInactive?: boolean;
  selectedBoxerIds: string[];
  onBoxerDelete: (boxerUuid: string) => void;
  onBoxerEdit: (boxer: RoomBoxer) => void;
  onToggleBoxer: (boxerUuid: string) => void;
}) {
  const selectionIndex = selectedBoxerIds.indexOf(boxer.uuid) + 1;
  const isSelected = selectionIndex > 0;
  const rowClassName = isInactive
    ? `room-boxers-row room-boxers-row-disabled${isSelected ? " room-boxers-row-selected" : ""}`
    : `room-boxers-row${boxer.is_available ? " room-boxers-row-clickable" : " room-boxers-row-disabled"}${isSelected ? " room-boxers-row-selected" : ""}`;
  const markerClassName = `room-boxers-select-marker${isSelected ? " room-boxers-select-marker-active" : ""}${isSelected && selectionIndex % 2 === 1 ? " room-boxers-select-marker-red" : ""}${isSelected && selectionIndex % 2 === 0 ? " room-boxers-select-marker-blue" : ""}${isInactive || !boxer.is_available ? " room-boxers-select-marker-disabled" : ""}`;
  const isDeleting = deleteState === "loading" && deletingBoxerId === boxer.uuid;
  const canManageBoxer = boxer.is_available;

  return (
    <div
      className={rowClassName}
      onClick={() => onToggleBoxer(boxer.uuid)}
    >
      <span className="room-boxers-index-cell">{index}</span>
      <span className="room-boxers-select-cell">
        <span className={markerClassName} aria-hidden="true">
          {isSelected ? selectionIndex : null}
        </span>
      </span>
      <BoxerCells boxer={boxer} />
      {canManageBoxer ? (
        <div
          className="boxer-inline-actions room-boxers-actions-cell"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="icon-button icon-button-compact icon-button-warm boxer-action-button"
            onClick={() => onBoxerEdit(boxer)}
            aria-label="Редактировать спортсмена"
          >
            <Pencil size={15} strokeWidth={2.1} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button icon-button-compact icon-button-danger boxer-action-button"
            disabled={isDeleting}
            onClick={() => onBoxerDelete(boxer.uuid)}
            aria-label="Удалить спортсмена"
          >
            {isDeleting ? (
              <LoaderCircle size={15} strokeWidth={2.1} aria-hidden="true" />
            ) : (
              <Trash2 size={15} strokeWidth={2.1} aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        <div className="room-boxers-actions-cell" />
      )}
    </div>
  );
}

function ReadOnlyBoxerRow({
  boxer,
  index,
  isInactive = false,
}: {
  boxer: RoomBoxer;
  index: number;
  isInactive?: boolean;
}) {
  return (
    <div className={`room-boxers-row room-boxers-row-guest${isInactive ? " room-boxers-row-disabled" : ""}`}>
      <span className="room-boxers-index-cell">{index}</span>
      <BoxerCells boxer={boxer} />
    </div>
  );
}

function BoxerCells({ boxer }: { boxer: RoomBoxer }) {
  const fullName = getBoxerFullName(boxer);
  const club = boxer.trainer?.club || "-";

  return (
    <>
      <span title={fullName}>{fullName}</span>
      <span>
        <span className={getBoxerRankClassName(boxer.rank)}>{boxer.rank}</span>
      </span>
      <span>{boxer.weight || "-"}</span>
      <span>{boxer.age || "-"}</span>
      <span>{getBoxerSexLabel(boxer.sex)}</span>
      <span title={club}>{club}</span>
    </>
  );
}
