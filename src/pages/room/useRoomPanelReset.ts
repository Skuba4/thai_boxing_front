import { useEffect, useRef } from "react";
import type { Room, Ring } from "../../features/auth/authApi";
import { getEmptyRoomBoxerForm } from "../homeBoxers";
import type { RoomPanelCache } from "../homePanelTypes";
import { getDefaultRoomTab, getRoomTabStorageKey } from "./constants";

export function useRoomPanelReset({
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
}: {
  activeRingName: string | null;
  cachedState?: RoomPanelCache;
  canViewPairs: boolean;
  canViewParticipants: boolean;
  canViewRingsOverview: boolean;
  room: Room;
  setActiveRing: (value: Ring | null) => void;
  setApplicationBoxers: (value: []) => void;
  setApplications: (value: []) => void;
  setApplicationsState: (value: "idle") => void;
  setBoxers: (value: RoomPanelCache["boxers"]) => void;
  setBoxersState: (value: RoomPanelCache["boxersState"] | "idle") => void;
  setBuiltGridFights: (value: RoomPanelCache["builtGridFights"]) => void;
  setDraftGridBoxers: (value: Record<string, never>) => void;
  setDraftRingGridOrders: (value: Record<string, never>) => void;
  setDraggingGridBoxer: (value: null) => void;
  setDraggingRingGridId: (value: null) => void;
  setDropTarget: (value: null) => void;
  setEditingBoxerForm: (value: ReturnType<typeof getEmptyRoomBoxerForm>) => void;
  setEditingBoxerId: (value: null) => void;
  setEditingGridId: (value: null) => void;
  setEditingRing: (value: null) => void;
  setGridForm: (value: { name: string; boxer_list: [] }) => void;
  setGridSearch: (value: "") => void;
  setGridState: (value: "idle") => void;
  setGrids: (value: RoomPanelCache["grids"]) => void;
  setGridsState: (value: RoomPanelCache["gridsState"] | "idle") => void;
  setGuestApplicationState: (value: "idle") => void;
  setGuestJudge: (value: Room["my_judge"] | null) => void;
  setGuestJudgeApplicationState: (value: "idle") => void;
  setGuestRoomApplicationStatus: (value: Room["my_trainer_application_status"] | null | undefined) => void;
  setIsGridModalOpen: (value: false) => void;
  setIsRoomApplicationBoxersModalOpen: (value: false) => void;
  setIsRoundTimerRunning: (value: false) => void;
  setJudgeApplications: (value: []) => void;
  setJudgeApplicationsState: (value: "idle") => void;
  setMessage: (value: "") => void;
  setOwnerTab: (value: "ring-detail" | "applications" | "pairs" | "participants" | "rings") => void;
  setPendingJudgeApplicationAction: (value: null) => void;
  setRingDetailSearch: (value: "") => void;
  setRingDetailViewMode: (value: "bracket") => void;
  setRingForm: (value: { status: "Y"; description: "" }) => void;
  setRings: (value: RoomPanelCache["rings"]) => void;
  setRingsState: (value: RoomPanelCache["ringsState"] | "idle") => void;
  setRoomApplicationBoxersModalMode: (value: "guest-apply") => void;
  setRoundTimerRemainingSeconds: (value: 180) => void;
  setRoundTimerSeconds: (value: 180) => void;
  setSavedRingGridOrders: (value: Record<string, never>) => void;
  setSearch: (value: "") => void;
  setSelectedApplicationBoxerIds: (value: []) => void;
  setSelectedBoxerIds: (value: []) => void;
  setSelectedChiefFightId: (value: null) => void;
  setSortRules: (value: []) => void;
}) {
  const cachedStateRef = useRef(cachedState);
  const activeRingNameRef = useRef(activeRingName);

  useEffect(() => {
    cachedStateRef.current = cachedState;
  }, [cachedState]);

  useEffect(() => {
    activeRingNameRef.current = activeRingName;
  }, [activeRingName]);

  useEffect(() => {
    const cache = cachedStateRef.current;
    const currentActiveRingName = activeRingNameRef.current;
    const savedTab = sessionStorage.getItem(getRoomTabStorageKey(room.uuid));
    const defaultTab = getDefaultRoomTab(room.is_owner, canViewParticipants);
    const nextTab =
      savedTab === "ring-detail" && currentActiveRingName
        ? "ring-detail"
        : savedTab === "applications" && room.is_owner
          ? "applications"
          : savedTab === "pairs" && canViewPairs
            ? "pairs"
            : savedTab === "participants" && canViewParticipants
              ? "participants"
              : savedTab === "rings" && canViewRingsOverview
                ? "rings"
                : defaultTab;

    setOwnerTab(nextTab);
    setSearch("");
    setMessage("");
    setBoxers(cache?.boxers ?? []);
    setBoxersState(cache?.boxersState ?? "idle");
    setSelectedBoxerIds([]);
    setEditingBoxerId(null);
    setEditingBoxerForm(getEmptyRoomBoxerForm());
    setRings(cache?.rings ?? []);
    setRingsState(cache?.ringsState ?? "idle");
    setActiveRing(cache?.activeRing ?? null);
    setRingDetailViewMode("bracket");
    setRingDetailSearch("");
    setSelectedChiefFightId(null);
    setRoundTimerSeconds(180);
    setRoundTimerRemainingSeconds(180);
    setIsRoundTimerRunning(false);
    setEditingRing(null);
    setRingForm({ status: "Y", description: "" });
    setGuestRoomApplicationStatus(undefined);
    setGuestApplicationState("idle");
    setGuestJudge(room.my_judge ?? null);
    setGuestJudgeApplicationState("idle");
    setPendingJudgeApplicationAction(null);
    setIsRoomApplicationBoxersModalOpen(false);
    setRoomApplicationBoxersModalMode("guest-apply");
    setApplicationBoxers([]);
    setSelectedApplicationBoxerIds([]);
    setSortRules([]);
    setApplications([]);
    setApplicationsState("idle");
    setJudgeApplications([]);
    setJudgeApplicationsState("idle");
    setGrids(cache?.grids ?? []);
    setGridsState(cache?.gridsState ?? "idle");
    setGridSearch("");
    setDraftGridBoxers({});
    setDraftRingGridOrders({});
    setSavedRingGridOrders({});
    setBuiltGridFights(cache?.builtGridFights ?? {});
    setDraggingGridBoxer(null);
    setDraggingRingGridId(null);
    setDropTarget(null);
    setGridState("idle");
    setIsGridModalOpen(false);
    setEditingGridId(null);
    setGridForm({ name: "", boxer_list: [] });
  }, [
    canViewPairs,
    canViewParticipants,
    canViewRingsOverview,
    room.is_owner,
    room.my_judge,
    room.my_trainer_application_status,
    room.uuid,
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
  ]);
}
