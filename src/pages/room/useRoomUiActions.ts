import type { Dispatch, SetStateAction } from "react";
import type { Ring, Room, RoomBoxer } from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getRoomTabStorageKey } from "./constants";
import type { OwnerTab, PendingDraftAction, RoomTab } from "./types";

export function useRoomUiActions({
  activeRingHasDraftMoves,
  boxers,
  hasDraftMoves,
  loadGuestRoomBoxers,
  loadRoomBoxers,
  onActiveRingNameChange,
  ownerTab,
  room,
  setActiveRing,
  setOwnerTab,
  setPendingDraftAction,
  setSelectedBoxerIds,
}: {
  activeRingHasDraftMoves: boolean;
  boxers: RoomBoxer[];
  hasDraftMoves: boolean;
  loadGuestRoomBoxers: () => Promise<unknown>;
  loadRoomBoxers: (accessToken: string, roomUuid?: string) => Promise<unknown>;
  onActiveRingNameChange: (ringName: string | null) => void;
  ownerTab: OwnerTab;
  room: Room;
  setActiveRing: Dispatch<SetStateAction<Ring | null>>;
  setOwnerTab: Dispatch<SetStateAction<OwnerTab>>;
  setPendingDraftAction: Dispatch<SetStateAction<PendingDraftAction | null>>;
  setSelectedBoxerIds: Dispatch<SetStateAction<string[]>>;
}) {
  function handleToggleBoxerSelection(boxerUuid: string) {
    const boxer = boxers.find((item) => item.uuid === boxerUuid);
    if (!boxer?.is_available) return;

    setSelectedBoxerIds((current) =>
      current.includes(boxerUuid) ? current.filter((id) => id !== boxerUuid) : [...current, boxerUuid],
    );
  }

  function handleOwnerTabChange(nextTab: RoomTab) {
    if (ownerTab === "pairs" && hasDraftMoves && nextTab !== "pairs") {
      setPendingDraftAction({ type: "tab", tab: nextTab });
      return;
    }

    if (ownerTab === "ring-detail" && activeRingHasDraftMoves) {
      setPendingDraftAction({ type: "tab", tab: nextTab });
      return;
    }

    const tokens = getAuthTokens();
    sessionStorage.setItem(getRoomTabStorageKey(room.uuid), nextTab);
    setOwnerTab(nextTab);
    setActiveRing(null);
    onActiveRingNameChange(null);

    if (nextTab === "participants" && tokens?.access) {
      if (room.is_owner) {
        void loadRoomBoxers(tokens.access, room.uuid);
      } else {
        void loadGuestRoomBoxers();
      }
    }
  }

  return {
    handleOwnerTabChange,
    handleToggleBoxerSelection,
  };
}
