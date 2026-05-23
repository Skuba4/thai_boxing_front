import type { Dispatch, SetStateAction } from "react";
import {
  createJudgeApplication,
  deleteJudgeApplication,
  deleteOwnJudgeApplication,
  type JudgeApplication,
  type RoomApplicationStatus,
  updateJudgeApplication,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import { updateCollectionItem } from "../homeShared";
import type { PendingJudgeApplicationAction } from "./types";

type State = "idle" | "loading" | "success" | "error";

export function useJudgeApplications({
  pendingJudgeApplicationAction,
  roomUuid,
  setGuestJudge,
  setGuestJudgeApplicationState,
  setJudgeApplications,
  setMessage,
  setPendingJudgeApplicationAction,
  setUpdateState,
  setUpdatingJudgeApplicationId,
}: {
  pendingJudgeApplicationAction: PendingJudgeApplicationAction | null;
  roomUuid: string;
  setGuestJudge: Dispatch<SetStateAction<Pick<JudgeApplication, "status" | "role" | "ring" | "is_active"> | null>>;
  setGuestJudgeApplicationState: Dispatch<SetStateAction<State>>;
  setJudgeApplications: Dispatch<SetStateAction<JudgeApplication[]>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setPendingJudgeApplicationAction: Dispatch<SetStateAction<PendingJudgeApplicationAction | null>>;
  setUpdateState: Dispatch<SetStateAction<State>>;
  setUpdatingJudgeApplicationId: Dispatch<SetStateAction<string | null>>;
}) {
  async function handleConfirmJudgeApplicationAction() {
    if (!pendingJudgeApplicationAction) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setGuestJudgeApplicationState("loading");

      if (pendingJudgeApplicationAction === "create") {
        const response = await createJudgeApplication(tokens.access, roomUuid);
        setGuestJudge({ status: "0", role: "side", ring: "", is_active: false });
        setMessage(response.detail ?? "Заявка на судейство отправлена.");
      } else {
        await deleteOwnJudgeApplication(tokens.access, roomUuid);
        setGuestJudge(null);
        setMessage("Заявка на судейство удалена.");
      }

      setPendingJudgeApplicationAction(null);
      setGuestJudgeApplicationState("success");
    } catch (error) {
      setGuestJudgeApplicationState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleJudgeApplicationStatusChange(
    applicationUuid: string,
    payload: {
      status?: RoomApplicationStatus;
      ring?: JudgeApplication["ring"];
      role?: JudgeApplication["role"];
      is_active?: boolean;
    },
  ) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      setUpdatingJudgeApplicationId(applicationUuid);
      const updatedApplication = await updateJudgeApplication(tokens.access, roomUuid, applicationUuid, payload);
      setJudgeApplications((current) => updateCollectionItem(current, applicationUuid, updatedApplication));
      setMessage("Статус судейской заявки обновлен.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
      setUpdatingJudgeApplicationId(null);
    }
  }

  async function handleDeleteJudgeApplication(applicationUuid: string) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      setUpdatingJudgeApplicationId(applicationUuid);
      await deleteJudgeApplication(tokens.access, roomUuid, applicationUuid);
      setJudgeApplications((current) => current.filter((application) => application.uuid !== applicationUuid));
      setMessage("Судейская заявка удалена.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
      setUpdatingJudgeApplicationId(null);
    }
  }

  return {
    handleConfirmJudgeApplicationAction,
    handleDeleteJudgeApplication,
    handleJudgeApplicationStatusChange,
  };
}
