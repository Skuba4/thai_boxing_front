import type { ReactNode } from "react";
import type { Grid } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import type { FightRow } from "../types";

type RingViewMode = "bracket" | "list";

type RingPublicPanelProps = {
  canSaveOrder: boolean;
  fightRows: FightRow[];
  gridState: RequestState;
  grids: Grid[];
  hasDraftOrder: boolean;
  search: string;
  viewMode: RingViewMode;
  renderGrid: (grid: Grid) => ReactNode;
  onSaveOrder: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: RingViewMode) => void;
};

export function RingPublicPanel({
  canSaveOrder,
  fightRows,
  gridState,
  grids,
  hasDraftOrder,
  search,
  viewMode,
  renderGrid,
  onSaveOrder,
  onSearchChange,
  onViewModeChange,
}: RingPublicPanelProps) {
  return (
    <>
      <div className="ring-detail-toolbar">
        <div className="ring-view-toggle" role="tablist" aria-label="Вид ринга">
          <button
            type="button"
            className={viewMode === "bracket" ? "ring-view-toggle-button ring-view-toggle-button-active" : "ring-view-toggle-button"}
            onClick={() => onViewModeChange("bracket")}
          >
            Сетка
          </button>
          <button
            type="button"
            className={viewMode === "list" ? "ring-view-toggle-button ring-view-toggle-button-active" : "ring-view-toggle-button"}
            onClick={() => onViewModeChange("list")}
          >
            Список
          </button>
        </div>
        <input
          className="boxers-search ring-detail-search"
          type="search"
          placeholder="Поиск"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {canSaveOrder ? (
          <button
            type="button"
            className="toolbar-action-button build-button"
            onClick={onSaveOrder}
            disabled={gridState === "loading" || !hasDraftOrder}
          >
            Сохранить порядок
          </button>
        ) : null}
      </div>

      {viewMode === "bracket" ? (
        <div className="ring-grids-list">
          {grids.map((grid) => renderGrid(grid))}
        </div>
      ) : (
        <div className="ring-fights-table">
          <div className="ring-fights-row ring-fights-row-head">
            <span aria-hidden="true" />
            <span>RED</span>
            <span>BLUE</span>
            <span>Победитель</span>
          </div>
          {fightRows.map((row) => (
            <div key={row.fight.uuid} className="ring-fights-row">
              <span>{row.ringOrder}</span>
              <span className={row.redText === "BYE" ? "ring-fights-bye" : "ring-fights-red"} title={row.redTitle}>{row.redContent}</span>
              <span className={row.blueText === "BYE" ? "ring-fights-bye" : "ring-fights-blue"} title={row.blueTitle}>{row.blueContent}</span>
              <span className={`ring-fights-winner ring-fights-winner-${row.winnerSide}`} title={row.winnerTitle}>{row.winnerContent}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
