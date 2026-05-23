import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import type { Fight, Grid, JudgeApplication, NoteRound, Ring } from "../../../features/auth/authApi";
import type { FightRow } from "../types";
import { ChiefPanel } from "../tabs/ChiefPanel";
import { RingDetailTab } from "../tabs/RingDetailTab";
import { RingPublicPanel } from "../tabs/RingPublicPanel";
import { SideJudgePanel } from "../tabs/SideJudgePanel";

type State = "idle" | "loading" | "success" | "error";
type TimerOption = { label: string; seconds: number };

export function RoomRingDetailContent({
  activeFight,
  activeJudges,
  activeRing,
  activeRingGrids,
  canSaveOrder,
  fightRows,
  filteredFightRows,
  filteredGrids,
  getJudgeName,
  gridState,
  hasDraftOrder,
  inactiveJudges,
  isActiveSideJudge,
  isChiefJudge,
  isJudge,
  isTimerRunning,
  isWinnerMenuOpen,
  nextRound,
  renderGrid,
  ringSideJudgesState,
  roundTimerSeconds,
  roundTimerText,
  search,
  selectedFightRow,
  selectedFightWinner,
  selectedFightWinnerBlueUuid,
  selectedFightWinnerRedUuid,
  submittedRounds,
  timerOptions,
  updateState,
  viewMode,
  winnerDropdownRef,
  onFightNotesOpen,
  onFightSelect,
  onFightStatusChange,
  onJudgeSelect,
  onRoundSelect,
  onSaveOrder,
  onSearchChange,
  onTimerDurationChange,
  onTimerStart,
  onTimerStop,
  onViewModeChange,
  onWinnerConfirm,
  onWinnerMenuToggle,
  onWinnerSelect,
}: {
  activeFight: FightRow | null;
  activeJudges: JudgeApplication[];
  activeRing: Ring | null;
  activeRingGrids: Grid[];
  canSaveOrder: boolean;
  fightRows: FightRow[];
  filteredFightRows: FightRow[];
  filteredGrids: Grid[];
  getJudgeName: (application: JudgeApplication | undefined) => string;
  gridState: State;
  hasDraftOrder: boolean;
  inactiveJudges: JudgeApplication[];
  isActiveSideJudge: boolean;
  isChiefJudge: boolean;
  isJudge: boolean;
  isTimerRunning: boolean;
  isWinnerMenuOpen: boolean;
  nextRound: NoteRound | null;
  renderGrid: (grid: Grid) => ReactNode;
  ringSideJudgesState: State;
  roundTimerSeconds: number;
  roundTimerText: string;
  search: string;
  selectedFightRow: FightRow | null;
  selectedFightWinner: string | null;
  selectedFightWinnerBlueUuid: string;
  selectedFightWinnerRedUuid: string;
  submittedRounds: Set<NoteRound>;
  timerOptions: readonly TimerOption[];
  updateState: State;
  viewMode: "bracket" | "list";
  winnerDropdownRef: RefObject<HTMLDivElement | null>;
  onFightNotesOpen: () => void;
  onFightSelect: Dispatch<SetStateAction<string | null>>;
  onFightStatusChange: Dispatch<SetStateAction<Fight["status"] | null>>;
  onJudgeSelect: (applicationUuid: string) => void;
  onRoundSelect: Dispatch<SetStateAction<NoteRound | null>>;
  onSaveOrder: () => void;
  onSearchChange: Dispatch<SetStateAction<string>>;
  onTimerDurationChange: (seconds: number) => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  onViewModeChange: Dispatch<SetStateAction<"bracket" | "list">>;
  onWinnerConfirm: () => void;
  onWinnerMenuToggle: () => void;
  onWinnerSelect: (boxerUuid: string) => void;
}) {
  return (
    <RingDetailTab
      activeRing={activeRing}
      hasGrids={activeRingGrids.length > 0}
      emptyContent={
        <>
          {!isJudge || !activeRing ? (
            <p>В этом ринге пока нет сеток.</p>
          ) : null}
        </>
      }
    >
      {isChiefJudge ? (
        <ChiefPanel
          activeJudges={activeJudges}
          fightRows={fightRows}
          inactiveJudges={inactiveJudges}
          isTimerRunning={isTimerRunning}
          isWinnerMenuOpen={isWinnerMenuOpen}
          ringSideJudgesState={ringSideJudgesState}
          roundTimerSeconds={roundTimerSeconds}
          roundTimerText={roundTimerText}
          selectedFightRow={selectedFightRow}
          selectedFightWinner={selectedFightWinner}
          selectedFightWinnerBlueUuid={selectedFightWinnerBlueUuid}
          selectedFightWinnerRedUuid={selectedFightWinnerRedUuid}
          timerOptions={timerOptions}
          updateState={updateState}
          winnerDropdownRef={winnerDropdownRef}
          getJudgeName={getJudgeName}
          onFightNotesOpen={onFightNotesOpen}
          onFightSelect={onFightSelect}
          onFightStatusChange={onFightStatusChange}
          onJudgeSelect={onJudgeSelect}
          onTimerDurationChange={onTimerDurationChange}
          onTimerStart={onTimerStart}
          onTimerStop={onTimerStop}
          onWinnerConfirm={onWinnerConfirm}
          onWinnerMenuToggle={onWinnerMenuToggle}
          onWinnerSelect={onWinnerSelect}
        />
      ) : isActiveSideJudge ? (
        <SideJudgePanel
          activeFight={activeFight}
          nextRound={nextRound}
          submittedRounds={submittedRounds}
          onRoundSelect={onRoundSelect}
        />
      ) : (
        <RingPublicPanel
          canSaveOrder={canSaveOrder}
          fightRows={filteredFightRows}
          gridState={gridState}
          grids={filteredGrids}
          hasDraftOrder={hasDraftOrder}
          search={search}
          viewMode={viewMode}
          renderGrid={renderGrid}
          onSaveOrder={onSaveOrder}
          onSearchChange={onSearchChange}
          onViewModeChange={onViewModeChange}
        />
      )}
    </RingDetailTab>
  );
}
