import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Fight, Grid, JudgeApplication, NoteRound, Ring, RoomApplication, RoomBoxer } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import { ApplicationsTab } from "../tabs/ApplicationsTab";
import { PairsTab } from "../tabs/PairsTab";
import { ParticipantsTab } from "../tabs/ParticipantsTab";
import type { RoomSectionVisibility, RoomUiScenarioState } from "../scenario";
import type { FightRow, PendingApplicationAction, RoomBoxerSortField } from "../types";
import { RoomRingDetailContent } from "./RoomRingDetailContent";
import type { RoomWorkspaceProps } from "./RoomWorkspace.types";

type Props = {
  access: RoomWorkspaceProps["access"];
  activeBoxers: RoomBoxer[];
  activeFight: FightRow | null;
  activeJudges: JudgeApplication[];
  activeRing: Ring | null;
  activeRingGrids: Grid[];
  activeRings: Ring[];
  applicationsState: RequestState;
  boxersState: RequestState;
  canSaveOrder: boolean;
  deleteState: RequestState;
  deletingBoxerId: string | null;
  filteredFightRows: FightRow[];
  filteredGrids: Grid[];
  fightRows: FightRow[];
  getJudgeName: (application: JudgeApplication | undefined) => string;
  gridSearch: string;
  gridState: RequestState;
  gridsState: RequestState;
  hasDraftOrder: boolean;
  inactiveBoxers: RoomBoxer[];
  inactiveJudges: JudgeApplication[];
  judgeApplicationsState: RequestState;
  isTimerRunning: boolean;
  isWinnerMenuOpen: boolean;
  nextRound: NoteRound | null;
  onBoxerDelete: (boxerUuid: string) => void;
  onBoxerEdit: (boxer: RoomBoxer) => void;
  onFightNotesOpen: () => void;
  onFightSelect: Dispatch<SetStateAction<string | null>>;
  onFightStatusChange: Dispatch<SetStateAction<Fight["status"] | null>>;
  onGridOpen: () => void;
  onGridSearchChange: Dispatch<SetStateAction<string>>;
  onJudgeChange: (applicationUuid: string, payload: Partial<Pick<JudgeApplication, "status" | "ring" | "role" | "is_active">>) => void;
  onJudgeDelete: (applicationUuid: string) => void;
  onJudgeRingSelect: (applicationUuid: string) => void;
  onOwnerBoxersOpen: () => void;
  onPendingApplicationAction: Dispatch<SetStateAction<PendingApplicationAction | null>>;
  onRingDetailSearchChange: Dispatch<SetStateAction<string>>;
  onRoundSelect: Dispatch<SetStateAction<NoteRound | null>>;
  onSaveOrder: () => void;
  onSearchChange: Dispatch<SetStateAction<string>>;
  onTimerDurationChange: (seconds: number) => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  onToggleBoxer: (boxerUuid: string) => void;
  onViewModeChange: Dispatch<SetStateAction<"bracket" | "list">>;
  onWinnerConfirm: () => void;
  onWinnerMenuToggle: () => void;
  onWinnerSelect: (boxerUuid: string) => void;
  renderGrid: (grid: Grid, options: { showBuildButton: boolean; readOnly: boolean }) => React.ReactNode;
  renderGridSortButton: (field: RoomBoxerSortField, label: string) => React.ReactNode;
  renderRingGrid: (grid: Grid) => React.ReactNode;
  ringDetailSearch: string;
  ringDetailViewMode: "bracket" | "list";
  ringSideJudgesState: RequestState;
  roomApplications: RoomApplication[];
  roomJudgeApplications: JudgeApplication[];
  roundTimerSeconds: number;
  roundTimerText: string;
  scenario: RoomUiScenarioState;
  search: string;
  selectedBoxerIds: string[];
  selectedFightRow: FightRow | null;
  selectedFightWinner: string | null;
  selectedFightWinnerBlueUuid: string;
  selectedFightWinnerRedUuid: string;
  submittedRounds: Set<NoteRound>;
  timerOptions: readonly { label: string; seconds: number }[];
  updateState: RequestState;
  updatingApplicationId: string | null;
  updatingJudgeApplicationId: string | null;
  visibility: RoomSectionVisibility;
  visiblePairsGrids: Grid[];
  winnerDropdownRef: RefObject<HTMLDivElement | null>;
};

export function RoomWorkspaceContentBlock({
  access,
  activeBoxers,
  activeFight,
  activeJudges,
  activeRing,
  activeRingGrids,
  activeRings,
  applicationsState,
  boxersState,
  canSaveOrder,
  deleteState,
  deletingBoxerId,
  filteredFightRows,
  filteredGrids,
  fightRows,
  getJudgeName,
  gridSearch,
  gridState,
  gridsState,
  hasDraftOrder,
  inactiveBoxers,
  inactiveJudges,
  judgeApplicationsState,
  isTimerRunning,
  isWinnerMenuOpen,
  nextRound,
  onBoxerDelete,
  onBoxerEdit,
  onFightNotesOpen,
  onFightSelect,
  onFightStatusChange,
  onGridOpen,
  onGridSearchChange,
  onJudgeChange,
  onJudgeDelete,
  onJudgeRingSelect,
  onOwnerBoxersOpen,
  onPendingApplicationAction,
  onRingDetailSearchChange,
  onRoundSelect,
  onSaveOrder,
  onSearchChange,
  onTimerDurationChange,
  onTimerStart,
  onTimerStop,
  onToggleBoxer,
  onViewModeChange,
  onWinnerConfirm,
  onWinnerMenuToggle,
  onWinnerSelect,
  renderGrid,
  renderGridSortButton,
  renderRingGrid,
  ringDetailSearch,
  ringDetailViewMode,
  ringSideJudgesState,
  roomApplications,
  roomJudgeApplications,
  roundTimerSeconds,
  roundTimerText,
  scenario,
  search,
  selectedBoxerIds,
  selectedFightRow,
  selectedFightWinner,
  selectedFightWinnerBlueUuid,
  selectedFightWinnerRedUuid,
  submittedRounds,
  timerOptions,
  updateState,
  updatingApplicationId,
  updatingJudgeApplicationId,
  visibility,
  visiblePairsGrids,
  winnerDropdownRef,
}: Props) {
  return (
    <>
      {visibility.showApplications ? (
        <ApplicationsTab
          activeRings={activeRings}
          applicationsState={applicationsState}
          judgeApplicationsState={judgeApplicationsState}
          roomApplications={roomApplications}
          roomJudgeApplications={roomJudgeApplications}
          updateState={updateState}
          updatingApplicationId={updatingApplicationId}
          updatingJudgeApplicationId={updatingJudgeApplicationId}
          onJudgeChange={onJudgeChange}
          onJudgeDelete={onJudgeDelete}
          onOwnerBoxersOpen={onOwnerBoxersOpen}
          onPendingApplicationAction={onPendingApplicationAction}
        />
      ) : null}

      {visibility.showParticipants ? (
        <ParticipantsTab
          activeBoxers={activeBoxers}
          boxersState={boxersState}
          canEdit={access.isOwner}
          deleteState={deleteState}
          deletingBoxerId={deletingBoxerId}
          inactiveBoxers={inactiveBoxers}
          search={search}
          selectedBoxerIds={selectedBoxerIds}
          renderSortButton={renderGridSortButton}
          onBoxerDelete={onBoxerDelete}
          onBoxerEdit={onBoxerEdit}
          onGridOpen={onGridOpen}
          onSearchChange={onSearchChange}
          onToggleBoxer={onToggleBoxer}
        />
      ) : null}

      {visibility.showPairs ? (
        <PairsTab
          grids={visiblePairsGrids}
          gridsState={gridsState}
          search={gridSearch}
          showSearch={access.isOwner}
          renderGrid={(grid) => renderGrid(grid, { showBuildButton: true, readOnly: false })}
          onSearchChange={onGridSearchChange}
        />
      ) : null}

      {visibility.showRingDetail ? (
        <RoomRingDetailContent
          activeFight={activeFight}
          activeJudges={activeJudges}
          activeRing={activeRing}
          activeRingGrids={activeRingGrids}
          canSaveOrder={canSaveOrder}
          fightRows={fightRows}
          filteredFightRows={filteredFightRows}
          filteredGrids={filteredGrids}
          getJudgeName={getJudgeName}
          gridState={gridState}
          hasDraftOrder={hasDraftOrder}
          inactiveJudges={inactiveJudges}
          isActiveSideJudge={access.isActiveSideJudge}
          isChiefJudge={access.isChiefJudge && !scenario.renderCompletedChiefAsReadonly}
          isJudge={access.isJudge}
          isTimerRunning={isTimerRunning}
          isWinnerMenuOpen={isWinnerMenuOpen}
          nextRound={nextRound}
          renderGrid={renderRingGrid}
          ringSideJudgesState={ringSideJudgesState}
          roundTimerSeconds={roundTimerSeconds}
          roundTimerText={roundTimerText}
          search={ringDetailSearch}
          selectedFightRow={selectedFightRow}
          selectedFightWinner={selectedFightWinner}
          selectedFightWinnerBlueUuid={selectedFightWinnerBlueUuid}
          selectedFightWinnerRedUuid={selectedFightWinnerRedUuid}
          submittedRounds={submittedRounds}
          timerOptions={timerOptions}
          updateState={updateState}
          viewMode={ringDetailViewMode}
          winnerDropdownRef={winnerDropdownRef}
          onFightNotesOpen={onFightNotesOpen}
          onFightSelect={onFightSelect}
          onFightStatusChange={onFightStatusChange}
          onJudgeSelect={onJudgeRingSelect}
          onRoundSelect={onRoundSelect}
          onSaveOrder={onSaveOrder}
          onSearchChange={onRingDetailSearchChange}
          onTimerDurationChange={onTimerDurationChange}
          onTimerStart={onTimerStart}
          onTimerStop={onTimerStop}
          onViewModeChange={onViewModeChange}
          onWinnerConfirm={onWinnerConfirm}
          onWinnerMenuToggle={onWinnerMenuToggle}
          onWinnerSelect={onWinnerSelect}
        />
      ) : null}
    </>
  );
}
