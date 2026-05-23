import { useState } from "react";
import type { FormEvent } from "react";
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRooms,
  type Room,
  updateRoom,
  updateRoomGrid,
} from "../features/auth/authApi";
import { useFlashMessageState } from "./alerts";
import { getErrorMessage } from "./homeErrors";
import type { RoomFormState } from "./homeForms";
import type { RoomPanelCache } from "./homePanelTypes";
import type { RequestState } from "./homeSharedTypes";
import { updateCollectionItem } from "./homeShared";

export function useHomeRooms() {
  const competitionsFlash = useFlashMessageState();
  const [roomsState, setRoomsState] = useState<RequestState>("idle");
  const [createRoomState, setCreateRoomState] = useState<RequestState>("idle");
  const [deleteRoomState, setDeleteRoomState] = useState<RequestState>("idle");
  const [updateRoomState, setUpdateRoomState] = useState<RequestState>("idle");
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [roomForm, setRoomForm] = useState<RoomFormState>({
    name: "",
    description: "",
    start_date: "",
    status: "0",
  });
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [pendingDeleteRoom, setPendingDeleteRoom] = useState<Room | null>(null);
  const [roomPanelCache, setRoomPanelCache] = useState<Record<string, RoomPanelCache>>({});

  async function loadRooms(accessToken?: string, shouldLoadMyRooms = false, activeRoomUuid?: string | null, openRoomUuids: string[] = [], setOpenRoomUuids?: (value: string[]) => void, setActiveRoomUuid?: (value: string | null) => void) {
    try {
      setRoomsState("loading");
      const nextAllRooms = await getAllRooms(accessToken);
      setAllRooms(nextAllRooms);
      let nextMyRooms: Room[] = [];
      if (accessToken && shouldLoadMyRooms) {
        try {
          nextMyRooms = await getRooms(accessToken);
        } catch {
          nextMyRooms = [];
        }
        setMyRooms(nextMyRooms);
      } else {
        setMyRooms([]);
      }
      const nextAvailableRooms = [...nextMyRooms, ...nextAllRooms.filter((room) => !nextMyRooms.some((myRoom) => myRoom.uuid === room.uuid))];
      const nextOpenRoomUuids = openRoomUuids.filter((roomUuid) => nextAvailableRooms.some((room) => room.uuid === roomUuid));
      setOpenRoomUuids?.(nextOpenRoomUuids);
      if (activeRoomUuid && !nextAvailableRooms.some((room) => room.uuid === activeRoomUuid)) {
        setActiveRoomUuid?.(nextOpenRoomUuids[0] ?? null);
      }
      setRoomsState("success");
    } catch (error) {
      setRoomsState("error");
      competitionsFlash.setMessage(getErrorMessage(error));
    }
  }

  async function handleCreateRoom(event: FormEvent<HTMLFormElement>, accessToken: string) {
    event.preventDefault();
    try {
      setCreateRoomState("loading");
      const createdRoom = await createRoom(accessToken, roomForm);
      setMyRooms((current) => [createdRoom, ...current.filter((room) => room.uuid !== createdRoom.uuid)]);
      setAllRooms((current) => [createdRoom, ...current.filter((room) => room.uuid !== createdRoom.uuid)]);
      setCreateRoomState("success");
      setRoomForm({ name: "", description: "", start_date: "", status: "0" });
      setIsCreateRoomModalOpen(false);
      competitionsFlash.setMessage("Соревнование создано.");
    } catch (error) {
      setCreateRoomState("error");
      competitionsFlash.setMessage(getErrorMessage(error));
    }
  }

  async function handleDeleteRoom(roomUuid: string, accessToken: string, activeRoomUuid: string | null, openRoomUuids: string[], setOpenRoomUuids: (value: string[]) => void, setActiveRoomUuid: (value: string | null) => void, setActiveRoomRingName: (value: string | null) => void, setActiveTab: (value: "competitions" | "competition-room" | "athletes" | "profile") => void) {
    try {
      setDeleteRoomState("loading");
      setDeletingRoomId(roomUuid);
      await deleteRoom(accessToken, roomUuid);
      setMyRooms((current) => current.filter((room) => room.uuid !== roomUuid));
      setAllRooms((current) => current.filter((room) => room.uuid !== roomUuid));
      const nextOpenRoomUuids = openRoomUuids.filter((uuid) => uuid !== roomUuid);
      setOpenRoomUuids(nextOpenRoomUuids);
      setRoomPanelCache((current) => {
        const nextCache = { ...current };
        delete nextCache[roomUuid];
        return nextCache;
      });
      if (activeRoomUuid === roomUuid) {
        setActiveRoomUuid(null);
        setActiveRoomRingName(null);
        setActiveTab("competitions");
      }
      setPendingDeleteRoom(null);
      setDeleteRoomState("success");
      competitionsFlash.setMessage("Соревнование удалено.");
    } catch (error) {
      setDeleteRoomState("error");
      competitionsFlash.setMessage(getErrorMessage(error));
    } finally {
      setDeletingRoomId(null);
    }
  }

  async function handleUpdateRoom(event: FormEvent<HTMLFormElement>, accessToken: string) {
    event.preventDefault();
    if (!editingRoomId) return;
    try {
      setUpdateRoomState("loading");
      const updatedRoom = await updateRoom(accessToken, editingRoomId, roomForm);
      setMyRooms((current) => updateCollectionItem(current, editingRoomId, updatedRoom));
      setAllRooms((current) => updateCollectionItem(current, editingRoomId, updatedRoom));
      setRoomForm({
        name: updatedRoom.name,
        description: updatedRoom.description ?? "",
        start_date: updatedRoom.start_date,
        status: updatedRoom.status,
      });
      setUpdateRoomState("success");
      competitionsFlash.setMessage("Соревнование обновлено.");
    } catch (error) {
      setUpdateRoomState("error");
      competitionsFlash.setMessage(getErrorMessage(error));
    }
  }

  async function saveDraftMoves(accessToken: string, roomUuid: string, cache: RoomPanelCache | undefined) {
    const draftMovesByTargetGrid = cache?.draftMovesByTargetGrid ?? {};
    for (const [gridId, boxerList] of Object.entries(draftMovesByTargetGrid)) {
      await updateRoomGrid(accessToken, roomUuid, gridId, { boxer_list: boxerList });
    }
  }

  function patchRoom(roomUuid: string, patch: Partial<Room>) {
    setMyRooms((current) => current.map((room) => (room.uuid === roomUuid ? { ...room, ...patch } : room)));
    setAllRooms((current) => current.map((room) => (room.uuid === roomUuid ? { ...room, ...patch } : room)));
  }

  return {
    allRooms,
    competitionsMessage: competitionsFlash.message,
    competitionsMessageVersion: competitionsFlash.messageVersion,
    createRoomState,
    deleteRoomState,
    deletingRoomId,
    editingRoomId,
    handleCreateRoom,
    handleDeleteRoom,
    handleUpdateRoom,
    isCreateRoomModalOpen,
    loadRooms,
    myRooms,
    pendingDeleteRoom,
    patchRoom,
    roomForm,
    roomPanelCache,
    roomsState,
    saveDraftMoves,
    setAllRooms,
    setCompetitionsMessage: competitionsFlash.setMessage,
    setCreateRoomState,
    setDeleteRoomState,
    setEditingRoomId,
    setIsCreateRoomModalOpen,
    setMyRooms,
    setPendingDeleteRoom,
    setRoomForm,
    setRoomPanelCache,
    setRoomsState,
    updateRoomState,
  };
}
