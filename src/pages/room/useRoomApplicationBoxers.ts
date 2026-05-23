import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  bulkCreateRoomBoxers,
  bulkDestroyRoomBoxers,
  createRoomApplication,
  deleteOwnRoomApplication,
  getBoxers,
  getOwnRoomApplication,
  type Boxer,
  type RoomApplicationStatus,
  type RoomBoxer,
  updateOwnRoomApplication,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import type { ApplicationBoxersMode, PendingApplicationAction } from "./types";

type State = "idle" | "loading" | "success" | "error";

export function useRoomApplicationBoxers({
  onGuestRoomStatusSync,
  currentUserEmail,
  fetchRoomBoxers,
  guestApplicationState,
  loadRoomBoxers,
  roomApplicationBoxersModalMode,
  roomUuid,
  selectedApplicationBoxerIds,
  setApplicationBoxers,
  setGuestApplicationState,
  setGuestRoomApplicationStatus,
  setIsRoomApplicationBoxersModalOpen,
  setMessage,
  setPendingApplicationAction,
  setRoomApplicationBoxersModalMode,
  setSelectedApplicationBoxerIds,
}: {
  onGuestRoomStatusSync: (status: RoomApplicationStatus | null) => void;
  currentUserEmail: string;
  fetchRoomBoxers: (accessToken: string, roomUuid: string) => Promise<RoomBoxer[]>;
  guestApplicationState: State;
  loadRoomBoxers: (accessToken: string, roomUuid?: string) => Promise<unknown>;
  roomApplicationBoxersModalMode: ApplicationBoxersMode;
  roomUuid: string;
  selectedApplicationBoxerIds: string[];
  setApplicationBoxers: Dispatch<SetStateAction<Boxer[]>>;
  setGuestApplicationState: Dispatch<SetStateAction<State>>;
  setGuestRoomApplicationStatus: Dispatch<SetStateAction<RoomApplicationStatus | null | undefined>>;
  setIsRoomApplicationBoxersModalOpen: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setPendingApplicationAction: Dispatch<SetStateAction<PendingApplicationAction | null>>;
  setRoomApplicationBoxersModalMode: Dispatch<SetStateAction<ApplicationBoxersMode>>;
  setSelectedApplicationBoxerIds: Dispatch<SetStateAction<string[]>>;
}) {
  async function withAccess<T>(handler: (accessToken: string) => Promise<T>) {
    const tokens = getAuthTokens();
    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return null;
    }

    return handler(tokens.access);
  }

  async function handleGuestApplication() {
    try {
      setGuestApplicationState("loading");
      setRoomApplicationBoxersModalMode("guest-apply");
      const boxers = await withAccess((accessToken) => getBoxers(accessToken));
      if (!boxers) return;
      setApplicationBoxers(boxers);
      setSelectedApplicationBoxerIds([]);
      setIsRoomApplicationBoxersModalOpen(true);
      setGuestApplicationState("idle");
    } catch (error) {
      setGuestApplicationState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleEditGuestApplication() {
    try {
      setGuestApplicationState("loading");
      const result = await withAccess((accessToken) =>
        Promise.all([getBoxers(accessToken), getOwnRoomApplication(accessToken, roomUuid)]),
      );
      if (!result) return;
      const [boxers, application] = result;
      setRoomApplicationBoxersModalMode("guest-edit");
      setApplicationBoxers(boxers);
      setSelectedApplicationBoxerIds((application.boxers ?? []).map((boxer) => boxer.uuid));
      setGuestRoomApplicationStatus(application.status);
      setIsRoomApplicationBoxersModalOpen(true);
      setGuestApplicationState("idle");
    } catch (error) {
      setGuestApplicationState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleOpenOwnerAddBoxers() {
    try {
      setGuestApplicationState("loading");
      await handleLoadOwnerRoomBoxers();
      setIsRoomApplicationBoxersModalOpen(true);
      setGuestApplicationState("idle");
    } catch (error) {
      setGuestApplicationState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleLoadOwnerRoomBoxers() {
    const result = await withAccess((accessToken) =>
      Promise.all([getBoxers(accessToken), fetchRoomBoxers(accessToken, roomUuid)]),
    );
    if (!result) return;

    const [boxers, roomBoxers] = result;
    const ownerRoomBoxerKeys = new Set(
      roomBoxers
        .filter((roomBoxer) => roomBoxer.trainer?.email === currentUserEmail)
        .map((roomBoxer) =>
          [
            roomBoxer.first_name,
            roomBoxer.last_name,
            roomBoxer.middle_name ?? "",
            roomBoxer.sex,
            roomBoxer.rank,
            roomBoxer.weight,
          ].join("|"),
        ),
    );

    setRoomApplicationBoxersModalMode("owner-add");
    setApplicationBoxers(boxers);
    setSelectedApplicationBoxerIds(
      boxers
        .filter((boxer) =>
          ownerRoomBoxerKeys.has(
            [boxer.first_name, boxer.last_name, boxer.middle_name ?? "", boxer.sex, boxer.rank, boxer.weight].join("|"),
          ),
        )
        .map((boxer) => boxer.uuid),
    );
  }

  function handleToggleApplicationBoxer(boxerUuid: string) {
    setSelectedApplicationBoxerIds((current) =>
      current.includes(boxerUuid) ? current.filter((uuid) => uuid !== boxerUuid) : [...current, boxerUuid],
    );
  }

  function handleCloseRoomApplicationBoxersModal() {
    if (guestApplicationState === "loading") return;
    setIsRoomApplicationBoxersModalOpen(false);
    setSelectedApplicationBoxerIds([]);
  }

  async function handleDeleteGuestApplication() {
    const previousStatus: RoomApplicationStatus | null = "0";

    try {
      const tokens = getAuthTokens();
      if (!tokens?.access) {
        setMessage("Сессия истекла.");
        return;
      }

      setGuestApplicationState("loading");
      setGuestRoomApplicationStatus(null);
      onGuestRoomStatusSync(null);
      await deleteOwnRoomApplication(tokens.access, roomUuid);
      setIsRoomApplicationBoxersModalOpen(false);
      setSelectedApplicationBoxerIds([]);
      setMessage("Заявка удалена.");
      setGuestApplicationState("success");
    } catch (error) {
      setGuestRoomApplicationStatus(previousStatus);
      onGuestRoomStatusSync(previousStatus);
      setGuestApplicationState("error");
      setMessage(getErrorMessage(error));
    } finally {
      setGuestApplicationState("idle");
    }
  }

  async function handleSaveOwnerRoomBoxers() {
    try {
      setGuestApplicationState("loading");
      const result = await withAccess(async (accessToken) => {
        await bulkCreateRoomBoxers(accessToken, roomUuid, { boxer_ids: selectedApplicationBoxerIds });
        await loadRoomBoxers(accessToken, roomUuid);
      });
      if (result === null) return;
      setMessage("Спортсмены сохранены.");
      setIsRoomApplicationBoxersModalOpen(false);
      setSelectedApplicationBoxerIds([]);
      setGuestApplicationState("success");
    } catch (error) {
      setGuestApplicationState("error");
      setMessage(getErrorMessage(error));
    } finally {
      setGuestApplicationState("idle");
    }
  }

  async function handleSubmitRoomApplicationBoxers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (roomApplicationBoxersModalMode === "owner-add") {
        setPendingApplicationAction({ type: "save-mine" });
        return;
      }

      setGuestApplicationState("loading");
      const response = await withAccess((accessToken) =>
        roomApplicationBoxersModalMode === "guest-edit"
          ? updateOwnRoomApplication(accessToken, roomUuid, { boxer_ids: selectedApplicationBoxerIds })
          : createRoomApplication(accessToken, roomUuid, { boxer_ids: selectedApplicationBoxerIds }),
      );
      if (!response) return;

      setGuestRoomApplicationStatus("0");
      onGuestRoomStatusSync("0");
      setMessage(response.detail ?? (roomApplicationBoxersModalMode === "guest-edit" ? "Заявка обновлена." : "Заявка отправлена."));
      setIsRoomApplicationBoxersModalOpen(false);
      setSelectedApplicationBoxerIds([]);
      setGuestApplicationState("success");
    } catch (error) {
      setGuestApplicationState("error");
      setMessage(getErrorMessage(error));
    } finally {
      if (roomApplicationBoxersModalMode !== "owner-add") {
        setGuestApplicationState("idle");
      }
    }
  }

  async function handleClearOwnerRoomBoxers() {
    try {
      setGuestApplicationState("loading");
      const result = await withAccess(async (accessToken) => {
        await bulkDestroyRoomBoxers(accessToken, roomUuid);
        await loadRoomBoxers(accessToken, roomUuid);
      });
      if (result === null) return;
      setSelectedApplicationBoxerIds([]);
      setMessage("Свои спортсмены удалены.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setGuestApplicationState("idle");
    }
  }

  return {
    handleClearOwnerRoomBoxers,
    handleCloseRoomApplicationBoxersModal,
    handleDeleteGuestApplication,
    handleEditGuestApplication,
    handleGuestApplication,
    handleLoadOwnerRoomBoxers,
    handleOpenOwnerAddBoxers,
    handleSaveOwnerRoomBoxers,
    handleSubmitRoomApplicationBoxers,
    handleToggleApplicationBoxer,
  };
}
