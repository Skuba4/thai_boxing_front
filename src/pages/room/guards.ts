import type { Room, Ring } from "../../features/auth/authApi";
import type { RoomApplicationStatus } from "../../features/auth/authApi";
import { getRoomAccessState } from "./scenario";

export function getRoomAccess({
  guestRoomApplicationStatus,
  guestJudge,
  hasPremiumAccess,
  room,
  rings,
}: {
  guestRoomApplicationStatus: RoomApplicationStatus | null;
  guestJudge: Room["my_judge"];
  hasPremiumAccess: boolean;
  room: Room;
  rings: Ring[];
}) {
  return getRoomAccessState({ guestJudge, guestRoomApplicationStatus, hasPremiumAccess, room, rings });
}
