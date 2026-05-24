import type { Dispatch, SetStateAction } from "react";
import {
  deleteRoomApplication,
  type Boxer,
  type JudgeApplication,
  type RoomApplication,
  type RoomApplicationStatus,
  type RoomBoxer,
  type RoomJudge,
  updateRoomApplication,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import { updateCollectionItem } from "../homeShared";
import type {
  ApplicationBoxersMode,
  PendingApplicationAction,
  PendingJudgeApplicationAction,
} from "./types";
import { useRoomApplicationBoxers } from "./useRoomApplicationBoxers";
import { useJudgeApplications } from "./useJudgeApplications";

type State = "idle" | "loading" | "success" | "error";

export function useRoomApplications({
  onGuestRoomStatusSync,
  onGuestJudgeSync,
  currentUserEmail,
  fetchRoomBoxers,
  guestApplicationState,
  loadRoomBoxers,
  pendingApplicationAction,
  pendingJudgeApplicationAction,
  roomApplicationBoxersModalMode,
  roomUuid,
  selectedApplicationBoxerIds,
  setApplicationBoxers,
  setApplications,
  setGuestApplicationState,
  setGuestJudge,
  setGuestJudgeApplicationState,
  setGuestRoomApplicationStatus,
  setIsRoomApplicationBoxersModalOpen,
  setJudgeApplications,
  setMessage,
  setPendingApplicationAction,
  setPendingJudgeApplicationAction,
  setRoomApplicationBoxersModalMode,
  setSelectedApplicationBoxerIds,
  setUpdateState,
  setUpdatingApplicationId,
  setUpdatingJudgeApplicationId,
}: {
  onGuestRoomStatusSync: (status: RoomApplicationStatus | null) => void;
  onGuestJudgeSync: (judge: RoomJudge | null) => void;
  currentUserEmail: string;
  fetchRoomBoxers: (accessToken: string, roomUuid: string) => Promise<RoomBoxer[]>;
  guestApplicationState: State;
  loadRoomBoxers: (accessToken: string, roomUuid?: string) => Promise<unknown>;
  pendingApplicationAction: PendingApplicationAction | null;
  pendingJudgeApplicationAction: PendingJudgeApplicationAction | null;
  roomApplicationBoxersModalMode: ApplicationBoxersMode;
  roomUuid: string;
  selectedApplicationBoxerIds: string[];
  setApplicationBoxers: Dispatch<SetStateAction<Boxer[]>>;
  setApplications: Dispatch<SetStateAction<RoomApplication[]>>;
  setGuestApplicationState: Dispatch<SetStateAction<State>>;
  setGuestJudge: Dispatch<SetStateAction<Pick<JudgeApplication, "status" | "role" | "ring" | "is_active"> | null>>;
  setGuestJudgeApplicationState: Dispatch<SetStateAction<State>>;
  setGuestRoomApplicationStatus: Dispatch<SetStateAction<RoomApplicationStatus | null | undefined>>;
  setIsRoomApplicationBoxersModalOpen: Dispatch<SetStateAction<boolean>>;
  setJudgeApplications: Dispatch<SetStateAction<JudgeApplication[]>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setPendingApplicationAction: Dispatch<SetStateAction<PendingApplicationAction | null>>;
  setPendingJudgeApplicationAction: Dispatch<SetStateAction<PendingJudgeApplicationAction | null>>;
  setRoomApplicationBoxersModalMode: Dispatch<SetStateAction<ApplicationBoxersMode>>;
  setSelectedApplicationBoxerIds: Dispatch<SetStateAction<string[]>>;
  setUpdateState: Dispatch<SetStateAction<State>>;
  setUpdatingApplicationId: Dispatch<SetStateAction<string | null>>;
  setUpdatingJudgeApplicationId: Dispatch<SetStateAction<string | null>>;
}) {
  const {
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
  } = useRoomApplicationBoxers({
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
  });

  const {
    handleConfirmJudgeApplicationAction,
    handleDeleteJudgeApplication,
    handleJudgeApplicationStatusChange,
  } = useJudgeApplications({
    pendingJudgeApplicationAction,
    roomUuid,
    onGuestJudgeSync,
    setGuestJudge,
    setGuestJudgeApplicationState,
    setJudgeApplications,
    setMessage,
    setPendingJudgeApplicationAction,
    setUpdateState,
    setUpdatingJudgeApplicationId,
  });

  async function handleApplicationStatusChange(applicationUuid: string, status: RoomApplicationStatus) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      setUpdatingApplicationId(applicationUuid);
      const updatedApplication = await updateRoomApplication(tokens.access, roomUuid, applicationUuid, status);
      setApplications((current) => updateCollectionItem(current, applicationUuid, updatedApplication));
      await loadRoomBoxers(tokens.access, roomUuid);
      setMessage("Статус заявки обновлен.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
      setUpdatingApplicationId(null);
    }
  }

  async function handleDeleteApplication(applicationUuid: string) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      setUpdatingApplicationId(applicationUuid);
      await deleteRoomApplication(tokens.access, roomUuid, applicationUuid);
      setApplications((current) => current.filter((application) => application.uuid !== applicationUuid));
      await loadRoomBoxers(tokens.access, roomUuid);
      setMessage("Заявка удалена.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
      setUpdatingApplicationId(null);
    }
  }

  async function handleConfirmPendingApplicationAction() {
    if (!pendingApplicationAction) return;
    const action = pendingApplicationAction;
    setPendingApplicationAction(null);

    if (action.type === "approve" || action.type === "refresh-one") return handleApplicationStatusChange(action.applicationUuid, "Y");
    if (action.type === "reject") return handleApplicationStatusChange(action.applicationUuid, "N");
    if (action.type === "wait") return handleApplicationStatusChange(action.applicationUuid, "0");
    if (action.type === "save-mine") return handleSaveOwnerRoomBoxers();
    if (action.type === "clear-mine") return handleClearOwnerRoomBoxers();

    await handleDeleteApplication(action.applicationUuid);
  }

  return {
    handleApplicationStatusChange,
    handleClearOwnerRoomBoxers,
    handleCloseRoomApplicationBoxersModal,
    handleConfirmJudgeApplicationAction,
    handleConfirmPendingApplicationAction,
    handleDeleteApplication,
    handleDeleteGuestApplication,
    handleDeleteJudgeApplication,
    handleEditGuestApplication,
    handleGuestApplication,
    handleLoadOwnerRoomBoxers,
    handleJudgeApplicationStatusChange,
    handleOpenOwnerAddBoxers,
    handleSubmitRoomApplicationBoxers,
    handleToggleApplicationBoxer,
  };
}
