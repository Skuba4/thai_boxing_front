import type { FormEvent } from "react";
import type {
  Boxer,
  CreateGridPayload,
  Fight,
  Grid,
  Note,
  NoteRound,
  Ring,
  RingStatus,
  RoomBoxer,
  RoomBoxerPayload,
} from "../../../features/auth/authApi";
import type { RoomBoxerFormState } from "../../homeForms";
import { RoomBoxerModal, RoomApplicationBoxersModal } from "../../components/modals/BoxerModals";
import { ConfirmDeleteApplicationModal, UnsavedChangesModal } from "../../components/modals/ConfirmModals";
import { FightNotesModal, SideJudgeNoteModal } from "../../components/modals/FightModals";
import { GridModal } from "../../components/modals/GridModals";
import { RingModal } from "../../components/modals/RingModals";
import type {
  ApplicationBoxersMode,
  FightRow,
  PendingApplicationAction,
  PendingDraftAction,
  PendingJudgeApplicationAction,
} from "../types";
import { PendingApplicationConfirm } from "./PendingApplicationConfirm";

type State = "idle" | "loading" | "success" | "error";

type Props = {
  activeSideFightRow: FightRow | null;
  applicationBoxers: Boxer[];
  blueWinnerUuid: string | null;
  editingBoxerForm: RoomBoxerFormState;
  editingBoxerId: string | null;
  editingGridId: string | null;
  editingRing: Ring | null;
  fightNotes: Note[];
  fightNotesState: State;
  gridForm: CreateGridPayload;
  gridState: State;
  guestApplicationState: State;
  guestJudgeApplicationState: State;
  isFightNotesModalOpen: boolean;
  isGridModalOpen: boolean;
  isRoomApplicationBoxersModalOpen: boolean;
  pendingApplicationAction: PendingApplicationAction | null;
  pendingApplicationBoxers: Boxer[];
  pendingDraftAction: PendingDraftAction | null;
  pendingFightStatus: Fight["status"] | null;
  pendingFightWinnerConfirm: boolean;
  pendingJudgeApplicationAction: PendingJudgeApplicationAction | null;
  pendingSideJudgeNoteConfirm: boolean;
  redWinnerUuid: string | null;
  ringForm: { status: RingStatus; description: string };
  roomApplicationBoxersMode: ApplicationBoxersMode;
  selectedApplicationBoxerIds: string[];
  selectedBoxers: Array<Pick<RoomBoxer, "uuid" | "first_name" | "last_name">>;
  selectedChiefFightRow: FightRow | null;
  selectedFightWinner: string | null;
  selectedSideJudgeRound: NoteRound | null;
  sideJudgeBlueRemark: string;
  sideJudgeNoteState: State;
  sideJudgeRedRemark: string;
  sortedGrids: Grid[];
  updateState: State;
  onApplicationBoxerToggle: (boxerUuid: string) => void;
  onApplicationConfirm: () => void;
  onApplicationCancel: () => void;
  onBoxerClose: () => void;
  onBoxerFieldChange: (field: keyof RoomBoxerPayload, value: string) => void;
  onBoxerSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftCancel: () => void;
  onDraftReset: () => void;
  onDraftSave: () => void;
  onFightNotesClose: () => void;
  onFightStatusCancel: () => void;
  onFightStatusConfirm: (status: Fight["status"]) => void;
  onFightWinnerCancel: () => void;
  onFightWinnerConfirm: () => void;
  onGridClose: () => void;
  onGridFieldChange: <K extends keyof CreateGridPayload>(field: K, value: CreateGridPayload[K]) => void;
  onGridSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onJudgeApplicationCancel: () => void;
  onJudgeApplicationConfirm: () => void;
  onRingClose: () => void;
  onRingFieldChange: <K extends keyof Props["ringForm"]>(field: K, value: Props["ringForm"][K]) => void;
  onRingSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRoomApplicationBoxersClose: () => void;
  onRoomApplicationBoxersSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSideJudgeBlueRemarkChange: (value: string) => void;
  onSideJudgeNoteClose: () => void;
  onSideJudgeNoteConfirm: () => void;
  onSideJudgeNoteSubmit: () => void;
  onSideJudgeRedRemarkChange: (value: string) => void;
};

export function RoomModalsHost(props: Props) {
  const applicationSubmitLabel =
    props.roomApplicationBoxersMode === "owner-add"
      ? "Сохранить"
      : props.roomApplicationBoxersMode === "guest-edit"
        ? "Сохранить"
        : "Отправить";

  return (
    <>
      {props.editingBoxerId ? (
        <RoomBoxerModal
          boxerForm={props.editingBoxerForm}
          submitState={props.updateState}
          title="Редактировать участника"
          submitLabel="Сохранить"
          onClose={props.onBoxerClose}
          onFieldChange={props.onBoxerFieldChange}
          onSubmit={props.onBoxerSubmit}
        />
      ) : null}

      {props.isRoomApplicationBoxersModalOpen ? (
        <RoomApplicationBoxersModal
          boxers={props.applicationBoxers}
          selectedBoxerIds={props.selectedApplicationBoxerIds}
          submitState={props.guestApplicationState}
          submitLabel={applicationSubmitLabel}
          onClose={props.onRoomApplicationBoxersClose}
          onToggleBoxer={props.onApplicationBoxerToggle}
          onSubmit={props.onRoomApplicationBoxersSubmit}
        />
      ) : null}

      {props.pendingJudgeApplicationAction ? (
        <ConfirmDeleteApplicationModal
          title={props.pendingJudgeApplicationAction === "create" ? "Подать заявку на судейство?" : "Удалить заявку?"}
          description=""
          confirmLabel={props.pendingJudgeApplicationAction === "create" ? "Отправить" : "Удалить"}
          confirmButtonClassName={
            props.pendingJudgeApplicationAction === "create" ? "judge-application-confirm-button" : "danger-button"
          }
          submitState={props.guestJudgeApplicationState}
          onCancel={props.onJudgeApplicationCancel}
          onConfirm={props.onJudgeApplicationConfirm}
        />
      ) : null}

      {props.pendingApplicationAction ? (
        <PendingApplicationConfirm
          action={props.pendingApplicationAction}
          boxers={props.pendingApplicationBoxers}
          submitState={props.updateState}
          onCancel={props.onApplicationCancel}
          onConfirm={props.onApplicationConfirm}
        />
      ) : null}

      {props.pendingDraftAction ? (
        <UnsavedChangesModal
          submitState={props.gridState}
          onCancel={props.onDraftCancel}
          onSave={props.onDraftSave}
          onReset={props.onDraftReset}
        />
      ) : null}

      {props.editingRing ? (
        <RingModal
          ring={props.editingRing}
          ringForm={props.ringForm}
          submitState={props.updateState}
          onClose={props.onRingClose}
          onFieldChange={props.onRingFieldChange}
          onSubmit={props.onRingSubmit}
        />
      ) : null}

      {props.isGridModalOpen ? (
        <GridModal
          gridForm={props.gridForm}
          selectedBoxers={props.selectedBoxers}
          submitState={props.gridState}
          title={props.editingGridId === null ? "Новая сетка" : "Редактировать сетку"}
          submitLabel={props.editingGridId === null ? "Отправить" : "Сохранить"}
          onClose={props.onGridClose}
          grids={props.sortedGrids}
          onFieldChange={props.onGridFieldChange}
          onSubmit={props.onGridSubmit}
        />
      ) : null}

      {props.isFightNotesModalOpen ? (
        <FightNotesModal
          fightNumber={props.selectedChiefFightRow?.ringOrder ?? null}
          gridName={props.selectedChiefFightRow?.gridName ?? ""}
          redName={props.selectedChiefFightRow?.redText ?? ""}
          blueName={props.selectedChiefFightRow?.blueText ?? ""}
          notes={props.fightNotes}
          submitState={props.fightNotesState}
          onClose={props.onFightNotesClose}
        />
      ) : null}

      {props.selectedSideJudgeRound && props.activeSideFightRow ? (
        <SideJudgeNoteModal
          fightNumber={props.activeSideFightRow.ringOrder}
          gridName={props.activeSideFightRow.gridName}
          redName={props.activeSideFightRow.redText}
          blueName={props.activeSideFightRow.blueText}
          roundLabel={props.selectedSideJudgeRound}
          redRemark={props.sideJudgeRedRemark}
          blueRemark={props.sideJudgeBlueRemark}
          submitState={props.sideJudgeNoteState}
          onClose={props.onSideJudgeNoteClose}
          onRedRemarkChange={props.onSideJudgeRedRemarkChange}
          onBlueRemarkChange={props.onSideJudgeBlueRemarkChange}
          onSubmit={props.onSideJudgeNoteSubmit}
        />
      ) : null}

      {props.pendingSideJudgeNoteConfirm ? (
        <ConfirmDeleteApplicationModal
          title=""
          description="После сохранения изменить записку будет невозможно."
          descriptionClassName="modal-text modal-text-warning"
          confirmLabel="Отправить"
          confirmButtonClassName="sync-button"
          showCancelButton={false}
          submitState={props.sideJudgeNoteState}
          onCancel={props.onSideJudgeNoteClose}
          onConfirm={props.onSideJudgeNoteConfirm}
        />
      ) : null}

      {props.pendingFightStatus ? (
        <ConfirmDeleteApplicationModal
          title=""
          description={
            props.pendingFightStatus === "active"
              ? "Отправить текущий бой боковым судьям?"
              : "Закончить судейство боя?"
          }
          confirmLabel={props.pendingFightStatus === "active" ? "Отправить" : "Завершить"}
          confirmButtonClassName={props.pendingFightStatus === "active" ? "sync-button" : "danger-button"}
          submitState={props.updateState}
          onCancel={props.onFightStatusCancel}
          onConfirm={() => props.pendingFightStatus && props.onFightStatusConfirm(props.pendingFightStatus)}
        />
      ) : null}

      {props.pendingFightWinnerConfirm && props.selectedChiefFightRow ? (
        <ConfirmDeleteApplicationModal
          title=""
          description={`Выбрать победителем ${
            props.selectedFightWinner === props.redWinnerUuid
              ? `<span class="fight-winner-confirm-name fight-winner-confirm-name-red">${props.selectedChiefFightRow.redText}</span>`
              : `<span class="fight-winner-confirm-name fight-winner-confirm-name-blue">${props.selectedChiefFightRow.blueText}</span>`
          }?`}
          descriptionClassName="modal-text fight-winner-confirm-text"
          confirmLabel="Сохранить"
          confirmButtonClassName="sync-button"
          submitState={props.updateState}
          onCancel={props.onFightWinnerCancel}
          onConfirm={props.onFightWinnerConfirm}
        />
      ) : null}
    </>
  );
}
