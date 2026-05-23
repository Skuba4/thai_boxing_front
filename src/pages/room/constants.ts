import type { RoomTab } from "./types";

export const getRoomTabStorageKey = (roomUuid: string) => `front_room_tab_${roomUuid}`;

export const getDefaultRoomTab = (isOwner: boolean, canViewParticipants: boolean): RoomTab =>
  isOwner ? "applications" : canViewParticipants ? "participants" : "rings";

export const roundTimerOptions = [
  { label: "5 сек", seconds: 5 },
  { label: "1 мин", seconds: 60 },
  { label: "1.5 мин", seconds: 90 },
  { label: "2 мин", seconds: 120 },
  { label: "3 мин", seconds: 180 },
] as const;
