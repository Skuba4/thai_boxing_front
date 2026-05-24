import { Play, Square } from "lucide-react";
import type { RefObject } from "react";
import type { JudgeApplication, FightStatus } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import type { FightRow } from "../types";

type TimerOption = {
  label: string;
  seconds: number;
};

export function ChiefJudgesGrid({
  activeJudges,
  inactiveJudges,
  ringSideJudgesState,
  updateState,
  getJudgeName,
  onJudgeSelect,
}: {
  activeJudges: JudgeApplication[];
  inactiveJudges: JudgeApplication[];
  ringSideJudgesState: RequestState;
  updateState: RequestState;
  getJudgeName: (application: JudgeApplication | undefined) => string;
  onJudgeSelect: (applicationUuid: string) => void;
}) {
  return (
    <div className="chief-judges-grid">
      {[0, 1, 2].map((judgeIndex) => {
        const activeJudge = activeJudges[judgeIndex];

        return (
          <article key={activeJudge?.uuid ?? judgeIndex} className="chief-judge-card">
            <div className="chief-judge-card-main">
              <span className="chief-judge-card-badge">{judgeIndex + 1}</span>
              <select
                className="chief-judge-select"
                value={activeJudge?.uuid ?? ""}
                disabled={ringSideJudgesState === "loading" || updateState === "loading"}
                onChange={(event) => {
                  if (event.target.value === activeJudge?.uuid) {
                    return;
                  }

                  onJudgeSelect(event.target.value);
                }}
              >
                <option value="">
                  Пусто
                </option>
                {activeJudge ? (
                  <option value={activeJudge.uuid} hidden>
                    {getJudgeName(activeJudge)}
                  </option>
                ) : null}
                {inactiveJudges.map((application) => (
                  <option key={application.uuid} value={application.uuid}>
                    {getJudgeName(application)}
                  </option>
                ))}
              </select>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ChiefActiveFightCard({
  isTimerRunning,
  isWinnerMenuOpen,
  roundTimerSeconds,
  roundTimerText,
  selectedFightRow,
  selectedFightWinner,
  selectedFightWinnerBlueUuid,
  selectedFightWinnerRedUuid,
  timerOptions,
  winnerDropdownRef,
  onFightNotesOpen,
  onFightStatusChange,
  onTimerDurationChange,
  onTimerStart,
  onTimerStop,
  onWinnerConfirm,
  onWinnerMenuToggle,
  onWinnerSelect,
}: {
  isTimerRunning: boolean;
  isWinnerMenuOpen: boolean;
  roundTimerSeconds: number;
  roundTimerText: string;
  selectedFightRow: FightRow | null;
  selectedFightWinner: string | null;
  selectedFightWinnerBlueUuid: string;
  selectedFightWinnerRedUuid: string;
  timerOptions: readonly TimerOption[];
  winnerDropdownRef: RefObject<HTMLDivElement | null>;
  onFightNotesOpen: () => void;
  onFightStatusChange: (status: FightStatus) => void;
  onTimerDurationChange: (seconds: number) => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  onWinnerConfirm: () => void;
  onWinnerMenuToggle: () => void;
  onWinnerSelect: (boxerUuid: string) => void;
}) {
  return (
    <section className="chief-active-fight-card">
      {selectedFightRow ? (
        <>
          <div className="chief-active-fight-line chief-active-fight-line-head">
            <span className="chief-active-fight-number">{selectedFightRow.ringOrder}</span>
            <div className="chief-active-fight-names">
              <strong className="chief-active-fight-name-red">{selectedFightRow.redText}</strong>
              <span>VS</span>
              <strong className="chief-active-fight-name-blue">{selectedFightRow.blueText}</strong>
            </div>
          </div>
          <div className="chief-active-fight-line chief-active-fight-actions">
            {selectedFightRow.fight.status === "active" ? (
              <button
                type="button"
                className="outline-button chief-fight-action-button chief-fight-action-button-finish"
                onClick={() => onFightStatusChange("inactive")}
              >
                Завершить судейство
              </button>
            ) : (
              <button
                type="button"
                className="outline-button chief-fight-action-button chief-fight-action-button-start"
                onClick={() => onFightStatusChange("active")}
              >
                Начать судейство
              </button>
            )}
          </div>
          <div className="chief-active-fight-line chief-round-timer-row">
            <div className="chief-round-timer">
              <select
                className="chief-round-timer-select"
                value={roundTimerSeconds}
                onChange={(event) => onTimerDurationChange(Number(event.target.value))}
                disabled={isTimerRunning}
                aria-label="Длительность раунда"
              >
                {timerOptions.map((option) => (
                  <option key={option.seconds} value={option.seconds}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="chief-round-timer-display">{roundTimerText}</span>
              <button
                type="button"
                className="chief-round-timer-button chief-round-timer-button-start"
                onClick={onTimerStart}
                aria-label="Запустить таймер"
              >
                <Play size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="chief-round-timer-button chief-round-timer-button-stop"
                onClick={onTimerStop}
                aria-label="Остановить таймер"
              >
                <Square size={13} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="chief-active-fight-line chief-fight-bottom-actions">
            <button
              type="button"
              className="outline-button chief-fight-action-button chief-fight-action-button-notes"
              onClick={onFightNotesOpen}
            >
              Записки
            </button>
            <div className="chief-fight-winner-controls">
              <div className="chief-fight-winner-dropdown" ref={winnerDropdownRef}>
                <button
                  type="button"
                  className={`chief-fight-winner-select${
                    selectedFightWinner === selectedFightWinnerRedUuid
                      ? " chief-fight-winner-select-red"
                      : " chief-fight-winner-select-blue"
                  }`}
                  onClick={onWinnerMenuToggle}
                >
                  <span>
                    {selectedFightWinner === selectedFightWinnerRedUuid
                      ? selectedFightRow.redText
                      : selectedFightRow.blueText}
                  </span>
                  <span className="chief-fight-winner-caret">▼</span>
                </button>
                {isWinnerMenuOpen ? (
                  <div className="chief-fight-winner-menu">
                    <button
                      type="button"
                      className="chief-fight-winner-menu-item chief-fight-winner-option-red"
                      onClick={() => onWinnerSelect(selectedFightWinnerRedUuid)}
                    >
                      {selectedFightRow.redText}
                    </button>
                    <button
                      type="button"
                      className="chief-fight-winner-menu-item chief-fight-winner-option-blue"
                      onClick={() => onWinnerSelect(selectedFightWinnerBlueUuid)}
                    >
                      {selectedFightRow.blueText}
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="outline-button chief-fight-action-button chief-fight-action-button-start"
                onClick={onWinnerConfirm}
              >
                Сохранить
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>Выбери бой из списка.</p>
      )}
    </section>
  );
}

export function ChiefFightTable({
  fightRows,
  selectedFightRow,
  onFightSelect,
}: {
  fightRows: FightRow[];
  selectedFightRow: FightRow | null;
  onFightSelect: (fightUuid: string) => void;
}) {
  return (
    <div className="ring-fights-table chief-fights-table">
      <div className="ring-fights-row chief-fights-row chief-fights-row-head ring-fights-row-head">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span>Красный</span>
        <span>Синий</span>
        <span>Победитель</span>
      </div>
      {fightRows.map((row) => {
        const isSelectedFight = selectedFightRow?.fight.uuid === row.fight.uuid;
        const isFightFinished = Boolean(row.fight.winner);

        return (
          <button
            key={row.fight.uuid}
            type="button"
            className={`ring-fights-row chief-fights-row chief-fights-row-button room-boxers-row-clickable${isSelectedFight ? " room-boxers-row-selected" : ""}${isFightFinished ? " chief-fights-row-disabled" : ""}`}
            disabled={isFightFinished}
            onClick={() => {
              if (!isFightFinished) {
                onFightSelect(row.fight.uuid);
              }
            }}
          >
            <span>{row.ringOrder}</span>
            <span className="room-boxers-select-cell">
              <span
                className={`chief-fights-select-marker${isSelectedFight ? " chief-fights-select-marker-active" : ""}${isFightFinished ? " chief-fights-select-marker-disabled" : ""}`}
                aria-hidden="true"
              />
            </span>
            <span className={row.redText === "BYE" ? "ring-fights-bye" : "ring-fights-red"} title={row.redTitle}>{row.redText}</span>
            <span className={row.blueText === "BYE" ? "ring-fights-bye" : "ring-fights-blue"} title={row.blueTitle}>{row.blueText}</span>
            <span className={`ring-fights-winner ring-fights-winner-${row.winnerSide}`} title={row.winnerTitle}>{row.winnerText}</span>
          </button>
        );
      })}
    </div>
  );
}
