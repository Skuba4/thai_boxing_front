import type { NoteRound } from "../../../features/auth/authApi";
import type { FightRow } from "../types";

type SideJudgePanelProps = {
  activeFight: FightRow | null;
  nextRound: NoteRound | null;
  submittedRounds: Set<NoteRound>;
  onRoundSelect: (round: NoteRound) => void;
};

export function SideJudgePanel({
  activeFight,
  nextRound,
  submittedRounds,
  onRoundSelect,
}: SideJudgePanelProps) {
  return (
    <div className="chief-ring-panel">
      <section className="chief-active-fight-card side-judge-fight-card">
        {activeFight ? (
          <>
            <div className="chief-active-fight-line chief-active-fight-line-head">
              <span className="chief-active-fight-number">{activeFight.ringOrder}</span>
              <div className="chief-active-fight-names">
                <strong className="chief-active-fight-name-red">{activeFight.redText}</strong>
                <span>VS</span>
                <strong className="chief-active-fight-name-blue">{activeFight.blueText}</strong>
              </div>
            </div>
            <div className="side-judge-fight-category">{activeFight.gridName}</div>
            <div className="side-judge-round-cards">
              {(["1", "2", "3"] as const).filter((round) => (
                submittedRounds.has(round) || nextRound === round
              )).map((round) => {
                const isSubmitted = submittedRounds.has(round);
                const isAvailable = nextRound === round;

                return (
                  <button
                    key={round}
                    type="button"
                    className={`side-judge-round-card${isSubmitted ? " side-judge-round-card-submitted" : ""}`}
                    disabled={!isAvailable}
                    onClick={() => onRoundSelect(round)}
                  >
                    <strong>Раунд {round}</strong>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p>Нет активного боя.</p>
        )}
      </section>
    </div>
  );
}
