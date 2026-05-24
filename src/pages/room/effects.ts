import { useEffect } from "react";
import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from "react";
import type { Fight, Grid, Note, Ring, RoomBoxer } from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import type { RoomPanelCache } from "../homePanelTypes";
import { useAutoClearMessage } from "../alerts";
import { getDefaultRoomTab, getRoomTabStorageKey } from "./constants";
import { getSyncedGridSlots } from "./lib";
import { areGridSlotsEqual } from "./lib";
import type { DraftGridSlot } from "./lib";
import type { FightRow, OwnerTab, RingGridOrderDrafts } from "./types";

type State = "idle" | "loading" | "success" | "error";

export function useMessageTimeout(message: string, setMessage: (message: string) => void, version?: number) {
  useAutoClearMessage(message, () => setMessage(""), version);
}

export function useRoundTimer({
  isRunning,
  resetSeconds,
  setIsRunning,
  setRemainingSeconds,
}: {
  isRunning: boolean;
  resetSeconds: number;
  setIsRunning: (value: boolean) => void;
  setRemainingSeconds: Dispatch<SetStateAction<number>>;
}) {
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let resetTimeoutId: number | null = null;
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);
          void new Audio("/sounds/gong.mp3").play().catch(() => undefined);
          resetTimeoutId = window.setTimeout(() => {
            setRemainingSeconds(resetSeconds);
          }, 500);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      if (resetTimeoutId !== null) {
        window.clearTimeout(resetTimeoutId);
      }
    };
  }, [isRunning, resetSeconds, setIsRunning, setRemainingSeconds]);
}

export function useRoomCache({
  activeRing,
  boxers,
  boxersState,
  builtGridFights,
  changedDraftGrids,
  grids,
  gridsState,
  hasDraftMoves,
  onCacheChange,
  rings,
  ringsState,
  roomUuid,
}: {
  activeRing: Ring | null;
  boxers: RoomBoxer[];
  boxersState: State;
  builtGridFights: Record<string, Fight[]>;
  changedDraftGrids: Map<string, string[]>;
  grids: Grid[];
  gridsState: State;
  hasDraftMoves: boolean;
  onCacheChange: (roomUuid: string, nextState: RoomPanelCache) => void;
  rings: Ring[];
  ringsState: State;
  roomUuid: string;
}) {
  useEffect(() => {
    const isDocumentHidden = typeof document !== "undefined" && document.visibilityState === "hidden";

    onCacheChange(roomUuid, {
      activeRing: isDocumentHidden ? null : activeRing,
      boxers: isDocumentHidden ? [] : boxers,
      boxersState: isDocumentHidden ? "idle" : boxersState,
      builtGridFights: isDocumentHidden ? {} : builtGridFights,
      draftMovesByTargetGrid: Object.fromEntries(changedDraftGrids),
      grids: isDocumentHidden ? [] : grids,
      gridsState: isDocumentHidden ? "idle" : gridsState,
      hasUnsavedDraftMoves: hasDraftMoves,
      rings: isDocumentHidden ? [] : rings,
      ringsState: isDocumentHidden ? "idle" : ringsState,
    });
  }, [
    activeRing,
    boxers,
    boxersState,
    builtGridFights,
    changedDraftGrids,
    grids,
    gridsState,
    hasDraftMoves,
    onCacheChange,
    rings,
    ringsState,
    roomUuid,
  ]);
}

export function useDraftSync({
  boxerById,
  builtGridFights,
  changedDraftGrids,
  defaultRingGridOrders,
  draftGridBoxers,
  draftGridBoxersRef,
  justBuiltGridIdRef,
  grids,
  rings,
  setDraftGridBoxers,
  setDraftRingGridOrders,
  setSavedRingGridOrders,
}: {
  boxerById: Map<string, RoomBoxer>;
  builtGridFights: Record<string, Fight[]>;
  changedDraftGrids: Map<string, string[]>;
  defaultRingGridOrders: RingGridOrderDrafts;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  draftGridBoxersRef: RefObject<Record<string, DraftGridSlot[]>>;
  justBuiltGridIdRef: MutableRefObject<string | null>;
  grids: Grid[];
  rings: Ring[];
  setDraftGridBoxers: Dispatch<SetStateAction<Record<string, DraftGridSlot[]>>>;
  setDraftRingGridOrders: Dispatch<SetStateAction<RingGridOrderDrafts>>;
  setSavedRingGridOrders: Dispatch<SetStateAction<RingGridOrderDrafts>>;
}) {
  useEffect(() => {
    draftGridBoxersRef.current = draftGridBoxers;
  }, [draftGridBoxers, draftGridBoxersRef]);

  useEffect(() => {
    const mergeOrders = (current: RingGridOrderDrafts) => {
      const nextState: RingGridOrderDrafts = {};

      for (const ring of rings) {
        const defaultOrder = defaultRingGridOrders[ring.name] ?? [];
        const currentOrder = current[ring.name] ?? [];
        const knownIds = new Set(defaultOrder);
        nextState[ring.name] = [
          ...currentOrder.filter((gridId) => knownIds.has(gridId)),
          ...defaultOrder.filter((gridId) => !currentOrder.includes(gridId)),
        ];
      }

      return nextState;
    };

    setSavedRingGridOrders(mergeOrders);
    setDraftRingGridOrders(mergeOrders);
  }, [defaultRingGridOrders, rings, setDraftRingGridOrders, setSavedRingGridOrders]);

  useEffect(() => {
    const justBuiltGridId = justBuiltGridIdRef.current;

    setDraftGridBoxers((current) => {
      const nextState: Record<string, DraftGridSlot[]> = {};
      let hasChanges = false;

      for (const grid of grids) {
        const currentGridBoxers = current[grid.uuid];
        const { savedBoxerIds, syncedGridSlots } = getSyncedGridSlots(grid, boxerById, builtGridFights);
        const shouldResetJustBuiltGrid = justBuiltGridId === grid.uuid;

        if (savedBoxerIds.length > 0 && boxerById.size === 0) {
          if (currentGridBoxers) {
            nextState[grid.uuid] = currentGridBoxers;
          }
          continue;
        }

        const nextGridBoxers = shouldResetJustBuiltGrid
          ? syncedGridSlots
          : changedDraftGrids.has(grid.uuid)
          ? (currentGridBoxers ?? syncedGridSlots)
          : syncedGridSlots;

        nextState[grid.uuid] = nextGridBoxers;

        if (!currentGridBoxers || !areGridSlotsEqual(currentGridBoxers, nextGridBoxers)) {
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        const currentGridIds = Object.keys(current);

        if (
          currentGridIds.length === Object.keys(nextState).length &&
          currentGridIds.every((gridId) => {
            const currentGridBoxers = current[gridId];
            const nextGridBoxers = nextState[gridId];

            return nextGridBoxers ? areGridSlotsEqual(currentGridBoxers, nextGridBoxers) : false;
          })
        ) {
          return current;
        }
      }

      return nextState;
    });
    if (justBuiltGridId) {
      justBuiltGridIdRef.current = null;
    }
  }, [boxerById, builtGridFights, changedDraftGrids, grids, justBuiltGridIdRef, setDraftGridBoxers]);
}

export function useTabStorage(ownerTab: OwnerTab, roomUuid: string) {
  useEffect(() => {
    sessionStorage.setItem(getRoomTabStorageKey(roomUuid), ownerTab);
  }, [ownerTab, roomUuid]);
}

export function useAutoOpenGuestRing({
  canViewRingsOverview,
  onActiveRingNameChange,
  ownerTab,
  setOwnerTab,
  visibleRingTabs,
}: {
  canViewRingsOverview: boolean;
  onActiveRingNameChange: (ringName: string | null) => void;
  ownerTab: OwnerTab;
  setOwnerTab: (tab: OwnerTab) => void;
  visibleRingTabs: Ring[];
}) {
  useEffect(() => {
    if (canViewRingsOverview || ownerTab !== "rings" || !visibleRingTabs.length) {
      return;
    }

    const firstVisibleRingName = visibleRingTabs[0]?.name;

    if (!firstVisibleRingName) {
      return;
    }

    setOwnerTab("ring-detail");
    onActiveRingNameChange(firstVisibleRingName);
  }, [canViewRingsOverview, onActiveRingNameChange, ownerTab, setOwnerTab, visibleRingTabs]);
}

export function useActiveRingSync({
  activeRing,
  activeRingName,
  canViewParticipants,
  isOwner,
  ownerTab,
  rings,
  setActiveRing,
  setOwnerTab,
}: {
  activeRing: Ring | null;
  activeRingName: string | null;
  canViewParticipants: boolean;
  isOwner: boolean;
  ownerTab: OwnerTab;
  rings: Ring[];
  setActiveRing: (ring: Ring | null) => void;
  setOwnerTab: (tab: OwnerTab) => void;
}) {
  useEffect(() => {
    if (activeRingName === null && ownerTab === "ring-detail" && !activeRing) {
      setActiveRing(null);
      setOwnerTab(getDefaultRoomTab(isOwner, canViewParticipants));
    }
  }, [activeRing, activeRingName, canViewParticipants, isOwner, ownerTab, setActiveRing, setOwnerTab]);

  useEffect(() => {
    if (ownerTab !== "ring-detail" || !activeRingName || !rings.length) {
      return;
    }

    const resolvedRing = rings.find((ring) => ring.name === activeRingName) ?? null;

    if (resolvedRing && activeRing?.name !== resolvedRing.name) {
      setActiveRing(resolvedRing);
    }
  }, [activeRing?.name, activeRingName, ownerTab, rings, setActiveRing]);
}

export function useFightWinnerMenu({
  isOpen,
  menuRef,
  setIsOpen,
}: {
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  setIsOpen: (value: boolean) => void;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: globalThis.MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, menuRef, setIsOpen]);
}

export function useChiefFightSelection({
  fightRows,
  isChiefJudge,
  ownerTab,
  selectedFightId,
  setSelectedFightId,
}: {
  fightRows: FightRow[];
  isChiefJudge: boolean;
  ownerTab: OwnerTab;
  selectedFightId: string | null;
  setSelectedFightId: (fightId: string | null) => void;
}) {
  useEffect(() => {
    if (!isChiefJudge || ownerTab !== "ring-detail") {
      return;
    }

    if (!fightRows.length) {
      setSelectedFightId(null);
      return;
    }

    const firstOpenFight = fightRows.find((row) => !row.fight.winner) ?? fightRows[0];

    if (!fightRows.some((row) => row.fight.uuid === selectedFightId)) {
      setSelectedFightId(firstOpenFight.fight.uuid);
    }
  }, [fightRows, isChiefJudge, ownerTab, selectedFightId, setSelectedFightId]);
}

export function useLoadSideJudgeNotes({
  activeFightRow,
  isActiveSideJudge,
  roomUuid,
  setSideJudgeNotes,
  loadNotes,
}: {
  activeFightRow: FightRow | null;
  isActiveSideJudge: boolean;
  roomUuid: string;
  setSideJudgeNotes: (notes: Awaited<ReturnType<typeof loadNotes>>) => void;
  loadNotes: (accessToken: string, roomUuid: string, fightUuid: string) => Promise<Note[]>;
}) {
  useEffect(() => {
    if (!isActiveSideJudge || !activeFightRow) {
      setSideJudgeNotes([]);
      return;
    }

    const tokens = getAuthTokens();

    if (!tokens?.access) {
      return;
    }

    void loadNotes(tokens.access, roomUuid, activeFightRow.fight.uuid)
      .then(setSideJudgeNotes)
      .catch(() => setSideJudgeNotes([]));
  }, [activeFightRow, activeFightRow?.fight.uuid, isActiveSideJudge, loadNotes, roomUuid, setSideJudgeNotes]);
}
