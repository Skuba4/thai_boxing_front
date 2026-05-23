import type { Dispatch, DragEvent, SetStateAction } from "react";
import type { Fight, Grid, Ring, Room, RoomBoxer } from "../../features/auth/authApi";
import type { DraftGridSlot } from "./lib";
import type { DraggingGridBoxer, DropTarget, PendingDraftAction } from "./types";
import { GridCard } from "./components/GridCard";
import { RingGridCard } from "./components/RingGridCard";

type State = "idle" | "loading" | "success" | "error";

export function useGridRenderers({
  activeFightNumberById,
  activeRings,
  boxerById,
  builtGridFights,
  draftGridBoxers,
  draggingGridBoxer,
  draggingRingGridId,
  dropTarget,
  gridState,
  hasDraftMoves,
  moveRingGrid,
  ringGridDropTargetId,
  room,
  setDraggingRingGridId,
  setDropTarget,
  setPendingDraftAction,
  setRingGridDropTargetId,
  onAssignGridRing,
  onBuildGrid,
  onDeleteDraftGridBoxer,
  onDeleteGrid,
  onGridBoxerDragEnd,
  onGridBoxerDragStart,
  onGridBoxerDrop,
}: {
  activeFightNumberById: Map<string, number>;
  activeRings: Ring[];
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  draggingGridBoxer: DraggingGridBoxer;
  draggingRingGridId: string | null;
  dropTarget: DropTarget;
  gridState: State;
  hasDraftMoves: boolean;
  moveRingGrid: (sourceGridId: string, targetGridId: string) => void;
  ringGridDropTargetId: string | null;
  room: Room;
  setDraggingRingGridId: Dispatch<SetStateAction<string | null>>;
  setDropTarget: Dispatch<SetStateAction<DropTarget>>;
  setPendingDraftAction: Dispatch<SetStateAction<PendingDraftAction | null>>;
  setRingGridDropTargetId: Dispatch<SetStateAction<string | null>>;
  onAssignGridRing: (gridId: string, ringName: string) => Promise<void>;
  onBuildGrid: (gridId: string, gridBoxers: DraftGridSlot[]) => Promise<void>;
  onDeleteDraftGridBoxer: (gridId: string, boxerUuid: string) => void;
  onDeleteGrid: (gridId: string) => Promise<void>;
  onGridBoxerDragEnd: () => void;
  onGridBoxerDragStart: (event: DragEvent<HTMLDivElement>, gridId: string, boxerUuid: string) => void;
  onGridBoxerDrop: (event: DragEvent<HTMLDivElement>, gridId: string, slotIndex: number | null) => void;
}) {
  function renderGridCard(grid: Grid, options: { showBuildButton: boolean; readOnly: boolean }) {
    return (
      <GridCard
        key={grid.uuid}
        activeRings={activeRings}
        boxerById={boxerById}
        builtGridFights={builtGridFights}
        draftGridBoxers={draftGridBoxers}
        draggingGridBoxer={draggingGridBoxer}
        dropTarget={dropTarget}
        grid={grid}
        gridState={gridState}
        hasDraftMoves={hasDraftMoves}
        readOnly={options.readOnly}
        room={room}
        showBuildButton={options.showBuildButton}
        onAssignRing={(gridId, ringName) => void onAssignGridRing(gridId, ringName)}
        onBuildGrid={(gridId, gridBoxers) => void onBuildGrid(gridId, gridBoxers)}
        onDeleteDraftBoxer={onDeleteDraftGridBoxer}
        onDeleteGrid={(gridId) => void onDeleteGrid(gridId)}
        onDragEnd={onGridBoxerDragEnd}
        onDragStart={onGridBoxerDragStart}
        onDrop={onGridBoxerDrop}
        onPendingDraftAction={setPendingDraftAction}
        onDropTargetChange={setDropTarget}
      />
    );
  }

  function renderRingGridCard(grid: Grid) {
    return (
      <RingGridCard
        key={grid.uuid}
        activeFightNumberById={activeFightNumberById}
        activeRings={activeRings}
        boxerById={boxerById}
        builtGridFights={builtGridFights}
        draggingGridId={draggingRingGridId}
        dropTargetId={ringGridDropTargetId}
        grid={grid}
        gridState={gridState}
        room={room}
        onAssignRing={(gridId, ringName) => void onAssignGridRing(gridId, ringName)}
        onDragStart={(event, gridId) => {
          if (!room.is_owner) return;
          event.dataTransfer.effectAllowed = "move";
          setDraggingRingGridId(gridId);
          setRingGridDropTargetId(gridId);
        }}
        onDragEnd={() => {
          setDraggingRingGridId(null);
          setRingGridDropTargetId(null);
        }}
        onDragOver={(event, gridId) => {
          if (!room.is_owner || !draggingRingGridId || draggingRingGridId === gridId) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setRingGridDropTargetId(gridId);
        }}
        onDragLeave={(gridId) => {
          if (ringGridDropTargetId === gridId && draggingRingGridId !== gridId) {
            setRingGridDropTargetId(null);
          }
        }}
        onDrop={(event, gridId) => {
          if (!room.is_owner || !draggingRingGridId) return;
          event.preventDefault();
          moveRingGrid(draggingRingGridId, gridId);
          setDraggingRingGridId(null);
          setRingGridDropTargetId(null);
        }}
      />
    );
  }

  return { renderGridCard, renderRingGridCard };
}
