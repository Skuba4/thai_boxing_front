import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  getRoomRing,
  type Ring,
  type RingStatus,
  updateRoomRing,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { capitalizeFirstLetter } from "../homeBoxers";
import { getErrorMessage } from "../homeErrors";
import type { OwnerTab, PendingDraftAction } from "./types";

type State = "idle" | "loading" | "success" | "error";
type RingForm = { status: RingStatus; description: string };

export function useRoomRings({
  activeRing,
  activeRingName,
  hasActiveRingDraftMoves,
  hasDraftMoves,
  onActiveRingNameChange,
  ownerTab,
  ringForm,
  rings,
  ringsState,
  roomUuid,
  editingRing,
  setActiveRing,
  setEditingRing,
  setMessage,
  setOwnerTab,
  setPendingDraftAction,
  setRingForm,
  setRings,
  setUpdateState,
}: {
  activeRing: Ring | null;
  activeRingName: string | null;
  hasActiveRingDraftMoves: boolean;
  hasDraftMoves: boolean;
  onActiveRingNameChange: (ringName: string | null) => void;
  ownerTab: OwnerTab;
  ringForm: RingForm;
  rings: Ring[];
  ringsState: State;
  roomUuid: string;
  editingRing: Ring | null;
  setActiveRing: Dispatch<SetStateAction<Ring | null>>;
  setEditingRing: Dispatch<SetStateAction<Ring | null>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setOwnerTab: Dispatch<SetStateAction<OwnerTab>>;
  setPendingDraftAction: Dispatch<SetStateAction<PendingDraftAction | null>>;
  setRingForm: Dispatch<SetStateAction<RingForm>>;
  setRings: Dispatch<SetStateAction<Ring[]>>;
  setUpdateState: Dispatch<SetStateAction<State>>;
}) {
  async function handleOpenRingDetails(ringName: string) {
    if (ownerTab === "pairs" && hasDraftMoves) {
      setPendingDraftAction({ type: "ring", ringName });
      return;
    }

    if (ownerTab === "ring-detail" && hasActiveRingDraftMoves && activeRingName !== ringName) {
      setPendingDraftAction({ type: "ring", ringName });
      return;
    }

    const localRing = rings.find((ring) => ring.name === ringName) ?? null;

    if (localRing) {
      setActiveRing(localRing);
      setOwnerTab("ring-detail");
      onActiveRingNameChange(localRing.name);
      return;
    }

    if (ringsState === "idle") {
      setMessage("Сначала открой вкладку рингов.");
      return;
    }

    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      const ring = await getRoomRing(tokens.access, roomUuid, ringName);
      setActiveRing(ring);
      setOwnerTab("ring-detail");
      onActiveRingNameChange(ring.name);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function handleStartEditRing(ringName: string) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      const ring = await getRoomRing(tokens.access, roomUuid, ringName);
      setEditingRing(ring);
      setRingForm({
        status: ring.status,
        description: ring.description ?? "",
      });
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  function handleRingFormChange<K extends keyof RingForm>(field: K, value: RingForm[K]) {
    const nextValue = field === "description" && typeof value === "string" ? capitalizeFirstLetter(value) : value;
    setRingForm((current) => ({ ...current, [field]: nextValue }));
  }

  async function handleSaveRing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tokens = getAuthTokens();
    if (!tokens?.access || !editingRing) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      const updatedRing = await updateRoomRing(tokens.access, roomUuid, editingRing.name, ringForm);
      setRings((current) => current.map((ring) => (ring.name === updatedRing.name ? updatedRing : ring)));
      if (activeRing?.name === updatedRing.name) setActiveRing(updatedRing);
      if (updatedRing.status === "N" && activeRingName === updatedRing.name) {
        setActiveRing(null);
        setOwnerTab("rings");
        onActiveRingNameChange(null);
      }
      setEditingRing(null);
      setMessage(`Ринг ${updatedRing.name} обновлен.`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
    }
  }

  async function handleQuickToggleRingStatus(ring: Ring, nextStatus: RingStatus) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      const updatedRing = await updateRoomRing(tokens.access, roomUuid, ring.name, {
        status: nextStatus,
        description: ring.description ?? "",
      });
      setRings((current) => current.map((currentRing) => (currentRing.name === updatedRing.name ? updatedRing : currentRing)));
      if (activeRing?.name === updatedRing.name) setActiveRing(updatedRing);
      if (updatedRing.status === "N" && activeRingName === updatedRing.name) {
        setActiveRing(null);
        setOwnerTab("rings");
        onActiveRingNameChange(null);
      }
      setMessage(nextStatus === "N" ? `Ринг ${updatedRing.name} выключен.` : `Ринг ${updatedRing.name} активирован.`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
    }
  }

  return {
    handleOpenRingDetails,
    handleQuickToggleRingStatus,
    handleRingFormChange,
    handleSaveRing,
    handleStartEditRing,
  };
}
