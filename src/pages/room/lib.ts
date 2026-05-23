import type { Fight, Grid, RoomBoxer } from "../../features/auth/authApi";

export type DraftGridSlot = RoomBoxer | null;

export function getBracketColumnSize(count: number) {
  if (count <= 0) {
    return 0;
  }

  let size = 2;

  while (size < count && size < 32) {
    size *= 2;
  }

  return Math.min(size, 32);
}

export function getBracketStageLabel(size: number) {
  switch (size) {
    case 32:
      return "1/16";
    case 16:
      return "1/8";
    case 8:
      return "1/4";
    case 4:
      return "1/2";
    case 2:
      return "final";
    default:
      return "";
  }
}

export function gridFightsByGrid(fights: Fight[]) {
  return fights.reduce<Record<string, Fight[]>>((acc, fight) => {
    acc[fight.grid] = [...(acc[fight.grid] ?? []), fight];
    return acc;
  }, {});
}

export const fightStageOrder: Record<string, number> = {
  "1/32": 0,
  "1/16": 1,
  "1/8": 2,
  "1/4": 3,
  "1/2": 4,
  final: 5,
};

export const fightStageLabels: Record<string, string> = {
  "1/32": "1/32",
  "1/16": "1/16",
  "1/8": "1/8",
  "1/4": "1/4",
  "1/2": "1/2",
  final: "Финал",
};

export function normalizeGridSlots(gridBoxers: DraftGridSlot[]) {
  const occupiedCount = gridBoxers.filter(Boolean).length;
  const targetSize = getBracketColumnSize(occupiedCount);
  const nextGridBoxers = [...gridBoxers];

  while (nextGridBoxers.length < targetSize) {
    nextGridBoxers.push(null);
  }

  while (nextGridBoxers.length > targetSize && nextGridBoxers[nextGridBoxers.length - 1] === null) {
    nextGridBoxers.pop();
  }

  return nextGridBoxers;
}

export function createInitialGridSlots(gridBoxers: DraftGridSlot[]) {
  const occupiedGridBoxers = gridBoxers.filter((gridBoxer): gridBoxer is RoomBoxer => Boolean(gridBoxer));
  const targetSize = getBracketColumnSize(occupiedGridBoxers.length);

  if (!targetSize) {
    return [];
  }

  const fullPairsCount = Math.max(0, occupiedGridBoxers.length - targetSize / 2);
  const nextGridBoxers: DraftGridSlot[] = [];
  let boxerIndex = 0;

  for (let pairIndex = 0; pairIndex < fullPairsCount; pairIndex += 1) {
    nextGridBoxers.push(occupiedGridBoxers[boxerIndex] ?? null);
    nextGridBoxers.push(occupiedGridBoxers[boxerIndex + 1] ?? null);
    boxerIndex += 2;
  }

  while (nextGridBoxers.length < targetSize) {
    nextGridBoxers.push(occupiedGridBoxers[boxerIndex] ?? null);
    nextGridBoxers.push(null);
    boxerIndex += 1;
  }

  return nextGridBoxers;
}

export function hasDoubleByePair(gridBoxers: DraftGridSlot[]) {
  for (let index = 0; index < gridBoxers.length; index += 2) {
    if ((gridBoxers[index] ?? null) === null && (gridBoxers[index + 1] ?? null) === null) {
      return true;
    }
  }

  return false;
}

export function normalizePairPosition(gridBoxers: DraftGridSlot[], slotIndex: number) {
  const pairStartIndex = slotIndex % 2 === 0 ? slotIndex : slotIndex - 1;
  const firstPairSlot = gridBoxers[pairStartIndex] ?? null;
  const secondPairSlot = gridBoxers[pairStartIndex + 1] ?? null;

  if (!firstPairSlot && secondPairSlot) {
    gridBoxers[pairStartIndex] = secondPairSlot;
    gridBoxers[pairStartIndex + 1] = null;
  }
}

export function getDraftBoxerList(gridBoxers: DraftGridSlot[]) {
  return gridBoxers.flatMap((gridBoxer) => (gridBoxer ? [gridBoxer.uuid] : []));
}

export function areGridSlotsEqual(left: DraftGridSlot[], right: DraftGridSlot[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((gridBoxer, index) => (gridBoxer?.uuid ?? null) === (right[index]?.uuid ?? null));
}

export function areBoxerSetsEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightIds = new Set(right);
  return left.every((boxerUuid) => rightIds.has(boxerUuid));
}

export function getSyncedGridSlots(
  grid: Grid,
  boxerById: Map<string, RoomBoxer>,
  builtGridFights: Record<string, Fight[]>,
) {
  const savedBoxerIds = (grid.boxer_list ?? []).filter((boxerUuid): boxerUuid is string => Boolean(boxerUuid));
  const savedGridBoxers = (grid.boxer_list ?? [])
    .map((boxerUuid) => (boxerUuid ? boxerById.get(boxerUuid) ?? null : null))
    .filter((boxer): boxer is RoomBoxer => Boolean(boxer));
  const initialGridSlots = createInitialGridSlots(savedGridBoxers);
  const builtFights = builtGridFights[grid.uuid] ?? [];
  const firstBuiltStageOrder = builtFights.length
    ? Math.min(...builtFights.map((fight) => fightStageOrder[fight.stage] ?? 99))
    : null;
  const builtGridBoxers = firstBuiltStageOrder === null
    ? []
    : builtFights
        .filter((fight) => (fightStageOrder[fight.stage] ?? 99) === firstBuiltStageOrder)
        .sort((left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0))
        .flatMap((fight) =>
          [...fight.slots]
            .sort((left, right) =>
              left.corner === right.corner ? 0 : left.corner === "red" ? -1 : 1,
            )
            .map((slot) => {
              const boxerUuid = slot.boxer ?? slot.resolved_boxer;
              return boxerUuid ? boxerById.get(boxerUuid) ?? null : null;
            }),
        );
  const builtGridBoxerIds = getDraftBoxerList(builtGridBoxers);
  const shouldUseBuiltGridBoxers =
    builtGridBoxers.length > 0 && areBoxerSetsEqual(builtGridBoxerIds, savedBoxerIds);

  return {
    savedBoxerIds,
    initialGridSlots,
    builtFights,
    firstBuiltStageOrder,
    builtGridBoxers,
    shouldUseBuiltGridBoxers,
    syncedGridSlots: shouldUseBuiltGridBoxers ? builtGridBoxers : initialGridSlots,
  };
}

export function getGridRingName(grid: Grid) {
  if (!grid.ring) {
    return "";
  }

  if (typeof grid.ring === "string") {
    return grid.ring;
  }

  return grid.ring.name;
}
