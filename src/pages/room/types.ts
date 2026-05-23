import type { ReactNode } from "react";
import type { Fight, RoomBoxer } from "../../features/auth/authApi";

export type RoomTab = "applications" | "participants" | "pairs" | "rings";
export type OwnerTab = RoomTab | "ring-detail";

export type RoomBoxerSortField = "rank" | "weight" | "age" | "sex" | "club";
export type RoomBoxerSortDirection = "asc" | "desc";
export type RoomBoxerSortRule = {
  field: RoomBoxerSortField;
  direction: RoomBoxerSortDirection;
};

export type PendingApplicationAction =
  | { type: "approve"; applicationUuid: string }
  | { type: "refresh-one"; applicationUuid: string }
  | { type: "reject"; applicationUuid: string }
  | { type: "wait"; applicationUuid: string }
  | { type: "delete"; applicationUuid: string }
  | { type: "save-mine" }
  | { type: "clear-mine" };

export type PendingJudgeApplicationAction = "create" | "delete";

export type PendingDraftAction =
  | { type: "tab"; tab: RoomTab }
  | { type: "ring"; ringName: string }
  | { type: "delete-grid"; gridId: string };

export type DraggingGridBoxer = { gridId: string; boxerUuid: string } | null;
export type RingGridOrderDrafts = Record<string, string[]>;
export type ApplicationBoxersMode = "guest-apply" | "guest-edit" | "owner-add";

export type DropTarget =
  | { gridId: string; type: "slot"; slotIndex: number }
  | { gridId: string; type: "append" }
  | null;

export type FightRow = {
  fight: Fight;
  gridName: string;
  ringOrder: number;
  redText: string;
  blueText: string;
  winnerText: string;
  redRank: RoomBoxer["rank"] | null;
  blueRank: RoomBoxer["rank"] | null;
  redTitle: string;
  blueTitle: string;
  winnerTitle: string;
  redContent: ReactNode;
  blueContent: ReactNode;
  winnerContent: ReactNode;
  winnerSide: "red" | "blue" | "none";
};
