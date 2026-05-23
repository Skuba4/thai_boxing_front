import type { Fight, Grid, RoomBoxer } from "../../features/auth/authApi";
import { getBoxerFullName, getBoxerRankClassName } from "../homeBoxers";
import type { FightRow } from "./types";

export function isByeFight(fight: Fight) {
  return fight.slots.some((slot) => !slot.boxer && !slot.source_fight && !slot.resolved_boxer);
}

export function getFightNumberById(activeRingGrids: Grid[], builtGridFights: Record<string, Fight[]>) {
  const nextMap = new Map<string, number>();
  let fightNumber = 1;

  for (const grid of activeRingGrids) {
    for (const fight of getOrderedFights(builtGridFights[grid.uuid] ?? [])) {
      if (isByeFight(fight)) {
        continue;
      }

      nextMap.set(fight.uuid, fightNumber);
      fightNumber += 1;
    }
  }

  return nextMap;
}

export function getFightRows({
  activeRingGrids,
  boxerById,
  builtGridFights,
  fightNumberById,
}: {
  activeRingGrids: Grid[];
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  fightNumberById: Map<string, number>;
}) {
  const rows: FightRow[] = [];

  for (const grid of activeRingGrids) {
    const fightById = new Map((builtGridFights[grid.uuid] ?? []).map((fight) => [fight.uuid, fight]));

    for (const fight of getOrderedFights(builtGridFights[grid.uuid] ?? [])) {
      if (isByeFight(fight)) {
        continue;
      }

      rows.push(getFightRow({ boxerById, fight, fightById, fightNumberById, gridName: grid.name, rowOrder: rows.length + 1 }));
    }
  }

  return rows.sort((left, right) => left.ringOrder - right.ringOrder);
}

export function filterFightRows(rows: FightRow[], search: string) {
  const normalizedSearch = search.trim().toLocaleLowerCase("ru");

  if (!normalizedSearch) {
    return rows;
  }

  return rows.filter((row) =>
    [row.gridName, row.redText, row.blueText, row.winnerText, String(row.ringOrder)]
      .join(" ")
      .toLocaleLowerCase("ru")
      .includes(normalizedSearch),
  );
}

function getOrderedFights(fights: Fight[]) {
  return [...fights].sort((left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0));
}

function getFightRow({
  boxerById,
  fight,
  fightById,
  fightNumberById,
  gridName,
  rowOrder,
}: {
  boxerById: Map<string, RoomBoxer>;
  fight: Fight;
  fightById: Map<string, Fight>;
  fightNumberById: Map<string, number>;
  gridName: string;
  rowOrder: number;
}): FightRow {
  const sortedSlots = [...fight.slots].sort((left, right) =>
    left.corner === right.corner ? 0 : left.corner === "red" ? -1 : 1,
  );
  const redSlot = sortedSlots.find((slot) => slot.corner === "red");
  const blueSlot = sortedSlots.find((slot) => slot.corner === "blue");
  const winnerBoxer = fight.winner ? boxerById.get(fight.winner) : null;
  const winnerText = winnerBoxer ? getBoxerFullName(winnerBoxer) : "";
  const redWinnerUuid = redSlot?.boxer ?? redSlot?.resolved_boxer ?? null;
  const blueWinnerUuid = blueSlot?.boxer ?? blueSlot?.resolved_boxer ?? null;

  return {
    blueContent: blueSlot ? getSlotContent(blueSlot, boxerById, fightById, fightNumberById) : "BYE",
    blueRank: getSlotRank(blueSlot, boxerById),
    blueText: blueSlot ? getSlotText(blueSlot, boxerById, fightById, fightNumberById) : "BYE",
    blueTitle: blueSlot ? getSlotText(blueSlot, boxerById, fightById, fightNumberById) : "BYE",
    fight,
    gridName,
    redContent: redSlot ? getSlotContent(redSlot, boxerById, fightById, fightNumberById) : "BYE",
    redRank: getSlotRank(redSlot, boxerById),
    redText: redSlot ? getSlotText(redSlot, boxerById, fightById, fightNumberById) : "BYE",
    redTitle: redSlot ? getSlotText(redSlot, boxerById, fightById, fightNumberById) : "BYE",
    ringOrder: fightNumberById.get(fight.uuid) ?? rowOrder,
    winnerContent: winnerBoxer ? (
      <>
        <span className={`ring-fights-rank-letter ${getBoxerRankClassName(winnerBoxer.rank)}`}>{winnerBoxer.rank}</span>
        <span>{winnerText}</span>
      </>
    ) : "",
    winnerSide:
      fight.winner && fight.winner === redWinnerUuid
        ? "red"
        : fight.winner && fight.winner === blueWinnerUuid
          ? "blue"
          : "none",
    winnerText,
    winnerTitle: winnerText,
  };
}

function getSlotText(
  slot: Fight["slots"][number],
  boxerById: Map<string, RoomBoxer>,
  fightById: Map<string, Fight>,
  fightNumberById: Map<string, number>,
) {
  if (slot.resolved_boxer) {
    const boxer = boxerById.get(slot.resolved_boxer);
    return boxer ? getBoxerFullName(boxer) : slot.resolved_boxer;
  }

  if (slot.boxer) {
    const boxer = boxerById.get(slot.boxer);
    return boxer ? getBoxerFullName(boxer) : slot.boxer;
  }

  if (slot.source_fight) {
    const sourceFight = fightById.get(slot.source_fight);
    return `Победитель боя ${sourceFight ? (fightNumberById.get(sourceFight.uuid) ?? "?") : slot.source_fight}`;
  }

  return "BYE";
}

function getSlotRank(slot: Fight["slots"][number] | undefined, boxerById: Map<string, RoomBoxer>) {
  const boxerId = slot?.resolved_boxer ?? slot?.boxer;
  return boxerId ? boxerById.get(boxerId)?.rank ?? null : null;
}

function getSlotContent(
  slot: Fight["slots"][number],
  boxerById: Map<string, RoomBoxer>,
  fightById: Map<string, Fight>,
  fightNumberById: Map<string, number>,
) {
  if (slot.resolved_boxer) {
    const boxer = boxerById.get(slot.resolved_boxer);
    return boxer ? renderRankedName(boxer) : slot.resolved_boxer;
  }

  if (slot.boxer) {
    const boxer = boxerById.get(slot.boxer);
    return boxer ? renderRankedName(boxer) : slot.boxer;
  }

  if (slot.source_fight) {
    const sourceFight = fightById.get(slot.source_fight);
    return `Победитель боя ${sourceFight ? (fightNumberById.get(sourceFight.uuid) ?? "?") : slot.source_fight}`;
  }

  return "BYE";
}

function renderRankedName(boxer: RoomBoxer) {
  return (
    <>
      <span className={`ring-fights-rank-letter ${getBoxerRankClassName(boxer.rank)}`}>{boxer.rank}</span>
      <span>{getBoxerFullName(boxer)}</span>
    </>
  );
}
