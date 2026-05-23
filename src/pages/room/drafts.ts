import type { Fight, Grid, Ring, RoomBoxer } from "../../features/auth/authApi";
import { isByeFight } from "./fights";
import {
  areGridSlotsEqual,
  getDraftBoxerList,
  getGridRingName,
  getSyncedGridSlots,
  normalizeGridSlots,
} from "./lib";
import type { DraftGridSlot } from "./lib";
import type { RingGridOrderDrafts } from "./types";

export function getChangedDraftGrids({
  boxerById,
  builtGridFights,
  draftGridBoxers,
  grids,
}: {
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  grids: Grid[];
}) {
  const nextMap = new Map<string, string[]>();

  for (const grid of grids) {
    const draftGrid = draftGridBoxers[grid.uuid];

    if (!draftGrid) {
      continue;
    }

    const { syncedGridSlots } = getSyncedGridSlots(grid, boxerById, builtGridFights);

    if (!areGridSlotsEqual(normalizeGridSlots(draftGrid), normalizeGridSlots(syncedGridSlots))) {
      nextMap.set(grid.uuid, getDraftBoxerList(draftGrid));
    }
  }

  return nextMap;
}

export function getDefaultRingGridOrders({
  builtGridFights,
  grids,
  rings,
}: {
  builtGridFights: Record<string, Fight[]>;
  grids: Grid[];
  rings: Ring[];
}) {
  const nextOrders: RingGridOrderDrafts = {};
  const nameSortedGrids = [...grids].sort((left, right) => left.name.localeCompare(right.name, "ru"));

  for (const ring of rings) {
    nextOrders[ring.name] = nameSortedGrids
      .filter((grid) => getGridRingName(grid) === ring.name)
      .sort((left, right) => compareRingGridOrder(left, right, builtGridFights))
      .map((grid) => grid.uuid);
  }

  return nextOrders;
}

export function hasRingOrderDraft({
  activeRingName,
  defaultRingGridOrders,
  draftRingGridOrders,
  isOwner,
  ownerTab,
  savedRingGridOrders,
}: {
  activeRingName: string | null;
  defaultRingGridOrders: RingGridOrderDrafts;
  draftRingGridOrders: RingGridOrderDrafts;
  isOwner: boolean;
  ownerTab: string;
  savedRingGridOrders: RingGridOrderDrafts;
}) {
  if (ownerTab !== "ring-detail" || !isOwner || !activeRingName) {
    return false;
  }

  const draftOrder = draftRingGridOrders[activeRingName] ?? defaultRingGridOrders[activeRingName] ?? [];
  const savedOrder = savedRingGridOrders[activeRingName] ?? defaultRingGridOrders[activeRingName] ?? [];

  return draftOrder.length !== savedOrder.length || draftOrder.some((gridId, index) => gridId !== savedOrder[index]);
}

export function getRingFightOrderPayload({
  activeRingName,
  builtGridFights,
  currentOrder,
  grids,
}: {
  activeRingName: string;
  builtGridFights: Record<string, Fight[]>;
  currentOrder: string[];
  grids: Grid[];
}) {
  const gridById = new Map(grids.map((grid) => [grid.uuid, grid]));
  const fights: Record<string, number> = {};
  let ringOrder = 1;

  for (const gridId of currentOrder) {
    const grid = gridById.get(gridId);

    if (!grid || getGridRingName(grid) !== activeRingName) {
      continue;
    }

    const orderedFights = [...(builtGridFights[grid.uuid] ?? [])].sort(
      (left, right) => (left.grid_order ?? 0) - (right.grid_order ?? 0),
    );

    for (const fight of orderedFights) {
      if (isByeFight(fight)) {
        continue;
      }

      fights[fight.uuid] = ringOrder;
      ringOrder += 1;
    }
  }

  return fights;
}

function compareRingGridOrder(left: Grid, right: Grid, builtGridFights: Record<string, Fight[]>) {
  const leftOrder = getGridRingOrderValue(left, builtGridFights);
  const rightOrder = getGridRingOrderValue(right, builtGridFights);

  if (leftOrder !== null && rightOrder !== null && leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  if (leftOrder !== null && rightOrder === null) {
    return -1;
  }

  if (leftOrder === null && rightOrder !== null) {
    return 1;
  }

  return left.name.localeCompare(right.name, "ru");
}

function getGridRingOrderValue(grid: Grid, builtGridFights: Record<string, Fight[]>) {
  const ringOrders = (builtGridFights[grid.uuid] ?? [])
    .map((fight) => fight.ring_order)
    .filter((ringOrder): ringOrder is number => ringOrder !== null);

  return ringOrders.length ? Math.min(...ringOrders) : null;
}
