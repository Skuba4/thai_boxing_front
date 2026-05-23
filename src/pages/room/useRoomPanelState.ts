import { useRef, useState } from "react";
import type {
  Boxer,
  CreateGridPayload,
  Fight,
  Grid,
  JudgeApplication,
  Note,
  NoteRound,
  Ring,
  RingStatus,
  Room,
  RoomApplication,
  RoomApplicationStatus,
  RoomBoxer,
} from "../../features/auth/authApi";
import { getEmptyRoomBoxerForm } from "../homeBoxers";
import type { RoomPanelCache } from "../homePanelTypes";
import { useFlashMessageState } from "../alerts";
import { getDefaultRoomTab, getRoomTabStorageKey } from "./constants";
import type {
  ApplicationBoxersMode,
  DraggingGridBoxer,
  DropTarget,
  OwnerTab,
  PendingApplicationAction,
  PendingDraftAction,
  PendingJudgeApplicationAction,
  RingGridOrderDrafts,
} from "./types";

export function useRoomPanelState({
  activeRingName,
  cachedState,
  hasPremiumAccess,
  room,
}: {
  activeRingName: string | null;
  cachedState?: RoomPanelCache;
  hasPremiumAccess: boolean;
  room: Room;
}) {
  const initialCanViewParticipants =
    room.is_owner || (!room.is_owner && hasPremiumAccess && (room.my_trainer_application_status ?? null) === "Y");
  const initialCanViewRingsOverview = room.is_owner;

  const [ownerTab, setOwnerTab] = useState<OwnerTab>(() => {
    const savedTab = sessionStorage.getItem(getRoomTabStorageKey(room.uuid));

    if (savedTab === "ring-detail" && activeRingName) return "ring-detail";
    if (savedTab === "applications" && room.is_owner) return "applications";
    if (savedTab === "pairs" && initialCanViewParticipants) return "pairs";
    if (savedTab === "participants" && initialCanViewParticipants) return "participants";
    if (savedTab === "rings" && initialCanViewRingsOverview) return "rings";

    return getDefaultRoomTab(room.is_owner, initialCanViewParticipants);
  });

  const draftGridBoxersRef = useRef<Record<string, import("./lib").DraftGridSlot[]>>({});
  const fightWinnerDropdownRef = useRef<HTMLDivElement | null>(null);

  const [boxers, setBoxers] = useState<RoomBoxer[]>(cachedState?.boxers ?? []);
  const [selectedBoxerIds, setSelectedBoxerIds] = useState<string[]>([]);
  const [boxersState, setBoxersState] = useState<"idle" | "loading" | "success" | "error">(cachedState?.boxersState ?? "idle");
  const messageFlash = useFlashMessageState();
  const [sideJudgeRedRemark, setSideJudgeRedRemark] = useState("");
  const [sideJudgeBlueRemark, setSideJudgeBlueRemark] = useState("");
  const [editingBoxerId, setEditingBoxerId] = useState<string | null>(null);
  const [editingBoxerForm, setEditingBoxerForm] = useState(getEmptyRoomBoxerForm());
  const [guestApplicationState, setGuestApplicationState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [guestRoomApplicationStatusOverride, setGuestRoomApplicationStatusOverride] = useState<RoomApplicationStatus | null | undefined>(undefined);
  const guestRoomApplicationStatus =
    guestRoomApplicationStatusOverride === undefined
      ? (room.my_trainer_application_status ?? null)
      : guestRoomApplicationStatusOverride;
  const [guestJudge, setGuestJudge] = useState(room.my_judge ?? null);
  const [guestJudgeApplicationState, setGuestJudgeApplicationState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pendingJudgeApplicationAction, setPendingJudgeApplicationAction] = useState<PendingJudgeApplicationAction | null>(null);
  const [isRoomApplicationBoxersModalOpen, setIsRoomApplicationBoxersModalOpen] = useState(false);
  const [roomApplicationBoxersModalMode, setRoomApplicationBoxersModalMode] = useState<ApplicationBoxersMode>("guest-apply");
  const [applicationBoxers, setApplicationBoxers] = useState<Boxer[]>([]);
  const [selectedApplicationBoxerIds, setSelectedApplicationBoxerIds] = useState<string[]>([]);
  const [updateState, setUpdateState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deleteState, setDeleteState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deletingBoxerId, setDeletingBoxerId] = useState<string | null>(null);
  const [applications, setApplications] = useState<RoomApplication[]>([]);
  const [applicationsState, setApplicationsState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [judgeApplications, setJudgeApplications] = useState<JudgeApplication[]>([]);
  const [judgeApplicationsState, setJudgeApplicationsState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [updatingJudgeApplicationId, setUpdatingJudgeApplicationId] = useState<string | null>(null);
  const [pendingApplicationAction, setPendingApplicationAction] = useState<PendingApplicationAction | null>(null);
  const [pendingDraftAction, setPendingDraftAction] = useState<PendingDraftAction | null>(null);
  const [rings, setRings] = useState<Ring[]>(cachedState?.rings ?? []);
  const [ringsState, setRingsState] = useState<"idle" | "loading" | "success" | "error">(cachedState?.ringsState ?? "idle");
  const [grids, setGrids] = useState<Grid[]>(cachedState?.grids ?? []);
  const [gridsState, setGridsState] = useState<"idle" | "loading" | "success" | "error">(cachedState?.gridsState ?? "idle");
  const [gridSearch, setGridSearch] = useState("");
  const [gridState, setGridState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [draftGridBoxers, setDraftGridBoxers] = useState<Record<string, import("./lib").DraftGridSlot[]>>({});
  const [draftRingGridOrders, setDraftRingGridOrders] = useState<RingGridOrderDrafts>({});
  const [savedRingGridOrders, setSavedRingGridOrders] = useState<RingGridOrderDrafts>({});
  const [builtGridFights, setBuiltGridFights] = useState<Record<string, Fight[]>>({});
  const [draggingGridBoxer, setDraggingGridBoxer] = useState<DraggingGridBoxer>(null);
  const [draggingRingGridId, setDraggingRingGridId] = useState<string | null>(null);
  const [ringGridDropTargetId, setRingGridDropTargetId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [editingGridId, setEditingGridId] = useState<string | null>(null);
  const [gridForm, setGridForm] = useState<CreateGridPayload>({ name: "", boxer_list: [] });
  const [activeRing, setActiveRing] = useState<Ring | null>(cachedState?.activeRing ?? null);
  const [ringDetailViewMode, setRingDetailViewMode] = useState<"bracket" | "list">("bracket");
  const [ringDetailSearch, setRingDetailSearch] = useState("");
  const [selectedChiefFightId, setSelectedChiefFightId] = useState<string | null>(null);
  const [roundTimerSeconds, setRoundTimerSeconds] = useState(180);
  const [roundTimerRemainingSeconds, setRoundTimerRemainingSeconds] = useState(180);
  const [isRoundTimerRunning, setIsRoundTimerRunning] = useState(false);
  const [fightNotes, setFightNotes] = useState<Note[]>([]);
  const [fightNotesState, setFightNotesState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isFightNotesModalOpen, setIsFightNotesModalOpen] = useState(false);
  const [ringSideJudges, setRingSideJudges] = useState<JudgeApplication[]>([]);
  const [ringSideJudgesState, setRingSideJudgesState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectedSideJudgeRound, setSelectedSideJudgeRound] = useState<NoteRound | null>(null);
  const [sideJudgeNoteState, setSideJudgeNoteState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sideJudgeNotes, setSideJudgeNotes] = useState<Note[]>([]);
  const [pendingSideJudgeNoteConfirm, setPendingSideJudgeNoteConfirm] = useState(false);
  const [selectedFightWinner, setSelectedFightWinner] = useState<string | null>("");
  const [pendingFightWinnerConfirm, setPendingFightWinnerConfirm] = useState(false);
  const [pendingFightStatus, setPendingFightStatus] = useState<Fight["status"] | null>(null);
  const [isFightWinnerMenuOpen, setIsFightWinnerMenuOpen] = useState(false);
  const [editingRing, setEditingRing] = useState<Ring | null>(null);
  const [ringForm, setRingForm] = useState<{ status: RingStatus; description: string }>({ status: "Y", description: "" });

  return {
    activeRing,
    applicationBoxers,
    applications,
    applicationsState,
    boxers,
    boxersState,
    builtGridFights,
    deleteState,
    deletingBoxerId,
    draftGridBoxers,
    draftGridBoxersRef,
    draftRingGridOrders,
    draggingGridBoxer,
    draggingRingGridId,
    dropTarget,
    editingBoxerForm,
    editingBoxerId,
    editingGridId,
    editingRing,
    fightNotes,
    fightNotesState,
    fightWinnerDropdownRef,
    gridForm,
    gridSearch,
    gridState,
    grids,
    gridsState,
    guestApplicationState,
    guestJudge,
    guestJudgeApplicationState,
    guestRoomApplicationStatus,
    isFightNotesModalOpen,
    isFightWinnerMenuOpen,
    isGridModalOpen,
    isRoomApplicationBoxersModalOpen,
    isRoundTimerRunning,
    judgeApplications,
    judgeApplicationsState,
    message: messageFlash.message,
    messageVersion: messageFlash.messageVersion,
    ownerTab,
    pendingApplicationAction,
    pendingDraftAction,
    pendingFightStatus,
    pendingFightWinnerConfirm,
    pendingJudgeApplicationAction,
    pendingSideJudgeNoteConfirm,
    ringDetailSearch,
    ringDetailViewMode,
    ringForm,
    ringGridDropTargetId,
    ringSideJudges,
    ringSideJudgesState,
    rings,
    ringsState,
    roomApplicationBoxersModalMode,
    roundTimerRemainingSeconds,
    roundTimerSeconds,
    savedRingGridOrders,
    selectedApplicationBoxerIds,
    selectedBoxerIds,
    selectedChiefFightId,
    selectedFightWinner,
    selectedSideJudgeRound,
    setActiveRing,
    setApplicationBoxers,
    setApplications,
    setApplicationsState,
    setBoxers,
    setBoxersState,
    setBuiltGridFights,
    setDeleteState,
    setDeletingBoxerId,
    setDraftGridBoxers,
    setDraftRingGridOrders,
    setDraggingGridBoxer,
    setDraggingRingGridId,
    setDropTarget,
    setEditingBoxerForm,
    setEditingBoxerId,
    setEditingGridId,
    setEditingRing,
    setFightNotes,
    setFightNotesState,
    setGridForm,
    setGridSearch,
    setGridState,
    setGrids,
    setGridsState,
    setGuestApplicationState,
    setGuestJudge,
    setGuestJudgeApplicationState,
    setGuestRoomApplicationStatus: setGuestRoomApplicationStatusOverride,
    setIsFightNotesModalOpen,
    setIsFightWinnerMenuOpen,
    setIsGridModalOpen,
    setIsRoomApplicationBoxersModalOpen,
    setIsRoundTimerRunning,
    setJudgeApplications,
    setJudgeApplicationsState,
    setMessage: messageFlash.setMessage,
    setOwnerTab,
    setPendingApplicationAction,
    setPendingDraftAction,
    setPendingFightStatus,
    setPendingFightWinnerConfirm,
    setPendingJudgeApplicationAction,
    setPendingSideJudgeNoteConfirm,
    setRingDetailSearch,
    setRingDetailViewMode,
    setRingForm,
    setRingGridDropTargetId,
    setRingSideJudges,
    setRingSideJudgesState,
    setRings,
    setRingsState,
    setRoomApplicationBoxersModalMode,
    setRoundTimerRemainingSeconds,
    setRoundTimerSeconds,
    setSavedRingGridOrders,
    setSelectedApplicationBoxerIds,
    setSelectedBoxerIds,
    setSelectedChiefFightId,
    setSelectedFightWinner,
    setSelectedSideJudgeRound,
    setSideJudgeBlueRemark,
    setSideJudgeNoteState,
    setSideJudgeNotes,
    setSideJudgeRedRemark,
    setUpdateState,
    setUpdatingApplicationId,
    setUpdatingJudgeApplicationId,
    sideJudgeBlueRemark,
    sideJudgeNoteState,
    sideJudgeNotes,
    sideJudgeRedRemark,
    updateState,
    updatingApplicationId,
    updatingJudgeApplicationId,
  };
}
