import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  createRoomFightNote,
  getMyRoomFightNotes,
  getRingSideJudges,
  getRoomFightNotes,
  type Fight,
  type JudgeApplication,
  type Note,
  type NoteRound,
  type Ring,
  updateRingSideJudgeActive,
  updateRoomFightStatus,
  updateRoomFightWinner,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import type { FightRow } from "./types";

type State = "idle" | "loading" | "success" | "error";

export function useRoomFights({
  activeRingName,
  activeRing,
  activeSideFightRow,
  blueRemark,
  isActiveSideJudge,
  isChiefJudge,
  loadPairsData,
  ownerTab,
  redRemark,
  roomUuid,
  roundTimerSeconds,
  selectedChiefFightRow,
  selectedFightWinner,
  selectedSideJudgeRound,
  setFightNotes,
  setFightNotesState,
  setIsFightNotesModalOpen,
  setIsRoundTimerRunning,
  setMessage,
  setPendingFightStatus,
  setPendingFightWinnerConfirm,
  setPendingSideJudgeNoteConfirm,
  setRingSideJudges,
  setRingSideJudgesState,
  setRoundTimerRemainingSeconds,
  setRoundTimerSeconds,
  setSelectedChiefFightId,
  setSelectedSideJudgeRound,
  setSideJudgeBlueRemark,
  setSideJudgeNoteState,
  setSideJudgeNotes,
  setSideJudgeRedRemark,
  setUpdateState,
}: {
  activeRingName: string | null;
  activeRing: Ring | null;
  activeSideFightRow: FightRow | null;
  blueRemark: string;
  isActiveSideJudge: boolean;
  isChiefJudge: boolean;
  loadPairsData: (accessToken: string, roomUuid?: string) => Promise<unknown>;
  ownerTab: string;
  redRemark: string;
  roomUuid: string;
  roundTimerSeconds: number;
  selectedChiefFightRow: FightRow | null;
  selectedFightWinner: string | null;
  selectedSideJudgeRound: NoteRound | null;
  setFightNotes: Dispatch<SetStateAction<Note[]>>;
  setFightNotesState: Dispatch<SetStateAction<State>>;
  setIsFightNotesModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsRoundTimerRunning: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setPendingFightStatus: Dispatch<SetStateAction<Fight["status"] | null>>;
  setPendingFightWinnerConfirm: Dispatch<SetStateAction<boolean>>;
  setPendingSideJudgeNoteConfirm: Dispatch<SetStateAction<boolean>>;
  setRingSideJudges: Dispatch<SetStateAction<JudgeApplication[]>>;
  setRingSideJudgesState: Dispatch<SetStateAction<State>>;
  setRoundTimerRemainingSeconds: Dispatch<SetStateAction<number>>;
  setRoundTimerSeconds: Dispatch<SetStateAction<number>>;
  setSelectedChiefFightId: Dispatch<SetStateAction<string | null>>;
  setSelectedSideJudgeRound: Dispatch<SetStateAction<NoteRound | null>>;
  setSideJudgeBlueRemark: Dispatch<SetStateAction<string>>;
  setSideJudgeNoteState: Dispatch<SetStateAction<State>>;
  setSideJudgeNotes: Dispatch<SetStateAction<Note[]>>;
  setSideJudgeRedRemark: Dispatch<SetStateAction<string>>;
  setUpdateState: Dispatch<SetStateAction<State>>;
}) {
  useEffect(() => {
    if (!isActiveSideJudge || !activeSideFightRow) {
      setSideJudgeNotes([]);
      return;
    }

    const tokens = getAuthTokens();
    if (!tokens?.access) return;

    void getMyRoomFightNotes(tokens.access, roomUuid, activeSideFightRow.fight.uuid)
      .then(setSideJudgeNotes)
      .catch(() => setSideJudgeNotes([]));
  }, [activeSideFightRow, activeSideFightRow?.fight.uuid, isActiveSideJudge, roomUuid, setSideJudgeNotes]);

  useEffect(() => {
    if (!isChiefJudge || ownerTab !== "ring-detail" || !activeRing) {
      setRingSideJudges([]);
      setRingSideJudgesState("idle");
      return;
    }

    const tokens = getAuthTokens();
    if (!tokens?.access) return;

    setRingSideJudgesState("loading");
    void getRingSideJudges(tokens.access, roomUuid, activeRing.name)
      .then((judges) => {
        setRingSideJudges(judges);
        setRingSideJudgesState("success");
      })
      .catch((error) => {
        setRingSideJudges([]);
        setRingSideJudgesState("error");
        setMessage(getErrorMessage(error));
      });
  }, [
    activeRing,
    activeRing?.name,
    isChiefJudge,
    ownerTab,
    roomUuid,
    setMessage,
    setRingSideJudges,
    setRingSideJudgesState,
  ]);

  async function handleOpenFightNotes() {
    if (!selectedChiefFightRow) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setFightNotesState("loading");
      setIsFightNotesModalOpen(true);
      setFightNotes(await getRoomFightNotes(tokens.access, roomUuid, selectedChiefFightRow.fight.uuid));
      setFightNotesState("success");
    } catch (error) {
      setFightNotes([]);
      setFightNotesState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleSubmitSideJudgeNote() {
    if (!activeSideFightRow || !selectedSideJudgeRound) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setSideJudgeNoteState("loading");
      await createRoomFightNote(tokens.access, roomUuid, activeSideFightRow.fight.uuid, {
        red_remark: redRemark,
        blue_remark: blueRemark,
        round: selectedSideJudgeRound,
      });
      setSideJudgeNotes(await getMyRoomFightNotes(tokens.access, roomUuid, activeSideFightRow.fight.uuid));
      setMessage("Записка отправлена.");
      setSelectedSideJudgeRound(null);
      setPendingSideJudgeNoteConfirm(false);
      setSideJudgeRedRemark("");
      setSideJudgeBlueRemark("");
      setSideJudgeNoteState("success");
    } catch (error) {
      setSideJudgeNoteState("error");
      setMessage(getErrorMessage(error));
    } finally {
      setSideJudgeNoteState("idle");
    }
  }

  async function handleConfirmFightWinner() {
    if (!selectedChiefFightRow) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      await updateRoomFightWinner(tokens.access, roomUuid, selectedChiefFightRow.fight.uuid, {
        winner: selectedFightWinner || null,
      });
      await loadPairsData(tokens.access, roomUuid);
      setSelectedChiefFightId(null);
      setPendingFightWinnerConfirm(false);
      setMessage("Победитель сохранен.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
    }
  }

  async function handleFightStatusChange(status: Fight["status"]) {
    if (!selectedChiefFightRow) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      await updateRoomFightStatus(tokens.access, roomUuid, selectedChiefFightRow.fight.uuid, { status });
      await loadPairsData(tokens.access, roomUuid);
      setPendingFightStatus(null);
      setMessage(status === "active" ? "Бой начат." : "Бой остановлен.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
    }
  }

  async function handleRingSideJudgeSelect(applicationUuid: string) {
    if (!activeRingName || !applicationUuid) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setUpdateState("loading");
      await updateRingSideJudgeActive(tokens.access, roomUuid, activeRingName, applicationUuid, true);
      setRingSideJudges(await getRingSideJudges(tokens.access, roomUuid, activeRingName));
      setMessage("Судья активирован.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUpdateState("idle");
    }
  }

  function handleRoundTimerDurationChange(seconds: number) {
    setRoundTimerSeconds(seconds);
    setRoundTimerRemainingSeconds(seconds);
    setIsRoundTimerRunning(false);
  }

  function handleStartRoundTimer() {
    setRoundTimerRemainingSeconds((currentSeconds) => (currentSeconds > 0 ? currentSeconds : roundTimerSeconds));
    setIsRoundTimerRunning(true);
  }

  function handleStopRoundTimer() {
    setIsRoundTimerRunning(false);
    setRoundTimerRemainingSeconds(roundTimerSeconds);
  }

  return {
    handleConfirmFightWinner,
    handleFightStatusChange,
    handleOpenFightNotes,
    handleRingSideJudgeSelect,
    handleRoundTimerDurationChange,
    handleStartRoundTimer,
    handleStopRoundTimer,
    handleSubmitSideJudgeNote,
  };
}
