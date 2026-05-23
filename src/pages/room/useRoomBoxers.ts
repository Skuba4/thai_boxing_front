import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  deleteRoomBoxer,
  type RoomBoxer,
  type RoomBoxerPayload,
  updateRoomBoxer,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { capitalizeFirstLetter, getEmptyRoomBoxerForm, normalizeWeightInput } from "../homeBoxers";
import { getErrorMessage } from "../homeErrors";
import type { RoomBoxerFormState } from "../homeForms";
import { updateCollectionItem } from "../homeShared";

type State = "idle" | "loading" | "success" | "error";

export function useRoomBoxers({
  boxers,
  editingBoxerForm,
  editingBoxerId,
  loadPairsData,
  roomUuid,
  setBoxers,
  setDeleteState,
  setDeletingBoxerId,
  setEditingBoxerForm,
  setEditingBoxerId,
  setMessage,
  setSelectedBoxerIds,
  setUpdateState,
}: {
  boxers: RoomBoxer[];
  editingBoxerForm: RoomBoxerFormState;
  editingBoxerId: string | null;
  loadPairsData: (accessToken: string, roomUuid?: string) => Promise<unknown>;
  roomUuid: string;
  setBoxers: Dispatch<SetStateAction<RoomBoxer[]>>;
  setDeleteState: Dispatch<SetStateAction<State>>;
  setDeletingBoxerId: Dispatch<SetStateAction<string | null>>;
  setEditingBoxerForm: Dispatch<SetStateAction<RoomBoxerFormState>>;
  setEditingBoxerId: Dispatch<SetStateAction<string | null>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSelectedBoxerIds: Dispatch<SetStateAction<string[]>>;
  setUpdateState: Dispatch<SetStateAction<State>>;
}) {
  function handleStartEditBoxer(boxer: RoomBoxer) {
    setEditingBoxerId(boxer.uuid);
    setEditingBoxerForm({
      age: String(boxer.age),
      first_name: boxer.first_name,
      last_name: boxer.last_name,
      middle_name: boxer.middle_name,
      rank: boxer.rank,
      sex: boxer.sex,
      weight: boxer.weight,
    });
  }

  function handleStopEditBoxer() {
    setEditingBoxerId(null);
    setEditingBoxerForm(getEmptyRoomBoxerForm());
  }

  function handleEditingBoxerFieldChange(field: keyof RoomBoxerPayload, value: string) {
    const nextValue =
      field === "first_name" || field === "last_name" || field === "middle_name"
        ? capitalizeFirstLetter(value)
        : field === "weight"
          ? normalizeWeightInput(value)
          : value;

    setEditingBoxerForm((current) => ({ ...current, [field]: nextValue }));
  }

  async function handleSaveBoxer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tokens = getAuthTokens();

    if (!tokens?.access || !editingBoxerId) {
      setMessage("Сессия истекла.");
      return;
    }

    try {
      setUpdateState("loading");
      const updatedBoxer = await updateRoomBoxer(tokens.access, roomUuid, editingBoxerId, editingBoxerForm);
      setBoxers((current) => updateCollectionItem(current, editingBoxerId, updatedBoxer));
      setUpdateState("success");
      setMessage("Участник обновлен.");
      handleStopEditBoxer();
    } catch (error) {
      setUpdateState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleDeleteBoxer(boxerUuid: string) {
    const tokens = getAuthTokens();
    const boxerToDelete = boxers.find((boxer) => boxer.uuid === boxerUuid);

    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return;
    }

    try {
      setDeleteState("loading");
      setDeletingBoxerId(boxerUuid);
      await deleteRoomBoxer(tokens.access, roomUuid, boxerUuid);

      if (boxerToDelete && !boxerToDelete.is_available) {
        await loadPairsData(tokens.access, roomUuid);
      }

      setBoxers((current) => current.filter((boxer) => boxer.uuid !== boxerUuid));
      setSelectedBoxerIds((current) => current.filter((id) => id !== boxerUuid));
      setDeleteState("success");
      setMessage("Участник удален.");
    } catch (error) {
      setDeleteState("error");
      setMessage(getErrorMessage(error));
    } finally {
      setDeletingBoxerId(null);
    }
  }

  return {
    handleDeleteBoxer,
    handleEditingBoxerFieldChange,
    handleSaveBoxer,
    handleStartEditBoxer,
    handleStopEditBoxer,
  };
}
