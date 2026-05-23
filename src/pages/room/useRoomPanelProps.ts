import type { Ring, Room } from "../../features/auth/authApi";
import type { RequestState } from "../homeSharedTypes";
import type { RoomPanelCache } from "../homePanelTypes";

type ModalsProps = Record<string, unknown>;

export function getWorkspaceProps(props: Record<string, unknown>) {
  return props;
}

export function getModalsProps(props: ModalsProps) {
  return props;
}

export type RoomPanelBaseProps = {
  activeRingName: string | null;
  cachedState?: RoomPanelCache;
  currentUserEmail: string;
  hasPremiumAccess: boolean;
  onActiveRingNameChange: (ringName: string | null) => void;
  onActiveRingsChange: (rings: Ring[]) => void;
  onCacheChange: (roomUuid: string, nextState: RoomPanelCache) => void;
  room: Room;
  status?: RequestState;
};
