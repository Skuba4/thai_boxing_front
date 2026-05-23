function getCurrentNoteDate() {
  return new Date().toLocaleDateString("ru-RU");
}

function renderGridNameLines(gridName: string) {
  const match = gridName.match(/\(([^)]+)\)$/);

  if (!match) {
    return <span>{gridName}</span>;
  }

  return <span>{match[1].trim()}</span>;
}

export function JudgeNoteSheet({
  fightNumber,
  gridName,
  redName,
  blueName,
  roundLabel,
  redRemark,
  blueRemark,
  editableRemarks = false,
  onRedRemarkChange,
  onBlueRemarkChange,
}: {
  fightNumber: number | null;
  gridName: string;
  redName: string;
  blueName: string;
  roundLabel: string;
  redRemark: string;
  blueRemark: string;
  editableRemarks?: boolean;
  onRedRemarkChange?: (value: string) => void;
  onBlueRemarkChange?: (value: string) => void;
}) {
  const currentDate = getCurrentNoteDate();

  return (
    <article className="judge-note-sheet">
      <h5>СУДЕЙСКАЯ ЗАПИСКА</h5>
      <div className="judge-note-sheet-meta">
        <span>Дата: {currentDate}</span>
        <span>Бой № {fightNumber ?? ""}</span>
        <span className="judge-note-sheet-grid-name">{renderGridNameLines(gridName)}</span>
      </div>
      <div className="judge-note-sheet-fighters">
        <div className="judge-note-sheet-corner judge-note-sheet-corner-red">
          <span>{redName}</span>
        </div>
        <div className="judge-note-sheet-center">
          <span>vs</span>
        </div>
        <div className="judge-note-sheet-corner judge-note-sheet-corner-blue">
          <span>{blueName}</span>
        </div>
      </div>
      <div className="judge-note-sheet-table">
        <div className="judge-note-sheet-head">Замечания, предупреждения</div>
        <div className="judge-note-sheet-head">Раунд</div>
        <div className="judge-note-sheet-head">Замечания, предупреждения</div>
        <div className="judge-note-sheet-cell">
          {editableRemarks ? (
            <input
              className="judge-note-sheet-input"
              maxLength={20}
              value={redRemark}
              onChange={(event) => onRedRemarkChange?.(event.target.value)}
            />
          ) : (
            redRemark
          )}
        </div>
        <div className="judge-note-sheet-cell judge-note-sheet-round-cell">{roundLabel}</div>
        <div className="judge-note-sheet-cell">
          {editableRemarks ? (
            <input
              className="judge-note-sheet-input"
              maxLength={20}
              value={blueRemark}
              onChange={(event) => onBlueRemarkChange?.(event.target.value)}
            />
          ) : (
            blueRemark
          )}
        </div>
      </div>
    </article>
  );
}
