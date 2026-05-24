import type { DragEvent } from "react";
import type { Fight, Grid, Ring, Room, RoomBoxer } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import {
  fightStageLabels,
  getGridRingName,
  getSyncedGridSlots,
  hasDoubleByePair,
  normalizeGridSlots,
} from "../lib";
import type { DraftGridSlot } from "../lib";
import type { DraggingGridBoxer, DropTarget, PendingDraftAction } from "../types";
import {
  BuiltGridView,
  EditableGridBoxerSlot,
  getBuiltGridStages,
  getFinalFight,
  getFightMaps,
  getGridPairs,
  getGridStageLabel,
  getWinnerText,
} from "../gridCardParts";

type GridCardProps = {
  activeRings: Ring[];
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  suppressDraft: boolean;
  draggingGridBoxer: DraggingGridBoxer;
  dropTarget: DropTarget;
  grid: Grid;
  gridState: RequestState;
  hasDraftMoves: boolean;
  readOnly: boolean;
  room: Room;
  showBuildButton: boolean;
  onAssignRing: (gridId: string, ringName: string) => void;
  onBuildGrid: (gridId: string, gridBoxers: DraftGridSlot[]) => void;
  onDeleteDraftBoxer: (gridId: string, boxerUuid: string) => void;
  onDeleteGrid: (gridId: string) => void;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, gridId: string, boxerUuid: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, gridId: string, slotIndex: number) => void;
  onPendingDraftAction: (action: PendingDraftAction) => void;
  onDropTargetChange: (target: DropTarget) => void;
};

function shouldDebugGridSync() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("debug-grid-sync") === "1";
}

export function GridCard({
  activeRings,
  boxerById,
  builtGridFights,
  draftGridBoxers,
  suppressDraft,
  draggingGridBoxer,
  dropTarget,
  grid,
  gridState,
  hasDraftMoves,
  readOnly,
  room,
  showBuildButton,
  onAssignRing,
  onBuildGrid,
  onDeleteDraftBoxer,
  onDeleteGrid,
  onDragEnd,
  onDragStart,
  onDrop,
  onPendingDraftAction,
  onDropTargetChange,
}: GridCardProps) {
  const {
    builtFights,
    firstBuiltStageOrder,
    builtGridBoxers,
    shouldUseBuiltGridBoxers,
    syncedGridSlots,
  } = getSyncedGridSlots(grid, boxerById, builtGridFights);
  const fallbackGridBoxers = normalizeGridSlots(
    (grid.boxer_list ?? [])
      .map((boxerUuid) => (boxerUuid ? boxerById.get(boxerUuid) ?? null : null))
      .filter((boxer): boxer is RoomBoxer => Boolean(boxer)),
  );
  const gridBoxers = readOnly
    ? shouldUseBuiltGridBoxers
      ? builtGridBoxers
      : fallbackGridBoxers
    : suppressDraft ? syncedGridSlots : (draftGridBoxers[grid.uuid] ?? syncedGridSlots);
  const gridPairs = getGridPairs(gridBoxers);
  const canBuildGrid = !hasDoubleByePair(gridBoxers);
  const stageLabel = getGridStageLabel(gridBoxers);
  const builtStages = getBuiltGridStages(builtFights, firstBuiltStageOrder);
  const { displayFightNumberById, fightById } = getFightMaps(builtFights);
  const finalFight = getFinalFight(builtFights);
  const currentRingName = getGridRingName(grid);
  const winnerText = getWinnerText(finalFight, boxerById, displayFightNumberById);
  if (shouldDebugGridSync() && room.is_owner && !readOnly) {
    console.log("[grid-render]", {
      gridId: grid.uuid,
      gridName: grid.name,
      gridBoxerIds: gridBoxers.map((gridBoxer) => gridBoxer?.uuid ?? null),
      draftGridBoxerIds: (draftGridBoxers[grid.uuid] ?? []).map((gridBoxer) => gridBoxer?.uuid ?? null),
      syncedGridSlotIds: syncedGridSlots.map((gridBoxer) => gridBoxer?.uuid ?? null),
      builtGridBoxerIds: builtGridBoxers.map((gridBoxer) => gridBoxer?.uuid ?? null),
      rawBoxerList: grid.boxer_list,
      builtFightCount: builtFights.length,
      shouldUseBuiltGridBoxers,
    });
  }

  return (
    <article className="ring-grid-card">
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
            {showBuildButton ? (
              <button
                type="button"
                className="toolbar-action-button build-button"
                onClick={() => onBuildGrid(grid.uuid, gridBoxers)}
                disabled={gridState === "loading" || !canBuildGrid}
              >
                Построить
              </button>
            ) : null}
            {showBuildButton ? (
              <button
                type="button"
                className="room-card-action-button room-card-action-button-danger boxer-action-button"
                onClick={() => {
                  if (hasDraftMoves) {
                    onPendingDraftAction({ type: "delete-grid", gridId: grid.uuid });
                    return;
                  }

                  onDeleteGrid(grid.uuid);
                }}
                disabled={gridState === "loading"}
                aria-label="Удалить сетку"
              >
                {gridState === "loading" ? "…" : "✕"}
              </button>
            ) : null}
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
          {gridPairs.map((pair, pairIndex) => {
            const firstSlotIndex = pairIndex * 2;
            const secondSlotIndex = firstSlotIndex + 1;

            return (
              <div key={`${grid.uuid}-${pairIndex}`} className="ring-grid-pair">
                <span className="ring-grid-pair-badge">{pairIndex + 1}</span>
                <div className="ring-grid-pair-card">
                  <EditableGridBoxerSlot
                    boxer={pair[0] ?? null}
                    color="red"
                    draggingGridBoxer={draggingGridBoxer}
                    dropTarget={dropTarget}
                    gridId={grid.uuid}
                    gridState={gridState}
                    isOwner={room.is_owner}
                    readOnly={readOnly}
                    slotIndex={firstSlotIndex}
                    onDeleteDraftBoxer={onDeleteDraftBoxer}
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                    onDropTargetChange={onDropTargetChange}
                  />
                  <EditableGridBoxerSlot
                    boxer={pair[1] ?? null}
                    color="blue"
                    draggingGridBoxer={draggingGridBoxer}
                    dropTarget={dropTarget}
                    gridId={grid.uuid}
                    gridState={gridState}
                    isOwner={room.is_owner}
                    readOnly={readOnly}
                    slotIndex={secondSlotIndex}
                    onDeleteDraftBoxer={onDeleteDraftBoxer}
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                    onDropTargetChange={onDropTargetChange}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <BuiltGridView
          builtStages={builtStages}
          boxerById={boxerById}
          displayFightNumberById={displayFightNumberById}
          fightById={fightById}
          winnerText={winnerText}
        />
      </div>
    </article>
  );
}
