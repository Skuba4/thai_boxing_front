import type { RefObject } from "react";
import type { JudgeApplication, FightStatus } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import type { FightRow } from "../types";
import { ChiefActiveFightCard, ChiefFightTable, ChiefJudgesGrid } from "./ChiefPanelParts";

type TimerOption = {
  label: string;
  seconds: number;
};

type ChiefPanelProps = {
  activeJudges: JudgeApplication[];
  fightRows: FightRow[];
  inactiveJudges: JudgeApplication[];
  isWinnerMenuOpen: boolean;
  isTimerRunning: boolean;
  ringSideJudgesState: RequestState;
  roundTimerSeconds: number;
  roundTimerText: string;
  selectedFightRow: FightRow | null;
  selectedFightWinner: string | null;
  selectedFightWinnerBlueUuid: string;
  selectedFightWinnerRedUuid: string;
  timerOptions: readonly TimerOption[];
  updateState: RequestState;
  winnerDropdownRef: RefObject<HTMLDivElement | null>;
  getJudgeName: (application: JudgeApplication | undefined) => string;
  onFightNotesOpen: () => void;
  onFightSelect: (fightUuid: string) => void;
  onFightStatusChange: (status: FightStatus) => void;
  onJudgeSelect: (applicationUuid: string) => void;
  onTimerDurationChange: (seconds: number) => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  onWinnerConfirm: () => void;
  onWinnerMenuToggle: () => void;
  onWinnerSelect: (boxerUuid: string) => void;
};

export function ChiefPanel(props: ChiefPanelProps) {
  return (
    <div className="chief-ring-panel">
      <ChiefJudgesGrid
        activeJudges={props.activeJudges}
        inactiveJudges={props.inactiveJudges}
        ringSideJudgesState={props.ringSideJudgesState}
        updateState={props.updateState}
        getJudgeName={props.getJudgeName}
        onJudgeSelect={props.onJudgeSelect}
      />
      <ChiefActiveFightCard
        isTimerRunning={props.isTimerRunning}
        isWinnerMenuOpen={props.isWinnerMenuOpen}
        roundTimerSeconds={props.roundTimerSeconds}
        roundTimerText={props.roundTimerText}
        selectedFightRow={props.selectedFightRow}
        selectedFightWinner={props.selectedFightWinner}
        selectedFightWinnerBlueUuid={props.selectedFightWinnerBlueUuid}
        selectedFightWinnerRedUuid={props.selectedFightWinnerRedUuid}
        timerOptions={props.timerOptions}
        winnerDropdownRef={props.winnerDropdownRef}
        onFightNotesOpen={props.onFightNotesOpen}
        onFightStatusChange={props.onFightStatusChange}
        onTimerDurationChange={props.onTimerDurationChange}
        onTimerStart={props.onTimerStart}
        onTimerStop={props.onTimerStop}
        onWinnerConfirm={props.onWinnerConfirm}
        onWinnerMenuToggle={props.onWinnerMenuToggle}
        onWinnerSelect={props.onWinnerSelect}
      />
      <ChiefFightTable
        fightRows={props.fightRows}
        selectedFightRow={props.selectedFightRow}
        onFightSelect={props.onFightSelect}
      />
    </div>
  );
}
