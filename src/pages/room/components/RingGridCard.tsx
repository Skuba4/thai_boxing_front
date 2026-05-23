import type { DragEvent } from "react";
import type { Fight, Grid, Ring, Room, RoomBoxer } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import { fightStageLabels, getGridRingName } from "../lib";
import {
  BuiltGridView,
  ReadonlyGridBoxer,
  getBuiltGridStages,
  getFinalFight,
  getFightMaps,
  getGridFirstStageBoxers,
  getGridPairs,
  getGridStageLabel,
  getWinnerText,
} from "../gridCardParts";

type RingGridCardProps = {
  activeFightNumberById: Map<string, number>;
  activeRings: Ring[];
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  draggingGridId: string | null;
  dropTargetId: string | null;
  grid: Grid;
  gridState: RequestState;
  room: Room;
  onAssignRing: (gridId: string, ringName: string) => void;
  onDragEnd: () => void;
  onDragLeave: (gridId: string) => void;
  onDragOver: (event: DragEvent<HTMLElement>, gridId: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, gridId: string) => void;
  onDrop: (event: DragEvent<HTMLElement>, gridId: string) => void;
};

export function RingGridCard({
  activeFightNumberById,
  activeRings,
  boxerById,
  builtGridFights,
  draggingGridId,
  dropTargetId,
  grid,
  gridState,
  room,
  onAssignRing,
  onDragEnd,
  onDragLeave,
  onDragOver,
  onDragStart,
  onDrop,
}: RingGridCardProps) {
  const builtFights = builtGridFights[grid.uuid] ?? [];
  const { firstBuiltStageOrder, firstStageBoxers, firstStageFights } = getGridFirstStageBoxers(
    builtFights,
    boxerById,
    grid.boxer_list,
  );
  const gridPairs = getGridPairs(firstStageBoxers);
  const stageLabel = getGridStageLabel(firstStageBoxers);
  const builtStages = getBuiltGridStages(builtFights, firstBuiltStageOrder);
  const { fightById } = getFightMaps(builtFights);
  const finalFight = getFinalFight(builtFights);
  const currentRingName = getGridRingName(grid);
  const winnerText = getWinnerText(finalFight, boxerById, activeFightNumberById);

  return (
    <article
      className={`ring-grid-card${draggingGridId === grid.uuid ? " ring-grid-card-dragging" : ""}${dropTargetId === grid.uuid ? " ring-grid-card-target" : ""}`}
      draggable={Boolean(room.is_owner)}
      onDragStart={(event) => onDragStart(event, grid.uuid)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOver(event, grid.uuid)}
      onDragLeave={() => onDragLeave(grid.uuid)}
      onDrop={(event) => onDrop(event, grid.uuid)}
    >
      <div className="ring-grid-header">
        <div className="ring-grid-header-main">
          <strong>{grid.name}</strong>
        </div>
        {room.is_owner ? (
          <div className="ring-grid-actions">
            <select
              className="grid-ring-select"
              value={currentRingName}
              onChange={(event) => onAssignRing(grid.uuid, event.target.value)}
              disabled={gridState === "loading"}
            >
              <option value="">Без ринга</option>
              {activeRings.map((ring) => (
                <option key={ring.name} value={ring.name}>
                  {ring.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="ring-grid-stage-flow">
        <div className="ring-grid-boxers">
          {stageLabel ? (
            <span className="ring-grid-built-stage-title">
              {fightStageLabels[stageLabel] ?? stageLabel}
            </span>
          ) : null}
          {gridPairs.map((pair, pairIndex) => (
            <div key={`${grid.uuid}-${pairIndex}`} className="ring-grid-pair">
              <span className="ring-grid-pair-badge">
                {firstStageFights[pairIndex]
                  ? (activeFightNumberById.get(firstStageFights[pairIndex].uuid) ?? "")
                  : pairIndex + 1}
              </span>
              <div className="ring-grid-pair-card">
                <ReadonlyGridBoxer boxer={pair[0] ?? null} color="red" />
                <ReadonlyGridBoxer boxer={pair[1] ?? null} color="blue" />
              </div>
            </div>
          ))}
        </div>
        <BuiltGridView
          builtStages={builtStages}
          boxerById={boxerById}
          displayFightNumberById={activeFightNumberById}
          fightById={fightById}
          winnerText={winnerText}
        />
      </div>
    </article>
  );
}
