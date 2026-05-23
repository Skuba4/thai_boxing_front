import { useMemo } from "react";
import type { Fight, Grid, JudgeApplication, Ring, Room, RoomBoxer } from "../../features/auth/authApi";
import type { DraftGridSlot } from "./lib";
import type { RingGridOrderDrafts } from "./types";
import { filterFightRows, getFightNumberById, getFightRows } from "./fights";
import { getChangedDraftGrids } from "./drafts";
import { getGridLists, getRingsView } from "./selectors";

export function useRoomView({
  activeRing,
  boxerById,
  boxers,
  builtGridFights,
  defaultRingGridOrders,
  draftGridBoxers,
  draftRingGridOrders,
  gridSearch,
  grids,
  ringAccess,
  ringDetailSearch,
  rings,
  ringSideJudges,
  room,
  selectedBoxerIds,
  selectedChiefFightId,
  sideJudgeNotes,
}: {
  activeRing: Ring | null;
  boxerById: Map<string, RoomBoxer>;
  boxers: RoomBoxer[];
  builtGridFights: Record<string, Fight[]>;
  defaultRingGridOrders: RingGridOrderDrafts;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  draftRingGridOrders: RingGridOrderDrafts;
  gridSearch: string;
  grids: Grid[];
  ringAccess: Parameters<typeof getRingsView>[0]["access"];
  ringDetailSearch: string;
  rings: Ring[];
  ringSideJudges: JudgeApplication[];
  room: Room;
  selectedBoxerIds: string[];
  selectedChiefFightId: string | null;
  sideJudgeNotes: { round: "1" | "2" | "3" }[];
}) {
  const changedDraftGrids = useMemo(
    () => getChangedDraftGrids({ boxerById, builtGridFights, draftGridBoxers, grids }),
    [boxerById, builtGridFights, draftGridBoxers, grids],
  );
  const hasDraftMoves = changedDraftGrids.size > 0;
  const ringsView = getRingsView({ access: ringAccess, rings, room });
  const selectedBoxers = selectedBoxerIds
    .map((boxerId) => boxers.find((boxer) => boxer.uuid === boxerId))
    .filter((boxer): boxer is RoomBoxer => Boolean(boxer));
  const gridLists = useMemo(
    () =>
      getGridLists({
        activeRingName: activeRing?.name ?? null,
        defaultRingGridOrders,
        draftRingGridOrders,
        gridSearch,
        grids,
        ringDetailSearch,
      }),
    [activeRing?.name, defaultRingGridOrders, draftRingGridOrders, gridSearch, grids, ringDetailSearch],
  );
  const activeRingFightNumberById = useMemo(
    () => getFightNumberById(gridLists.activeRingGrids, builtGridFights),
    [gridLists.activeRingGrids, builtGridFights],
  );
  const activeRingFightRows = useMemo(
    () =>
      getFightRows({
        activeRingGrids: gridLists.activeRingGrids,
        boxerById,
        builtGridFights,
        fightNumberById: activeRingFightNumberById,
      }),
    [activeRingFightNumberById, gridLists.activeRingGrids, boxerById, builtGridFights],
  );
  const filteredActiveRingFightRows = useMemo(
    () => filterFightRows(activeRingFightRows, ringDetailSearch),
    [activeRingFightRows, ringDetailSearch],
  );
  const selectedChiefFightRow =
    activeRingFightRows.find((row) => row.fight.uuid === selectedChiefFightId) ?? activeRingFightRows[0] ?? null;
  const activeSideFightRow = activeRingFightRows.find((row) => row.fight.status === "active") ?? null;
  const submittedSideJudgeRounds = new Set(sideJudgeNotes.map((note) => note.round));
  const nextSideJudgeRound = (["1", "2", "3"] as const).find((round) => !submittedSideJudgeRounds.has(round)) ?? null;
  const activeRingSideJudges = activeRing ? ringSideJudges : [];
  const activeRingActiveSideJudges = activeRingSideJudges.filter((application) => application.is_active).slice(0, 3);
  const activeRingInactiveSideJudges = activeRingSideJudges.filter((application) => !application.is_active);
  const selectedChiefFightRedWinnerUuid =
    selectedChiefFightRow?.fight.slots[0]?.boxer ?? selectedChiefFightRow?.fight.slots[0]?.resolved_boxer ?? "";
  const selectedChiefFightBlueWinnerUuid =
    selectedChiefFightRow?.fight.slots[1]?.boxer ?? selectedChiefFightRow?.fight.slots[1]?.resolved_boxer ?? "";

  return {
    ...gridLists,
    ...ringsView,
    activeRingActiveSideJudges,
    activeRingFightNumberById,
    activeRingFightRows,
    activeRingInactiveSideJudges,
    activeSideFightRow,
    changedDraftGrids,
    filteredActiveRingFightRows,
    hasDraftMoves,
    nextSideJudgeRound,
    selectedBoxers,
    selectedChiefFightBlueWinnerUuid,
    selectedChiefFightRedWinnerUuid,
    selectedChiefFightRow,
    submittedSideJudgeRounds,
  };
}
