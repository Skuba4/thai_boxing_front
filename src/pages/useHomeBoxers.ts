import { useState } from "react";
import type { FormEvent } from "react";
import {
  createBoxer,
  deleteBoxer,
  getBoxers,
  type Boxer,
  updateBoxer,
} from "../features/auth/authApi";
import { useFlashMessageState } from "./alerts";
import { getEmptyBoxerForm } from "./homeBoxers";
import { getErrorMessage } from "./homeErrors";
import type { BoxerFormState } from "./homeForms";
import type { RequestState } from "./homeSharedTypes";
import { updateCollectionItem } from "./homeShared";

export function useHomeBoxers() {
  const athletesFlash = useFlashMessageState();
  const [boxersState, setBoxersState] = useState<RequestState>("idle");
  const [createBoxerState, setCreateBoxerState] = useState<RequestState>("idle");
  const [updateBoxerState, setUpdateBoxerState] = useState<RequestState>("idle");
  const [deleteBoxerState, setDeleteBoxerState] = useState<RequestState>("idle");
  const [deletingBoxerId, setDeletingBoxerId] = useState<string | null>(null);
  const [boxers, setBoxers] = useState<Boxer[]>([]);
  const [newBoxerForm, setNewBoxerForm] = useState<BoxerFormState>(getEmptyBoxerForm());
  const [editingBoxerId, setEditingBoxerId] = useState<string | null>(null);
  const [editingBoxerForm, setEditingBoxerForm] = useState<BoxerFormState>(getEmptyBoxerForm());
  const [boxerSearch, setBoxerSearch] = useState("");
  const [isCreateBoxerModalOpen, setIsCreateBoxerModalOpen] = useState(false);
  const [isEditBoxerModalOpen, setIsEditBoxerModalOpen] = useState(false);

  async function loadBoxers(accessToken: string) {
    try {
      setBoxersState("loading");
      setBoxers(await getBoxers(accessToken));
      setBoxersState("success");
    } catch {
      setBoxersState("error");
    }
  }

  async function handleCreateBoxer(event: FormEvent<HTMLFormElement>, accessToken: string) {
    event.preventDefault();
    try {
      setCreateBoxerState("loading");
      const createdBoxer = await createBoxer(accessToken, newBoxerForm);
      setBoxers((current) => [createdBoxer, ...current]);
      setNewBoxerForm(getEmptyBoxerForm());
      setIsCreateBoxerModalOpen(false);
      setCreateBoxerState("success");
      athletesFlash.setMessage("Спортсмен добавлен.");
    } catch (error) {
      setCreateBoxerState("error");
      athletesFlash.setMessage(getErrorMessage(error));
    }
  }

  function handleStartEditBoxer(boxer: Boxer) {
    setEditingBoxerId(boxer.uuid);
    setEditingBoxerForm({
      first_name: boxer.first_name,
      last_name: boxer.last_name,
      middle_name: boxer.middle_name,
      birth_date: boxer.birth_date,
      sex: boxer.sex,
      rank: boxer.rank,
      weight: boxer.weight,
    });
    setIsEditBoxerModalOpen(true);
  }

  function handleStopEditBoxer() {
    setEditingBoxerId(null);
    setEditingBoxerForm(getEmptyBoxerForm());
    setIsEditBoxerModalOpen(false);
  }

  async function handleSaveBoxer(event: FormEvent<HTMLFormElement>, accessToken: string) {
    event.preventDefault();
    if (!editingBoxerId) return;
    try {
      setUpdateBoxerState("loading");
      const updatedBoxer = await updateBoxer(accessToken, editingBoxerId, editingBoxerForm);
      setBoxers((current) => updateCollectionItem(current, editingBoxerId, updatedBoxer));
      handleStopEditBoxer();
      setUpdateBoxerState("success");
      athletesFlash.setMessage("Данные спортсмена сохранены.");
    } catch (error) {
      setUpdateBoxerState("error");
      athletesFlash.setMessage(getErrorMessage(error));
    }
  }

  async function handleDeleteBoxer(boxerUuid: string, accessToken: string) {
    try {
      setDeleteBoxerState("loading");
      setDeletingBoxerId(boxerUuid);
      await deleteBoxer(accessToken, boxerUuid);
      setBoxers((current) => current.filter((boxer) => boxer.uuid !== boxerUuid));
      setDeleteBoxerState("success");
      athletesFlash.setMessage("Спортсмен удален.");
    } catch (error) {
      setDeleteBoxerState("error");
      athletesFlash.setMessage(getErrorMessage(error));
    } finally {
      setDeletingBoxerId(null);
    }
  }

  function resetBoxersState() {
    setBoxersState("idle");
    setCreateBoxerState("idle");
    setUpdateBoxerState("idle");
    setDeleteBoxerState("idle");
    setDeletingBoxerId(null);
    setBoxers([]);
    setNewBoxerForm(getEmptyBoxerForm());
    setEditingBoxerId(null);
    setEditingBoxerForm(getEmptyBoxerForm());
    setBoxerSearch("");
    setIsCreateBoxerModalOpen(false);
    setIsEditBoxerModalOpen(false);
    athletesFlash.setMessage("");
  }

  return {
    athletesMessage: athletesFlash.message,
    athletesMessageVersion: athletesFlash.messageVersion,
    boxerSearch,
    boxers,
    boxersState,
    createBoxerState,
    deleteBoxerState,
    deletingBoxerId,
    editingBoxerForm,
    editingBoxerId,
    handleCreateBoxer,
    handleDeleteBoxer,
    handleSaveBoxer,
    handleStartEditBoxer,
    handleStopEditBoxer,
    isCreateBoxerModalOpen,
    isEditBoxerModalOpen,
    loadBoxers,
    newBoxerForm,
    resetBoxersState,
    setAthletesMessage: athletesFlash.setMessage,
    setBoxerSearch,
    setBoxers,
    setBoxersState,
    setEditingBoxerForm,
    setIsCreateBoxerModalOpen,
    setNewBoxerForm,
    updateBoxerState,
  };
}
