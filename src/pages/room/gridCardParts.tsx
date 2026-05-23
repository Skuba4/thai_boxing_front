/* eslint-disable react-refresh/only-export-components */
import type { DragEvent, ReactNode } from "react";
import type { Fight, RoomBoxer } from "../../features/auth/authApi";
import { getBoxerFullName, getBoxerRankClassName } from "../homeBoxers";
import type { RequestState } from "../homeSharedTypes";
import { fightStageLabels, fightStageOrder, getBracketStageLabel, normalizeGridSlots } from "./lib";
import type { DraftGridSlot } from "./lib";
import type { DraggingGridBoxer, DropTarget } from "./types";

export function getGridFirstStageBoxers(
  builtFights: Fight[],
  boxerById: Map<string, RoomBoxer>,
  boxerList: Array<string | null> | null | undefined,
) {
  const firstBuiltStageOrder = builtFights.length
    ? Math.min(...builtFights.map((fight) => fightStageOrder[fight.stage] ?? 99))
    : null;
  const firstStageFights = firstBuiltStageOrder === null
    ? []
    : [...builtFights]
        .filter((fight) => (fightStageOrder[fight.stage] ?? 99) === firstBuiltStageOrder)
        .sort((left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0));
  const firstStageBoxers = firstBuiltStageOrder === null
    ? normalizeGridSlots(
        (boxerList ?? [])
          .map((boxerUuid) => (boxerUuid ? boxerById.get(boxerUuid) ?? null : null))
          .filter((boxer): boxer is RoomBoxer => Boolean(boxer)),
      )
    : firstStageFights.flatMap((fight) =>
        [...fight.slots]
          .sort((left, right) => (left.corner === right.corner ? 0 : left.corner === "red" ? -1 : 1))
          .map((slot) => {
            const boxerUuid = slot.boxer ?? slot.resolved_boxer;
            return boxerUuid ? boxerById.get(boxerUuid) ?? null : null;
          }),
      );

  return {
    firstBuiltStageOrder,
    firstStageBoxers,
    firstStageFights,
  };
}

export function getBuiltGridStages(builtFights: Fight[], firstBuiltStageOrder: number | null) {
  const builtFightsByStage = builtFights.reduce<Record<string, Fight[]>>((acc, fight) => {
    const stage = fight.stage ?? "";
    acc[stage] = [...(acc[stage] ?? []), fight];
    return acc;
  }, {});

  return Object.entries(builtFightsByStage)
    .filter(
      ([stage]) =>
        firstBuiltStageOrder === null ||
        (fightStageOrder[stage] ?? 99) !== firstBuiltStageOrder,
    )
    .sort(
      ([leftStage], [rightStage]) =>
        (fightStageOrder[leftStage] ?? 99) - (fightStageOrder[rightStage] ?? 99),
    );
}

export function getFinalFight(builtFights: Fight[]) {
  return [...builtFights]
    .filter((fight) => fight.stage === "final")
    .sort((left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0))[0] ?? null;
}

export function getFightMaps(builtFights: Fight[]) {
  return {
    fightById: new Map(builtFights.map((fight) => [fight.uuid, fight])),
    displayFightNumberById: new Map(
      [...builtFights]
        .sort((left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0))
        .map((fight, index) => [fight.uuid, index + 1]),
    ),
  };
}

export function getWinnerText(
  finalFight: Fight | null,
  boxerById: Map<string, RoomBoxer>,
  displayFightNumberById: Map<string, number>,
) {
  if (!finalFight) {
    return null;
  }

  if (finalFight.winner) {
    const boxer = boxerById.get(finalFight.winner);
    return boxer ? (
      <span title={getBoxerFullName(boxer)}>{getBoxerFullName(boxer)}</span>
    ) : finalFight.winner;
  }

  return `Победитель боя ${displayFightNumberById.get(finalFight.uuid) ?? "?"}`;
}

export function getFightSlotTitle(
  slot: Fight["slots"][number],
  boxerById: Map<string, RoomBoxer>,
  fightById: Map<string, Fight>,
  displayFightNumberById: Map<string, number>,
) {
  const boxerUuid = slot.resolved_boxer ?? slot.boxer;

  if (boxerUuid) {
    const boxer = boxerById.get(boxerUuid);
    return boxer ? getBoxerFullName(boxer) : boxerUuid;
  }

  if (slot.source_fight) {
    const sourceFight = fightById.get(slot.source_fight);
    return `Победитель боя ${sourceFight ? (displayFightNumberById.get(sourceFight.uuid) ?? "?") : slot.source_fight}`;
  }

  return "BYE";
}

export function getFightSlotText(
  slot: Fight["slots"][number],
  boxerById: Map<string, RoomBoxer>,
  fightById: Map<string, Fight>,
  displayFightNumberById: Map<string, number>,
) {
  const boxerUuid = slot.resolved_boxer ?? slot.boxer;

  if (boxerUuid) {
    const boxer = boxerById.get(boxerUuid);
    return boxer ? <RankedName boxer={boxer} /> : boxerUuid;
  }

  if (slot.source_fight) {
    const sourceFight = fightById.get(slot.source_fight);
    return `Победитель боя ${sourceFight ? (displayFightNumberById.get(sourceFight.uuid) ?? "?") : slot.source_fight}`;
  }

  return "BYE";
}

export function BuiltGridView({
  builtStages,
  boxerById,
  displayFightNumberById,
  fightById,
  winnerText,
}: {
  builtStages: Array<[string, Fight[]]>;
  boxerById: Map<string, RoomBoxer>;
  displayFightNumberById: Map<string, number>;
  fightById: Map<string, Fight>;
  winnerText: ReactNode;
}) {
  if (!builtStages.length && !winnerText) {
    return null;
  }

  return (
    <div className="ring-grid-built">
      {builtStages.map(([stage, fights]) => (
        <div key={stage} className="ring-grid-built-stage">
          <span className="ring-grid-built-stage-title">
            {fightStageLabels[stage] ?? stage}
          </span>
          <div className="ring-grid-built-list">
            {[...fights]
              .sort((left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0))
              .map((fight) => {
                const sortedSlots = [...fight.slots].sort((left, right) =>
                  left.corner === right.corner ? 0 : left.corner === "red" ? -1 : 1,
                );

                return (
                  <div key={fight.uuid} className="ring-grid-built-fight">
                    <span className="ring-grid-built-fight-number">
                      {displayFightNumberById.get(fight.uuid) ?? "?"}
                    </span>
                    <div className="ring-grid-built-fight-slots">
                      {sortedSlots.map((slot) => (
                        <span
                          key={`${fight.uuid}-${slot.corner}`}
                          className={`ring-grid-built-slot ring-grid-built-slot-${slot.corner}`}
                          title={getFightSlotTitle(slot, boxerById, fightById, displayFightNumberById)}
                        >
                          {getFightSlotText(slot, boxerById, fightById, displayFightNumberById)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
      {winnerText ? (
        <div className="ring-grid-built-stage">
          <span className="ring-grid-built-stage-title">Победитель</span>
          <div className="ring-grid-built-winner" title={typeof winnerText === "string" ? winnerText : undefined}>
            {winnerText}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ReadonlyGridBoxer({
  boxer,
  color,
}: {
  boxer: RoomBoxer | null;
  color: "red" | "blue";
}) {
  return (
    <div className={`ring-grid-boxer-row ring-grid-boxer-row-${color} ring-grid-boxer-row-readonly`}>
      <div className="ring-grid-boxer-meta">
        <strong className="ring-grid-boxer-name" title={boxer ? getBoxerFullName(boxer) : "BYE"}>
          {boxer ? <RankedName boxer={boxer} /> : (
            <span className="ring-grid-boxer-name-text ring-grid-boxer-name-text-bye">BYE</span>
          )}
        </strong>
      </div>
    </div>
  );
}

export function EditableGridBoxerSlot({
  boxer,
  color,
  draggingGridBoxer,
  dropTarget,
  gridId,
  gridState,
  isOwner,
  readOnly,
  slotIndex,
  onDeleteDraftBoxer,
  onDragEnd,
  onDragStart,
  onDrop,
  onDropTargetChange,
}: {
  boxer: RoomBoxer | null;
  color: "red" | "blue";
  draggingGridBoxer: DraggingGridBoxer;
  dropTarget: DropTarget;
  gridId: string;
  gridState: RequestState;
  isOwner: boolean;
  readOnly: boolean;
  slotIndex: number;
  onDeleteDraftBoxer: (gridId: string, boxerUuid: string) => void;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, gridId: string, boxerUuid: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, gridId: string, slotIndex: number) => void;
  onDropTargetChange: (target: DropTarget) => void;
}) {
  return (
    <div
      className={`ring-grid-boxer-row ring-grid-boxer-row-${color}${
        draggingGridBoxer?.boxerUuid === boxer?.uuid ? " ring-grid-boxer-row-dragging" : ""
      }${
        dropTarget?.type === "slot" &&
        dropTarget?.gridId === gridId &&
        dropTarget?.slotIndex === slotIndex
          ? " ring-grid-boxer-row-target"
          : ""
      }`}
      draggable={Boolean(isOwner && !readOnly && boxer)}
      onDragStart={(event) => {
        if (boxer && !readOnly) {
          onDragStart(event, gridId, boxer.uuid);
        }
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!isOwner || readOnly || !draggingGridBoxer || draggingGridBoxer.gridId !== gridId) {
          return;
        }

        event.preventDefault();
        onDropTargetChange({ type: "slot", gridId, slotIndex });
      }}
      onDragLeave={() => {
        if (dropTarget?.type === "slot" && dropTarget?.gridId === gridId && dropTarget?.slotIndex === slotIndex) {
          onDropTargetChange(null);
        }
      }}
      onDrop={(event) => {
        event.stopPropagation();
        if (!readOnly) {
          onDrop(event, gridId, slotIndex);
        }
      }}
    >
      <div className="ring-grid-boxer-meta">
        <strong className="ring-grid-boxer-name" title={boxer ? getBoxerFullName(boxer) : "BYE"}>
          {boxer ? <RankedName boxer={boxer} /> : <span className="ring-grid-boxer-name-text">BYE</span>}
        </strong>
        {isOwner && !readOnly && boxer ? (
          <button
            type="button"
            className="ring-grid-boxer-delete room-card-action-button room-card-action-button-danger"
            onClick={() => onDeleteDraftBoxer(gridId, boxer.uuid)}
            disabled={gridState === "loading"}
            aria-label="Удалить участника из сетки"
          >
            {gridState === "loading" ? "…" : "✕"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function RankedName({ boxer }: { boxer: RoomBoxer }) {
  return (
    <>
      <span className={`ring-grid-rank-letter ${getBoxerRankClassName(boxer.rank)}`}>{boxer.rank}</span>
      <span title={getBoxerFullName(boxer)}>{getBoxerFullName(boxer)}</span>
    </>
  );
}

export function getGridPairs(boxers: Array<RoomBoxer | DraftGridSlot | null>) {
  return Array.from(
    { length: Math.ceil(boxers.length / 2) },
    (_, pairIndex) => boxers.slice(pairIndex * 2, pairIndex * 2 + 2),
  );
}

export function getGridStageLabel(boxers: Array<RoomBoxer | DraftGridSlot | null>) {
  return getBracketStageLabel(boxers.length);
}
