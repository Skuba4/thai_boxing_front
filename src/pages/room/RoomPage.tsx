import { useEffect, useMemo, useState } from "react";
import {
  type Ring,
  type Room,
} from "../../features/auth/authApi";
import { roundTimerOptions } from "./constants";
import { RoomHeader } from "./components/RoomHeader";
import { RoomModalsHost } from "./components/RoomModalsHost";
import { RoomWorkspace } from "./components/RoomWorkspace";
import { AlertBanner } from "../components/AlertBanner";
import { RoomSettingsModal } from "../components/modals/RoomModals";
import type { RoomPanelCache } from "../homePanelTypes";
import { getRoomAccess } from "./guards";
import {
  getDefaultRingGridOrders,
  hasRingOrderDraft,
} from "./drafts";
import {
  useActiveRingSync,
  useAutoOpenGuestRing,
  useChiefFightSelection,
  useDraftSync,
  useFightWinnerMenu,
  useMessageTimeout,
  useRoomCache,
  useRoundTimer,
  useTabStorage,
} from "./effects";
import { useRoomData } from "./useRoomData";
import { useRoomBoxers } from "./useRoomBoxers";
import { useRoomGrids } from "./useRoomGrids";
import { useRoomFights } from "./useRoomFights";
import { useRoomRings } from "./useRoomRings";
import { useRoomApplications } from "./useRoomApplications";
import { useGridBoxerDrag } from "./useGridBoxerDrag";
import { useGridRenderers } from "./useGridRenderers";
import { getRoomSectionVisibility, getRoomUiScenario } from "./scenario";
import { useBoxerSort } from "./sort";
import { useRoomView } from "./useRoomView";
import { useRoomUiActions } from "./useRoomUiActions";
import { useRoomPanelState } from "./useRoomPanelState";
import { useRoomPanelReset } from "./useRoomPanelReset";
import { getJudgeApplicationUserName, useRoomPanelMeta } from "./useRoomPanelMeta";
import type { RoomTab } from "./types";

export function RoomPanel({
  activeRingName,
  cachedState,
  currentUserEmail,
  hasPremiumAccess,
  onActiveRingNameChange,
  onActiveRingsChange,
  onCacheChange,
  onRoomDeleteConfirm,
  onRoomPatch,
  onRoomFormChange,
  onRoomUpdateSubmit,
  roomForm,
  roomDeleteState,
  setEditingRoom,
  updateRoomState,
  room,
}: {
  activeRingName: string | null;
  cachedState?: RoomPanelCache;
  currentUserEmail: string;
  hasPremiumAccess: boolean;
  onActiveRingNameChange: (ringName: string | null) => void;
  onActiveRingsChange: (rings: Ring[]) => void;
  onCacheChange: (roomUuid: string, nextState: RoomPanelCache) => void;
  onRoomDeleteConfirm: () => void;
  onRoomPatch: (roomUuid: string, patch: Partial<Room>) => void;
  onRoomFormChange: (field: "name" | "description" | "start_date" | "status", value: string) => void;
  onRoomUpdateSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  roomForm: { name: string; description: string; start_date: string; status: "0" | "Y" | "N" };
  roomDeleteState: "idle" | "loading" | "success" | "error";
  setEditingRoom: (room: Room) => void;
  updateRoomState: "idle" | "loading" | "success" | "error";
  room: Room;
}) {
  const [isRoomSettingsModalOpen, setIsRoomSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"room" | "rings" | "owner-boxers">("room");
  const {
    activeRing, applicationBoxers, applications, applicationsState, boxers, boxersState, builtGridFights,
    deleteState, deletingBoxerId, draftGridBoxers, draftGridBoxersRef, draftRingGridOrders, draggingGridBoxer,
    draggingRingGridId, dropTarget, editingBoxerForm, editingBoxerId, editingGridId, editingRing, fightNotes,
    fightNotesState, fightWinnerDropdownRef, gridForm, gridSearch, gridState, grids, gridsState,
    guestApplicationState, guestJudge, guestJudgeApplicationState, guestRoomApplicationStatus,
    isFightNotesModalOpen, isFightWinnerMenuOpen, isGridModalOpen, isRoomApplicationBoxersModalOpen,
    isRoundTimerRunning, judgeApplications, judgeApplicationsState, message, messageVersion, ownerTab, pendingApplicationAction,
    pendingDraftAction, pendingFightStatus, pendingFightWinnerConfirm, pendingJudgeApplicationAction,
    pendingSideJudgeNoteConfirm, ringDetailSearch, ringDetailViewMode, ringForm, ringGridDropTargetId,
    ringSideJudges, ringSideJudgesState, rings, ringsState, roomApplicationBoxersModalMode,
    roundTimerRemainingSeconds, roundTimerSeconds, savedRingGridOrders, selectedApplicationBoxerIds,
    selectedBoxerIds, selectedChiefFightId, selectedFightWinner, selectedSideJudgeRound, setActiveRing,
    setApplicationBoxers, setApplications, setApplicationsState, setBoxers, setBoxersState, setBuiltGridFights,
    setDeleteState, setDeletingBoxerId, setDraftGridBoxers, setDraftRingGridOrders, setDraggingGridBoxer,
    setDraggingRingGridId, setDropTarget, setEditingBoxerForm, setEditingBoxerId, setEditingGridId, setEditingRing,
    setFightNotes, setFightNotesState, setGridForm, setGridSearch, setGridState, setGrids, setGridsState,
    setGuestApplicationState, setGuestJudge, setGuestJudgeApplicationState, setGuestRoomApplicationStatus,
    setIsFightNotesModalOpen, setIsFightWinnerMenuOpen, setIsGridModalOpen, setIsRoomApplicationBoxersModalOpen,
    setIsRoundTimerRunning, setJudgeApplications, setJudgeApplicationsState, setMessage, setOwnerTab,
    setPendingApplicationAction, setPendingDraftAction, setPendingFightStatus, setPendingFightWinnerConfirm,
    setPendingJudgeApplicationAction, setPendingSideJudgeNoteConfirm, setRingDetailSearch, setRingDetailViewMode,
    setRingForm, setRingGridDropTargetId, setRingSideJudges, setRingSideJudgesState, setRings, setRingsState,
    setRoomApplicationBoxersModalMode, setRoundTimerRemainingSeconds, setRoundTimerSeconds, setSavedRingGridOrders,
    setSelectedApplicationBoxerIds, setSelectedBoxerIds, setSelectedChiefFightId, setSelectedFightWinner,
    setSelectedSideJudgeRound, setSideJudgeBlueRemark, setSideJudgeNoteState, setSideJudgeNotes,
    setSideJudgeRedRemark, setUpdateState, setUpdatingApplicationId, setUpdatingJudgeApplicationId,
    sideJudgeBlueRemark, sideJudgeNoteState, sideJudgeNotes, sideJudgeRedRemark, updateState,
    updatingApplicationId, updatingJudgeApplicationId,
  } = useRoomPanelState({ activeRingName, cachedState, hasPremiumAccess, room });
  const {
    activeBoxers: activeSortedBoxers,
    inactiveBoxers: inactiveSortedBoxers,
    renderSortButton: renderBoxerSortButton,
    search,
    setSearch,
    setSortRules,
  } = useBoxerSort(boxers);
  const {
    canViewPairs,
    canViewParticipants,
    canViewRings,
    canViewRingsOverview,
    isActiveSideJudge,
    isApprovedTrainer,
    isChiefJudge,
    isJudge,
    isSideJudge,
    isSpectatorGuest,
    isUnassignedJudge,
    judgeRingName,
    judgeStatus,
  } = getRoomAccess({
    guestJudge,
    guestRoomApplicationStatus,
    hasPremiumAccess,
    rings,
    room,
  });
  const isChiefJudgeActiveRoom = isChiefJudge && room.status === "Y";
  const roomUiScenario = getRoomUiScenario({
    activeRingName,
    guestRoomApplicationStatus,
    hasPremiumAccess,
    isChiefJudge: isChiefJudgeActiveRoom,
    isOwner: room.is_owner,
    isSideJudge,
    isSpectatorGuest,
    judgeStatus,
    room,
  });
  const roomSectionVisibility = getRoomSectionVisibility({
    access: {
      canViewPairs,
      canViewParticipants,
      isOwner: room.is_owner,
    },
    ownerTab,
    scenario: roomUiScenario,
  });
  const boxerById = useMemo(() => new Map(boxers.map((boxer) => [boxer.uuid, boxer])), [boxers]);

  const {
    roomApplications,
    roomJudgeApplications,
    roundTimerText,
    waitingOwnerApplicationsCount,
  } = useRoomPanelMeta({
    applications,
    judgeApplications,
    roomUuid: room.uuid,
    roundTimerRemainingSeconds,
  });
  const pendingApplicationBoxers =
    pendingApplicationAction && "applicationUuid" in pendingApplicationAction
      ? (roomApplications.find((application) => application.uuid === pendingApplicationAction.applicationUuid)?.boxers ?? [])
      : [];

  const defaultRingGridOrders = useMemo(
    () => getDefaultRingGridOrders({ builtGridFights, grids, rings }),
    [builtGridFights, grids, rings],
  );

  const {
    activeRingActiveSideJudges,
    activeRingFightNumberById,
    activeRingFightRows,
    activeRingGrids,
    activeRingInactiveSideJudges,
    activeRings,
    activeSideFightRow,
    changedDraftGrids,
    filteredActiveRingFightRows,
    filteredActiveRingGrids,
    hasDraftMoves,
    inactiveRings,
    nextSideJudgeRound,
    selectedBoxers,
    selectedChiefFightBlueWinnerUuid,
    selectedChiefFightRedWinnerUuid,
    selectedChiefFightRow,
    sortedGrids,
    submittedSideJudgeRounds,
    visiblePairsGrids,
    visibleRingTabs,
  } = useRoomView({
    activeRing,
    boxerById,
    boxers,
    builtGridFights,
    defaultRingGridOrders,
    draftGridBoxers,
    draftRingGridOrders,
    gridSearch,
    grids,
    ringAccess: { isApprovedTrainer, isChiefJudge, isJudge, judgeRingName },
    ringDetailSearch,
    rings,
    ringSideJudges,
    room,
    selectedBoxerIds,
    selectedChiefFightId,
    sideJudgeNotes,
  });

  useRoomPanelReset({
    activeRingName,
    cachedState,
    canViewPairs,
    canViewParticipants,
    canViewRingsOverview,
    room,
    setActiveRing,
    setApplicationBoxers,
    setApplications,
    setApplicationsState,
    setBoxers,
    setBoxersState,
    setBuiltGridFights,
    setDraftGridBoxers,
    setDraftRingGridOrders,
    setDraggingGridBoxer,
    setDraggingRingGridId,
    setDropTarget,
    setEditingBoxerForm,
    setEditingBoxerId,
    setEditingGridId,
    setEditingRing,
    setGridForm,
    setGridSearch,
    setGridState,
    setGrids,
    setGridsState,
    setGuestApplicationState,
    setGuestJudge,
    setGuestJudgeApplicationState,
    setGuestRoomApplicationStatus,
    setIsGridModalOpen,
    setIsRoomApplicationBoxersModalOpen,
    setIsRoundTimerRunning,
    setJudgeApplications,
    setJudgeApplicationsState,
    setMessage,
    setOwnerTab,
    setPendingJudgeApplicationAction,
    setRingDetailSearch,
    setRingDetailViewMode,
    setRingForm,
    setRings,
    setRingsState,
    setRoomApplicationBoxersModalMode,
    setRoundTimerRemainingSeconds,
    setRoundTimerSeconds,
    setSavedRingGridOrders,
    setSearch,
    setSelectedApplicationBoxerIds,
    setSelectedBoxerIds,
    setSelectedChiefFightId,
    setSortRules,
  });

  useEffect(() => {
    onActiveRingsChange(rings.filter((ring) => ring.status !== "N"));
  }, [rings, onActiveRingsChange]);

  useMessageTimeout(message, setMessage, messageVersion);
  useRoundTimer({
    isRunning: isRoundTimerRunning,
    resetSeconds: roundTimerSeconds,
    setIsRunning: setIsRoundTimerRunning,
    setRemainingSeconds: setRoundTimerRemainingSeconds,
  });
  useRoomCache({
    activeRing,
    boxers,
    boxersState,
    changedDraftGrids,
    grids,
    gridsState,
    hasDraftMoves,
    onCacheChange,
    rings,
    ringsState,
    roomUuid: room.uuid,
  });
  useDraftSync({
    boxerById,
    builtGridFights,
    changedDraftGrids,
    defaultRingGridOrders,
    draftGridBoxers,
    draftGridBoxersRef,
    grids,
    rings,
    setDraftGridBoxers,
    setDraftRingGridOrders,
    setSavedRingGridOrders,
  });
  useTabStorage(ownerTab, room.uuid);
  useAutoOpenGuestRing({
    canViewRingsOverview,
    onActiveRingNameChange,
    ownerTab,
    setOwnerTab,
    visibleRingTabs,
  });

  const {
    fetchRoomBoxers,
    loadGuestRoomBoxers,
    loadPairsData,
    loadRoomBoxers,
    loadRoomRings,
    refreshParticipantsData,
  } = useRoomData({
    applicationsState,
    boxersState,
    canViewPairs,
    canViewRings,
    gridsState,
    isApprovedTrainer,
    isJudge,
    judgeApplicationsState,
    ownerTab,
    ringsState,
    roomIsOwner: room.is_owner,
    roomStatus: room.status,
    roomUuid: room.uuid,
    setApplications,
    setApplicationsState,
    setBoxers,
    setBoxersState,
    setBuiltGridFights,
    setDraftGridBoxers,
    setGrids,
    setGridsState,
    setJudgeApplications,
    setJudgeApplicationsState,
    setMessage,
    setRings,
    setRingsState,
  });

  const {
    handleDeleteBoxer,
    handleEditingBoxerFieldChange,
    handleSaveBoxer,
    handleStartEditBoxer,
    handleStopEditBoxer,
  } = useRoomBoxers({
    boxers,
    editingBoxerForm,
    editingBoxerId,
    loadPairsData,
    roomUuid: room.uuid,
    setBoxers,
    setDeleteState,
    setDeletingBoxerId,
    setEditingBoxerForm,
    setEditingBoxerId,
    setMessage,
    setSelectedBoxerIds,
    setUpdateState,
  });

  const {
    handleGridBoxerDragEnd,
    handleGridBoxerDragStart,
    handleGridBoxerDrop,
  } = useGridBoxerDrag({
    boxerById,
    builtGridFights,
    draftGridBoxersRef,
    draggingGridBoxer,
    grids,
    setDraftGridBoxers,
    setDraggingGridBoxer,
    setDropTarget,
  });

  useActiveRingSync({
    activeRing,
    activeRingName,
    canViewParticipants,
    isOwner: room.is_owner,
    ownerTab,
    rings,
    setActiveRing,
    setOwnerTab,
  });

  const {
    handleCloseRoomApplicationBoxersModal,
    handleConfirmJudgeApplicationAction,
    handleConfirmPendingApplicationAction,
    handleDeleteGuestApplication,
    handleDeleteJudgeApplication,
    handleEditGuestApplication,
    handleGuestApplication,
    handleLoadOwnerRoomBoxers,
    handleJudgeApplicationStatusChange,
    handleOpenOwnerAddBoxers,
    handleSubmitRoomApplicationBoxers,
    handleToggleApplicationBoxer,
  } = useRoomApplications({
    onGuestRoomStatusSync: (status) => onRoomPatch(room.uuid, { my_trainer_application_status: status }),
    currentUserEmail,
    fetchRoomBoxers,
    guestApplicationState,
    loadRoomBoxers,
    pendingApplicationAction,
    pendingJudgeApplicationAction,
    roomApplicationBoxersModalMode,
    roomUuid: room.uuid,
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
  });

  const {
    handleConfirmFightWinner,
    handleFightStatusChange,
    handleOpenFightNotes,
    handleRingSideJudgeSelect,
    handleRoundTimerDurationChange,
    handleStartRoundTimer,
    handleStopRoundTimer,
    handleSubmitSideJudgeNote,
  } = useRoomFights({
    activeRing,
    activeRingName: activeRing?.name ?? null,
    activeSideFightRow,
    blueRemark: sideJudgeBlueRemark,
    isActiveSideJudge,
    isChiefJudge: isChiefJudgeActiveRoom,
    loadPairsData,
    ownerTab,
    redRemark: sideJudgeRedRemark,
    roomUuid: room.uuid,
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
  });

  useEffect(() => {
    if (!selectedChiefFightRow) {
      setSelectedFightWinner("");
      return;
    }

    setSelectedFightWinner(
      selectedChiefFightRow.fight.winner
        ?? selectedChiefFightRow.fight.slots[0]?.boxer
        ?? selectedChiefFightRow.fight.slots[0]?.resolved_boxer
        ?? "",
    );
    setIsFightWinnerMenuOpen(false);
  }, [selectedChiefFightRow, setIsFightWinnerMenuOpen, setSelectedFightWinner]);

  useEffect(() => {
    if (!selectedSideJudgeRound) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSideJudgeRound(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSideJudgeRound, setSelectedSideJudgeRound]);

  useFightWinnerMenu({
    isOpen: isFightWinnerMenuOpen,
    menuRef: fightWinnerDropdownRef,
    setIsOpen: setIsFightWinnerMenuOpen,
  });
  useChiefFightSelection({
    fightRows: activeRingFightRows,
    isChiefJudge: isChiefJudgeActiveRoom,
    ownerTab,
    selectedFightId: selectedChiefFightId,
    setSelectedFightId: setSelectedChiefFightId,
  });

  const hasActiveRingDraftMoves = hasRingOrderDraft({
    activeRingName: activeRing?.name ?? null,
    defaultRingGridOrders,
    draftRingGridOrders,
    isOwner: room.is_owner,
    ownerTab,
    savedRingGridOrders,
  });

  const {
    handleOwnerTabChange,
    handleToggleBoxerSelection,
  } = useRoomUiActions({
    activeRingHasDraftMoves: hasActiveRingDraftMoves,
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
  });

  const {
    handleOpenRingDetails,
    handleQuickToggleRingStatus,
    handleRingFormChange,
    handleSaveRing,
    handleStartEditRing,
  } = useRoomRings({
    activeRing,
    activeRingName,
    editingRing,
    hasActiveRingDraftMoves,
    hasDraftMoves,
    onActiveRingNameChange,
    ownerTab,
    ringForm,
    rings,
    ringsState,
    roomUuid: room.uuid,
    setActiveRing,
    setEditingRing,
    setMessage,
    setOwnerTab,
    setPendingDraftAction,
    setRingForm,
    setRings,
    setUpdateState,
  });

  const {
    handleAssignGridRing,
    handleBuildGrid,
    handleCreateGrid,
    handleDeleteDraftGridBoxer,
    handleDeleteGrid,
    handleGridFormChange,
    handleOpenGridModal,
    handleResetAndContinuePendingDraftAction,
    handleSaveAndContinuePendingDraftAction,
    handleSaveGrid,
    handleSaveRingGridOrderDrafts,
    moveRingGrid,
  } = useRoomGrids({
    activeRing,
    builtGridFights,
    changedDraftGrids,
    defaultRingGridOrders,
    draftGridBoxers,
    draftGridBoxersRef,
    draftRingGridOrders,
    editingGridId,
    gridForm,
    grids,
    gridsState,
    hasActiveRingDraftMoves,
    hasDraftMoves,
    loadGuestRoomBoxers,
    loadPairsData,
    loadRoomBoxers,
    loadRoomRings,
    onActiveRingNameChange,
    ownerTab,
    pendingDraftAction,
    refreshParticipantsData,
    rings,
    roomIsOwner: room.is_owner,
    roomUuid: room.uuid,
    savedRingGridOrders,
    selectedBoxerIds,
    setActiveRing,
    setDraftGridBoxers,
    setDraftRingGridOrders,
    setDraggingGridBoxer,
    setDraggingRingGridId,
    setDropTarget,
    setEditingGridId,
    setGridForm,
    setGridState,
    setGridsState,
    setIsGridModalOpen,
    setMessage,
    setOwnerTab,
    setPendingDraftAction,
    setRingGridDropTargetId,
    setSavedRingGridOrders,
    setSelectedBoxerIds,
    sortedGrids,
  });

  const { renderGridCard, renderRingGridCard } = useGridRenderers({
    activeFightNumberById: activeRingFightNumberById,
    activeRings,
    boxerById,
    builtGridFights,
    draftGridBoxers,
    draggingGridBoxer,
    draggingRingGridId,
    dropTarget,
    gridState,
    hasDraftMoves,
    moveRingGrid,
    ringGridDropTargetId,
    room,
    setDraggingRingGridId,
    setDropTarget,
    setPendingDraftAction,
    setRingGridDropTargetId,
    onAssignGridRing: handleAssignGridRing,
    onBuildGrid: handleBuildGrid,
    onDeleteDraftGridBoxer: handleDeleteDraftGridBoxer,
    onDeleteGrid: handleDeleteGrid,
    onGridBoxerDragEnd: handleGridBoxerDragEnd,
    onGridBoxerDragStart: handleGridBoxerDragStart,
    onGridBoxerDrop: handleGridBoxerDrop,
  });

  function handleRoomTabChange(tab: RoomTab) {
    handleOwnerTabChange(tab);
  }

  function handleWorkspaceRingToggle(ring: Ring, status: Ring["status"]) {
    void handleQuickToggleRingStatus(ring, status);
  }

  function handleSettingsTabChange(tab: "room" | "rings" | "owner-boxers") {
    setActiveSettingsTab(tab);

    if (tab === "owner-boxers") {
      void handleLoadOwnerRoomBoxers();
    }
  }

  return (
    <section className="panel">
      <RoomHeader
        room={room}
        onRoomSettingsOpen={() => {
          setEditingRoom(room);
          setActiveSettingsTab("room");
          setIsRoomSettingsModalOpen(true);
        }}
      />

      <RoomWorkspace
        activeBoxers={activeSortedBoxers}
        activeFight={activeSideFightRow}
        activeJudges={activeRingActiveSideJudges}
        activeRing={activeRing}
        activeRingGrids={activeRingGrids}
        activeRingName={activeRingName}
        activeRings={activeRings}
        access={{
          canViewPairs,
          canViewParticipants,
          canViewRings,
          canViewRingsOverview,
          isActiveSideJudge,
          isChiefJudge: isChiefJudgeActiveRoom,
          isJudge,
          isOwner: room.is_owner,
          isSideJudge,
          isSpectatorGuest,
          isUnassignedJudge,
          judgeStatus,
        }}
        applicationsState={applicationsState}
        boxersState={boxersState}
        canSaveOrder={room.is_owner}
        deleteState={deleteState}
        deletingBoxerId={deletingBoxerId}
        filteredFightRows={filteredActiveRingFightRows}
        filteredGrids={filteredActiveRingGrids}
        fightRows={activeRingFightRows}
        getJudgeName={getJudgeApplicationUserName}
        gridSearch={gridSearch}
        gridState={gridState}
        gridsState={gridsState}
        guestApplicationState={guestApplicationState}
        guestJudgeApplicationState={guestJudgeApplicationState}
        guestRoomApplicationStatus={guestRoomApplicationStatus}
        hasPremiumAccess={hasPremiumAccess}
        hasDraftOrder={hasActiveRingDraftMoves}
        inactiveBoxers={inactiveSortedBoxers}
        inactiveJudges={activeRingInactiveSideJudges}
        inactiveRings={inactiveRings}
        isTimerRunning={isRoundTimerRunning}
        isWinnerMenuOpen={isFightWinnerMenuOpen}
        judgeApplicationsState={judgeApplicationsState}
        nextRound={nextSideJudgeRound}
        onGuestApply={() => void handleGuestApplication()}
        onGuestDelete={() => void handleDeleteGuestApplication()}
        onGuestEdit={() => void handleEditGuestApplication()}
        onBoxerDelete={(boxerUuid) => void handleDeleteBoxer(boxerUuid)}
        onBoxerEdit={handleStartEditBoxer}
        onFightNotesOpen={() => void handleOpenFightNotes()}
        onFightSelect={setSelectedChiefFightId}
        onFightStatusChange={setPendingFightStatus}
        onGridOpen={() => void handleOpenGridModal()}
        onJudgeChange={(applicationUuid, payload) => void handleJudgeApplicationStatusChange(applicationUuid, payload)}
        onJudgeCreate={() => setPendingJudgeApplicationAction("create")}
        onJudgeDelete={(applicationUuid) => void handleDeleteJudgeApplication(applicationUuid)}
        onJudgeDeleteRequest={() => setPendingJudgeApplicationAction("delete")}
        onJudgeRingSelect={(applicationUuid) => void handleRingSideJudgeSelect(applicationUuid)}
        onEditRing={(ringName) => void handleStartEditRing(ringName)}
        onOpenRing={(ringName) => void handleOpenRingDetails(ringName)}
        onOwnerBoxersOpen={() => void handleOpenOwnerAddBoxers()}
        onPendingApplicationAction={setPendingApplicationAction}
        onRoundSelect={setSelectedSideJudgeRound}
        onSaveOrder={() => void handleSaveRingGridOrderDrafts()}
        onBoxerSearchChange={setSearch}
        onGridSearchChange={setGridSearch}
        onRingDetailSearchChange={setRingDetailSearch}
        onTabChange={handleRoomTabChange}
        onTimerDurationChange={handleRoundTimerDurationChange}
        onTimerStart={handleStartRoundTimer}
        onTimerStop={handleStopRoundTimer}
        onToggleBoxer={handleToggleBoxerSelection}
        onToggleRing={handleWorkspaceRingToggle}
        onViewModeChange={setRingDetailViewMode}
        onWinnerConfirm={() => setPendingFightWinnerConfirm(true)}
        onWinnerMenuToggle={() => setIsFightWinnerMenuOpen((current) => !current)}
        onWinnerSelect={(boxerUuid) => {
          setSelectedFightWinner(boxerUuid);
          setIsFightWinnerMenuOpen(false);
        }}
        ownerTab={ownerTab}
        renderGrid={renderGridCard}
        renderGridSortButton={renderBoxerSortButton}
        renderRingGrid={renderRingGridCard}
        ringDetailSearch={ringDetailSearch}
        ringDetailViewMode={ringDetailViewMode}
        ringSideJudgesState={ringSideJudgesState}
        ringsState={ringsState}
        room={room}
        roomApplications={roomApplications}
        roomJudgeApplications={roomJudgeApplications}
        roundTimerSeconds={roundTimerSeconds}
        roundTimerText={roundTimerText}
        search={search}
        selectedBoxerIds={selectedBoxerIds}
        selectedFightRow={selectedChiefFightRow}
        selectedFightWinner={selectedFightWinner}
        selectedFightWinnerBlueUuid={selectedChiefFightBlueWinnerUuid}
        selectedFightWinnerRedUuid={selectedChiefFightRedWinnerUuid}
        submittedRounds={submittedSideJudgeRounds}
        timerOptions={roundTimerOptions}
        updateState={updateState}
        visibility={roomSectionVisibility}
        uiScenario={roomUiScenario}
        updatingApplicationId={updatingApplicationId}
        updatingJudgeApplicationId={updatingJudgeApplicationId}
        visiblePairsGrids={visiblePairsGrids}
        visibleRingTabs={visibleRingTabs}
        waitingApplicationsCount={waitingOwnerApplicationsCount}
        winnerDropdownRef={fightWinnerDropdownRef}
      />

      {message ? <AlertBanner message={message} /> : null}

      {isRoomSettingsModalOpen ? (
        <RoomSettingsModal
          activeSettingsTab={activeSettingsTab}
          applicationBoxers={applicationBoxers}
          deleteRoomState={roomDeleteState}
          room={room}
          roomForm={roomForm}
          rings={rings}
          ringsState={ringsState}
          selectedApplicationBoxerIds={selectedApplicationBoxerIds}
          submitState={guestApplicationState}
          updateRoomState={updateRoomState}
          onClose={() => setIsRoomSettingsModalOpen(false)}
          onDeleteRoom={onRoomDeleteConfirm}
          onEditRing={(ringName) => void handleStartEditRing(ringName)}
          onOwnerBoxersClear={() => setPendingApplicationAction({ type: "clear-mine" })}
          onOwnerBoxerToggle={handleToggleApplicationBoxer}
          onOwnerBoxersSubmit={handleSubmitRoomApplicationBoxers}
          onRoomFormChange={onRoomFormChange}
          onRoomSubmit={onRoomUpdateSubmit}
          onSettingsTabChange={handleSettingsTabChange}
          onToggleRing={(ring, status) => void handleQuickToggleRingStatus(ring, status)}
        />
      ) : null}

      <RoomModalsHost
        activeSideFightRow={activeSideFightRow}
        applicationBoxers={applicationBoxers}
        blueWinnerUuid={selectedChiefFightBlueWinnerUuid}
        editingBoxerForm={editingBoxerForm}
        editingBoxerId={editingBoxerId}
        editingGridId={editingGridId}
        editingRing={editingRing}
        fightNotes={fightNotes}
        fightNotesState={fightNotesState}
        gridForm={gridForm}
        gridState={gridState}
        guestApplicationState={guestApplicationState}
        guestJudgeApplicationState={guestJudgeApplicationState}
        isFightNotesModalOpen={isFightNotesModalOpen}
        isGridModalOpen={isGridModalOpen}
        isRoomApplicationBoxersModalOpen={isRoomApplicationBoxersModalOpen}
        pendingApplicationAction={pendingApplicationAction}
        pendingApplicationBoxers={pendingApplicationBoxers}
        pendingDraftAction={pendingDraftAction}
        pendingFightStatus={pendingFightStatus}
        pendingFightWinnerConfirm={pendingFightWinnerConfirm}
        pendingJudgeApplicationAction={pendingJudgeApplicationAction}
        pendingSideJudgeNoteConfirm={pendingSideJudgeNoteConfirm}
        redWinnerUuid={selectedChiefFightRedWinnerUuid}
        ringForm={ringForm}
        roomApplicationBoxersMode={roomApplicationBoxersModalMode}
        selectedApplicationBoxerIds={selectedApplicationBoxerIds}
        selectedBoxers={selectedBoxers}
        selectedChiefFightRow={selectedChiefFightRow}
        selectedFightWinner={selectedFightWinner}
        selectedSideJudgeRound={selectedSideJudgeRound}
        sideJudgeBlueRemark={sideJudgeBlueRemark}
        sideJudgeNoteState={sideJudgeNoteState}
        sideJudgeRedRemark={sideJudgeRedRemark}
        sortedGrids={sortedGrids}
        updateState={updateState}
        onApplicationBoxerToggle={handleToggleApplicationBoxer}
        onApplicationCancel={() => setPendingApplicationAction(null)}
        onApplicationConfirm={() => void handleConfirmPendingApplicationAction()}
        onBoxerClose={handleStopEditBoxer}
        onBoxerFieldChange={handleEditingBoxerFieldChange}
        onBoxerSubmit={handleSaveBoxer}
        onDraftCancel={() => setPendingDraftAction(null)}
        onDraftReset={() => void handleResetAndContinuePendingDraftAction()}
        onDraftSave={() => void handleSaveAndContinuePendingDraftAction()}
        onFightNotesClose={() => {
          if (fightNotesState !== "loading") {
            setIsFightNotesModalOpen(false);
          }
        }}
        onFightStatusCancel={() => setPendingFightStatus(null)}
        onFightStatusConfirm={(status) => void handleFightStatusChange(status)}
        onFightWinnerCancel={() => setPendingFightWinnerConfirm(false)}
        onFightWinnerConfirm={() => void handleConfirmFightWinner()}
        onGridClose={() => {
          if (gridState !== "loading") {
            setIsGridModalOpen(false);
            setEditingGridId(null);
          }
        }}
        onGridFieldChange={handleGridFormChange}
        onGridSubmit={editingGridId === null ? handleCreateGrid : handleSaveGrid}
        onJudgeApplicationCancel={() => setPendingJudgeApplicationAction(null)}
        onJudgeApplicationConfirm={() => void handleConfirmJudgeApplicationAction()}
        onRingClose={() => setEditingRing(null)}
        onRingFieldChange={handleRingFormChange}
        onRingSubmit={handleSaveRing}
        onRoomApplicationBoxersClose={handleCloseRoomApplicationBoxersModal}
        onRoomApplicationBoxersSubmit={handleSubmitRoomApplicationBoxers}
        onSideJudgeBlueRemarkChange={setSideJudgeBlueRemark}
        onSideJudgeNoteClose={() => setSelectedSideJudgeRound(null)}
        onSideJudgeNoteConfirm={() => void handleSubmitSideJudgeNote()}
        onSideJudgeNoteSubmit={() => setPendingSideJudgeNoteConfirm(true)}
        onSideJudgeRedRemarkChange={setSideJudgeRedRemark}
      />

    </section>
  );
}
