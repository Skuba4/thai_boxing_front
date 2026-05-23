import type { Grid, JudgeApplication, Ring, Room, RoomApplication } from "../../features/auth/authApi";
import type { RoomAccessState } from "./scenario";
import { getVisibleRingTabs as getScenarioVisibleRingTabs } from "./scenario";
import { getGridRingName } from "./lib";
import type { RingGridOrderDrafts } from "./types";

const statusOrder = { "0": 0, Y: 1, N: 2 } as const;

function getApplicationName(application: RoomApplication | JudgeApplication) {
  return application.user ? `${application.user.first_name} ${application.user.last_name}` : application.uuid;
}

export function getRoomApplications(applications: RoomApplication[], roomUuid: string) {
  return applications
    .filter((application) => application.room === roomUuid)
    .sort((left, right) => {
      const statusDiff = statusOrder[left.status] - statusOrder[right.status];
      return statusDiff || getApplicationName(left).localeCompare(getApplicationName(right), "ru");
    });
}

export function getRoomJudgeApplications(applications: JudgeApplication[], roomUuid: string) {
  return applications
    .filter((application) => application.room === roomUuid)
    .sort((left, right) => {
      const statusDiff = statusOrder[left.status] - statusOrder[right.status];
      return statusDiff || getApplicationName(left).localeCompare(getApplicationName(right), "ru");
    });
}

export function getRingsView({
  access,
  rings,
  room,
}: {
  access: Pick<RoomAccessState, "isApprovedTrainer" | "isChiefJudge" | "isJudge" | "judgeRingName">;
  rings: Ring[];
  room: Room;
}) {
  return getScenarioVisibleRingTabs({ access, rings, room });
}

export function getGridLists({
  activeRingName,
  defaultRingGridOrders,
  draftRingGridOrders,
  gridSearch,
  grids,
  ringDetailSearch,
}: {
  activeRingName: string | null;
  defaultRingGridOrders: RingGridOrderDrafts;
  draftRingGridOrders: RingGridOrderDrafts;
  gridSearch: string;
  grids: Grid[];
  ringDetailSearch: string;
}) {
  const sortedGrids = [...grids].sort((left, right) => left.name.localeCompare(right.name, "ru"));
  const filteredSortedGrids = sortedGrids.filter((grid) =>
    grid.name.toLocaleLowerCase("ru").includes(gridSearch.trim().toLocaleLowerCase("ru")),
  );
  const visiblePairsGrids = filteredSortedGrids.filter((grid) => !getGridRingName(grid));
  const activeRingGrids = activeRingName
    ? (draftRingGridOrders[activeRingName] ?? defaultRingGridOrders[activeRingName] ?? [])
        .map((gridId) => sortedGrids.find((grid) => grid.uuid === gridId))
        .filter((grid): grid is Grid => Boolean(grid))
        .filter((grid) => getGridRingName(grid) === activeRingName)
    : [];
  const normalizedRingSearch = ringDetailSearch.trim().toLocaleLowerCase("ru");
  const filteredActiveRingGrids = normalizedRingSearch
    ? activeRingGrids.filter((grid) => grid.name.toLocaleLowerCase("ru").includes(normalizedRingSearch))
    : activeRingGrids;

  return {
    activeRingGrids,
    filteredActiveRingGrids,
    filteredSortedGrids,
    sortedGrids,
    visiblePairsGrids,
  };
}
