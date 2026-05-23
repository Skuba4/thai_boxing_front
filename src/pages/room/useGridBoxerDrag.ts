import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";
import type { Fight, Grid, RoomBoxer } from "../../features/auth/authApi";
import {
  getSyncedGridSlots,
  normalizeGridSlots,
  normalizePairPosition,
} from "./lib";
import type { DraftGridSlot } from "./lib";
import type { DraggingGridBoxer, DropTarget } from "./types";

export function useGridBoxerDrag({
  boxerById,
  builtGridFights,
  draftGridBoxersRef,
  draggingGridBoxer,
  grids,
  setDraftGridBoxers,
  setDraggingGridBoxer,
  setDropTarget,
}: {
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  draftGridBoxersRef: MutableRefObject<Record<string, DraftGridSlot[]>>;
  draggingGridBoxer: DraggingGridBoxer;
  grids: Grid[];
  setDraftGridBoxers: Dispatch<SetStateAction<Record<string, DraftGridSlot[]>>>;
  setDraggingGridBoxer: Dispatch<SetStateAction<DraggingGridBoxer>>;
  setDropTarget: Dispatch<SetStateAction<DropTarget>>;
}) {
  function moveGridBoxer(
    sourceGridId: string,
    sourceBoxerUuid: string,
    targetGridId: string,
    targetSlotIndex: number | null,
  ) {
    const current = draftGridBoxersRef.current;
    const sourceGrid = grids.find((grid) => grid.uuid === sourceGridId);
    const targetGrid = grids.find((grid) => grid.uuid === targetGridId);
    const sourceGridBoxers = normalizeGridSlots(
      current[sourceGridId] ??
        (sourceGrid ? getSyncedGridSlots(sourceGrid, boxerById, builtGridFights).syncedGridSlots : []),
    );
    const targetGridBoxers =
      sourceGridId === targetGridId
        ? sourceGridBoxers
        : normalizeGridSlots(
            current[targetGridId] ??
              (targetGrid ? getSyncedGridSlots(targetGrid, boxerById, builtGridFights).syncedGridSlots : []),
          );
    const sourceIndex = sourceGridBoxers.findIndex((gridBoxer) => gridBoxer?.uuid === sourceBoxerUuid);
    if (sourceIndex === -1) return;

    const nextSourceGridBoxers = [...sourceGridBoxers];
    const movedGridBoxer = nextSourceGridBoxers[sourceIndex];
    if (!movedGridBoxer) return;

    const sourcePairStartIndex = sourceIndex % 2 === 0 ? sourceIndex : sourceIndex - 1;
    nextSourceGridBoxers[sourceIndex] = null;
    let resolvedTargetSlotIndex = targetSlotIndex;

    if (resolvedTargetSlotIndex !== null) {
      const pairStartIndex = resolvedTargetSlotIndex % 2 === 0 ? resolvedTargetSlotIndex : resolvedTargetSlotIndex - 1;
      const pairSlots = sourceGridId === targetGridId ? nextSourceGridBoxers : targetGridBoxers;
      const firstPairSlot = pairSlots[pairStartIndex] ?? null;
      const secondPairSlot = pairSlots[pairStartIndex + 1] ?? null;

      if (!firstPairSlot && !secondPairSlot) resolvedTargetSlotIndex = pairStartIndex;
    }

    if (sourceGridId === targetGridId) {
      const targetPairStartIndex =
        resolvedTargetSlotIndex === null
          ? null
          : resolvedTargetSlotIndex % 2 === 0
            ? resolvedTargetSlotIndex
            : resolvedTargetSlotIndex - 1;

      if (resolvedTargetSlotIndex === null) {
        nextSourceGridBoxers.push(movedGridBoxer);
      } else {
        const targetGridBoxer = nextSourceGridBoxers[resolvedTargetSlotIndex] ?? null;
        nextSourceGridBoxers[sourceIndex] = targetGridBoxer;
        nextSourceGridBoxers[resolvedTargetSlotIndex] = movedGridBoxer;
      }

      if (targetPairStartIndex === null || targetPairStartIndex !== sourcePairStartIndex) {
        normalizePairPosition(nextSourceGridBoxers, sourcePairStartIndex);
      }

      const nextState = { ...current, [sourceGridId]: normalizeGridSlots(nextSourceGridBoxers) };
      draftGridBoxersRef.current = nextState;
      setDraftGridBoxers(nextState);
      return;
    }

    const nextTargetGridBoxers = [...targetGridBoxers];

    if (resolvedTargetSlotIndex === null) {
      nextTargetGridBoxers.push(movedGridBoxer);
      normalizePairPosition(nextSourceGridBoxers, sourcePairStartIndex);

      const nextState = {
        ...current,
        [sourceGridId]: normalizeGridSlots(nextSourceGridBoxers),
        [targetGridId]: normalizeGridSlots(nextTargetGridBoxers),
      };
      draftGridBoxersRef.current = nextState;
      setDraftGridBoxers(nextState);
      return;
    }

    const targetGridBoxer = nextTargetGridBoxers[resolvedTargetSlotIndex] ?? null;
    if (targetGridBoxer) nextSourceGridBoxers[sourceIndex] = targetGridBoxer;

    nextTargetGridBoxers[resolvedTargetSlotIndex] = movedGridBoxer;
    normalizePairPosition(nextSourceGridBoxers, sourcePairStartIndex);

    const nextState = {
      ...current,
      [sourceGridId]: normalizeGridSlots(nextSourceGridBoxers),
      [targetGridId]: normalizeGridSlots(nextTargetGridBoxers),
    };
    draftGridBoxersRef.current = nextState;
    setDraftGridBoxers(nextState);
  }

  function handleGridBoxerDragStart(event: DragEvent<HTMLDivElement>, gridId: string, boxerUuid: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", boxerUuid);
    setDraggingGridBoxer({ gridId, boxerUuid });
  }

  function handleGridBoxerDragEnd() {
    setDraggingGridBoxer(null);
    setDropTarget(null);
  }

  function handleGridBoxerDrop(event: DragEvent<HTMLDivElement>, targetGridId: string, targetSlotIndex: number | null) {
    event.preventDefault();

    if (!draggingGridBoxer) return;

    if (draggingGridBoxer.gridId !== targetGridId) {
      setDraggingGridBoxer(null);
      setDropTarget(null);
      return;
    }

    moveGridBoxer(draggingGridBoxer.gridId, draggingGridBoxer.boxerUuid, targetGridId, targetSlotIndex);
    setDraggingGridBoxer(null);
    setDropTarget(null);
  }

  return {
    handleGridBoxerDragEnd,
    handleGridBoxerDragStart,
    handleGridBoxerDrop,
  };
}
