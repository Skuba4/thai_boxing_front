import type { ReactNode } from "react";
import type { Grid } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";

type PairsTabProps = {
  grids: Grid[];
  gridsState: RequestState;
  search: string;
  showSearch?: boolean;
  renderGrid: (grid: Grid) => ReactNode;
  onSearchChange: (value: string) => void;
};

export function PairsTab({
  grids,
  gridsState,
  search,
  showSearch = true,
  renderGrid,
  onSearchChange,
}: PairsTabProps) {
  return (
    <div className="ring-grids-section">
      {showSearch ? (
        <div className="room-boxers-toolbar">
          <input
            className="boxers-search"
            type="search"
            placeholder="Поиск"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      ) : null}

      {gridsState === "loading" ? <p className="panel-message">Загружаем сетки...</p> : null}

      {grids.length ? (
        <div className="ring-grids-list">
          {grids.map((grid) => renderGrid(grid))}
        </div>
      ) : null}
    </div>
  );
}
