import { useCallback, useEffect, useMemo, useState } from "react";
import { clearAuthTokens, getAuthTokens } from "../features/auth/authStorage";
import { AuthChoice, LoginForm, RegisterForm } from "./components/AuthScreens";
import { CabinetSections } from "./components/CabinetSections";
import { BoxerModal } from "./components/modals/BoxerModals";
import { ConfirmDeleteRoomModal, UnsavedChangesModal } from "./components/modals/ConfirmModals";
import { CreateRoomModal } from "./components/modals/RoomModals";
import { capitalizeFirstLetter, filterBoxers, getEmptyBoxerForm, normalizeWeightInput } from "./homeBoxers";
import { PREMIUM_ACTIVE, type CabinetTab } from "./homeSharedTypes";
import { getDefaultRoomTab } from "./room/constants";
import { useAutoClearMessage } from "./alerts";
import { useHomeAuth } from "./useHomeAuth";
import { useHomeBoxers } from "./useHomeBoxers";
import { useHomeNavigation } from "./useHomeNavigation";
import { useHomeRooms } from "./useHomeRooms";
import { ACTIVE_ROOM_RING_STORAGE_KEY } from "./homeStorage";

function getDefaultCabinetTab(canViewParticipants: boolean): CabinetTab {
  return getDefaultRoomTab(false, canViewParticipants) === "participants" ? "athletes" : "competitions";
}

export function HomePage() {
  const auth = useHomeAuth();
  const rooms = useHomeRooms();
  const boxers = useHomeBoxers();
  const {
    setIsBootstrapping,
    setPremiumApplicationStatus,
  } = auth;
  const [activeRoomRingName, setActiveRoomRingName] = useState<string | null>(() =>
    sessionStorage.getItem(ACTIVE_ROOM_RING_STORAGE_KEY),
  );
  const initialCanViewParticipants = auth.premiumApplicationStatus === PREMIUM_ACTIVE;
  const nav = useHomeNavigation({
    activeTabDefault: getDefaultCabinetTab(initialCanViewParticipants),
    activeRoomRingName,
    activeRooms: [],
    hasUnsavedRoomDraftMoves: false,
  });

  const hasPremiumAccess = auth.premiumApplicationStatus === PREMIUM_ACTIVE;
  const availableRooms = useMemo(
    () => [...rooms.myRooms, ...rooms.allRooms.filter((room) => !rooms.myRooms.some((myRoom) => myRoom.uuid === room.uuid))],
    [rooms.allRooms, rooms.myRooms],
  );
  const activeRooms = useMemo(
    () =>
      nav.openRoomUuids
        .map((roomUuid) => availableRooms.find((room) => room.uuid === roomUuid) ?? null)
        .filter((room): room is (typeof availableRooms)[number] => room !== null),
    [availableRooms, nav.openRoomUuids],
  );
  const selectedRoom = availableRooms.find((room) => room.uuid === nav.activeRoomUuid) ?? null;
  const filteredBoxers = filterBoxers(boxers.boxers, boxers.boxerSearch);

  useAutoClearMessage(auth.authMessage, () => auth.setAuthMessage(""), auth.authMessageVersion);
  useAutoClearMessage(auth.profileMessage, () => auth.setProfileMessage(""), auth.profileMessageVersion);
  useAutoClearMessage(rooms.competitionsMessage, () => rooms.setCompetitionsMessage(""), rooms.competitionsMessageVersion);
  useAutoClearMessage(boxers.athletesMessage, () => boxers.setAthletesMessage(""), boxers.athletesMessageVersion);

  const handleLogout = useCallback(() => {
    clearAuthTokens();
    auth.resetAuthState();
    rooms.setCompetitionsMessage("");
    rooms.setRoomsState("idle");
    rooms.setCreateRoomState("idle");
    rooms.setDeleteRoomState("idle");
    rooms.setAllRooms([]);
    rooms.setMyRooms([]);
    rooms.setRoomForm({ name: "", description: "", start_date: "", status: "0" });
    rooms.setIsCreateRoomModalOpen(false);
    rooms.setEditingRoomId(null);
    rooms.setPendingDeleteRoom(null);
    rooms.setRoomPanelCache({});
    boxers.resetBoxersState();
    nav.setActiveTab("competitions");
    nav.setActiveRoomUuid(null);
    nav.setOpenRoomUuids([]);
    nav.setPendingCabinetNavigation(null);
    setActiveRoomRingName(null);
  }, [auth, boxers, nav, rooms]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      setPremiumApplicationStatus(null);
      const tokens = getAuthTokens();

      if (!tokens?.access) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      await auth.loadProfile(tokens.access, () => {
        boxers.setAthletesMessage("");
        boxers.resetBoxersState();
      });

      if (isMounted) {
        setIsBootstrapping(false);
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
    // Bootstrap must run only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (auth.profile && !hasPremiumAccess && nav.activeTab === "athletes") {
      nav.setActiveTab("profile");
    }
  }, [auth.profile, hasPremiumAccess, nav]);

  useEffect(() => {
    if (nav.activeTab === "competition-room" && rooms.roomsState !== "loading" && rooms.roomsState !== "idle" && !selectedRoom) {
      nav.setActiveTab("competitions");
    }
  }, [nav, rooms.roomsState, selectedRoom]);

  useEffect(() => {
    if (auth.view !== "cabinet" || auth.profileState !== "idle") return;
    const tokens = getAuthTokens();
    if (!tokens?.access) {
      handleLogout();
      return;
    }
    void auth.loadProfile(tokens.access, () => {
      boxers.setAthletesMessage("");
      boxers.resetBoxersState();
    });
  }, [auth, auth.profileState, auth.view, boxers, handleLogout]);

  useEffect(() => {
    if (auth.view !== "cabinet" || rooms.roomsState !== "idle") return;
    const tokens = getAuthTokens();
    void rooms.loadRooms(tokens?.access, Boolean(tokens?.access), nav.activeRoomUuid, nav.openRoomUuids, nav.setOpenRoomUuids, nav.setActiveRoomUuid);
  }, [auth.view, nav.activeRoomUuid, nav.openRoomUuids, nav.setActiveRoomUuid, nav.setOpenRoomUuids, rooms, rooms.roomsState]);

  useEffect(() => {
    if (auth.view !== "cabinet" || nav.activeTab !== "athletes" || !hasPremiumAccess || boxers.boxersState !== "idle") return;
    const tokens = getAuthTokens();
    if (!tokens?.access) {
      handleLogout();
      return;
    }
    void boxers.loadBoxers(tokens.access);
  }, [auth.view, boxers, boxers.boxersState, handleLogout, hasPremiumAccess, nav.activeTab]);

  async function handleSaveAndNavigate() {
    if (!nav.pendingCabinetNavigation || !selectedRoom) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return handleLogout();
    try {
      nav.setCabinetNavigationState("loading");
      await rooms.saveDraftMoves(tokens.access, selectedRoom.uuid, rooms.roomPanelCache[selectedRoom.uuid]);
      rooms.setRoomPanelCache((current) => ({
        ...current,
        [selectedRoom.uuid]: current[selectedRoom.uuid]
          ? { ...current[selectedRoom.uuid], hasUnsavedDraftMoves: false, draftMovesByTargetGrid: {} }
          : current[selectedRoom.uuid],
      }));
      nav.setCabinetNavigationState("success");
      nav.applyPendingCabinetNavigation(nav.pendingCabinetNavigation, setActiveRoomRingName);
    } catch (error) {
      nav.setCabinetNavigationState("error");
      rooms.setCompetitionsMessage(String(error instanceof Error ? error.message : error));
    } finally {
      nav.setCabinetNavigationState("idle");
    }
  }

  function handleResetAndNavigate() {
    if (!nav.pendingCabinetNavigation || !selectedRoom) return;
    rooms.setRoomPanelCache((current) => ({
      ...current,
      [selectedRoom.uuid]: current[selectedRoom.uuid]
        ? { ...current[selectedRoom.uuid], hasUnsavedDraftMoves: false, draftMovesByTargetGrid: {} }
        : current[selectedRoom.uuid],
    }));
    nav.applyPendingCabinetNavigation(nav.pendingCabinetNavigation, setActiveRoomRingName);
  }

  function updateProfileForm(field: "first_name" | "last_name" | "city" | "club", value: string) {
    auth.setProfileForm((current) => ({ ...current, [field]: capitalizeFirstLetter(value) }));
  }

  function updateRoomForm<K extends "name" | "description" | "start_date" | "status">(field: K, value: (typeof rooms.roomForm)[K]) {
    const nextValue = typeof value === "string" && (field === "name" || field === "description") ? capitalizeFirstLetter(value) : value;
    rooms.setRoomForm((current) => ({ ...current, [field]: nextValue }));
  }

  function updateNewBoxerForm(field: keyof typeof boxers.newBoxerForm, value: string) {
    const nextValue = field === "first_name" || field === "last_name" || field === "middle_name"
      ? capitalizeFirstLetter(value)
      : field === "weight"
        ? normalizeWeightInput(value)
        : value;
    boxers.setNewBoxerForm((current) => ({ ...current, [field]: nextValue }));
  }

  function updateEditingBoxerForm(field: keyof typeof boxers.editingBoxerForm, value: string) {
    const nextValue = field === "first_name" || field === "last_name" || field === "middle_name"
      ? capitalizeFirstLetter(value)
      : field === "weight"
        ? normalizeWeightInput(value)
        : value;
    boxers.setEditingBoxerForm((current) => ({ ...current, [field]: nextValue }));
  }

  function handleRoomPinToggle(roomUuid: string) {
    const result = nav.togglePinnedRoom(roomUuid);

    if (result.limitExceeded) {
      rooms.setCompetitionsMessage("Можно закрепить только 3 соревнования.");
      return;
    }

    if (result.changed) {
      rooms.setCompetitionsMessage(result.pinned ? "Соревнование закреплено." : "Соревнование откреплено.");
    }
  }

  const handleRoomCacheChange = useCallback((roomUuid: string, nextState: Parameters<typeof nav.handleRoomCacheChange>[1]) => {
    nav.handleRoomCacheChange(roomUuid, nextState, rooms.setRoomPanelCache);
  }, [nav.handleRoomCacheChange, rooms.setRoomPanelCache]);

  const handleRoomActiveRingsChange = useCallback(() => {}, []);

  if (auth.isBootstrapping) {
    return <section className="auth-screen" />;
  }

  if (auth.view === "cabinet") {
    return (
      <>
        <CabinetSections
          activeRoom={selectedRoom}
          activeRoomRingName={activeRoomRingName}
          activeRooms={activeRooms}
          activeTab={nav.activeTab}
          allRooms={rooms.allRooms}
          athletesMessage={boxers.athletesMessage}
          boxerSearch={boxers.boxerSearch}
          boxers={boxers.boxers}
          boxersState={boxers.boxersState}
          competitionsMessage={rooms.competitionsMessage}
          createBoxerState={boxers.createBoxerState}
          deleteBoxerState={boxers.deleteBoxerState}
          deletingBoxerId={boxers.deletingBoxerId}
          email={auth.email}
          filteredBoxers={filteredBoxers}
          hasPremiumAccess={hasPremiumAccess}
          myRooms={rooms.myRooms}
          premiumApplicationStatus={auth.premiumApplicationStatus}
          premiumState={auth.premiumState}
          profile={auth.profile}
          profileForm={auth.profileForm}
          profileMessage={auth.profileMessage}
          roomPanelCache={rooms.roomPanelCache}
          roomsState={rooms.roomsState}
          saveState={auth.saveState}
          setActiveRoomRingName={setActiveRoomRingName}
          setActiveTab={nav.setActiveTab}
          setBoxerSearch={boxers.setBoxerSearch}
          onBoxerDelete={(boxerUuid) => {
            const tokens = getAuthTokens();
            if (!tokens?.access) return handleLogout();
            void boxers.handleDeleteBoxer(boxerUuid, tokens.access);
          }}
          onBoxerEditOpen={boxers.handleStartEditBoxer}
          onCabinetTabChange={nav.handleCabinetTabChange}
          onCreateBoxerOpen={() => boxers.setIsCreateBoxerModalOpen(true)}
          onCreateRoomOpen={() => rooms.setIsCreateRoomModalOpen(true)}
          onLogout={handleLogout}
          onOpenRoomTab={(roomUuid) => nav.handleOpenRoomTab(roomUuid, setActiveRoomRingName)}
          onRoomPinToggle={handleRoomPinToggle}
          onPasswordChangePlaceholder={() => auth.setProfileMessage("Смену пароля подключим позже.")}
          onPremiumSubmit={() => {
            const tokens = getAuthTokens();
            if (!tokens?.access) return handleLogout();
            void auth.handlePremiumApplication(tokens.access, async () => auth.loadProfile(tokens.access, () => boxers.resetBoxersState()));
          }}
          onProfileFormChange={updateProfileForm}
          onProfileReset={() => {
            if (!auth.profile) return;
            auth.setProfileForm({
              first_name: auth.profile.first_name ?? "",
              last_name: auth.profile.last_name ?? "",
              city: auth.profile.city ?? "",
              club: auth.profile.club ?? "",
            });
            auth.setAuthMessage("");
          }}
          onProfileSave={(event) => {
            const tokens = getAuthTokens();
            if (!tokens?.access) return handleLogout();
            void auth.handleProfileSave(event, tokens.access);
          }}
          onRoomActiveRingsChange={handleRoomActiveRingsChange}
          onRoomCacheChange={handleRoomCacheChange}
          onRoomDeleteConfirm={() => {
            if (selectedRoom) {
              rooms.setPendingDeleteRoom(selectedRoom);
            }
          }}
          onRoomPatch={(roomUuid, patch) => {
            rooms.patchRoom(roomUuid, patch);
          }}
          onRoomFormChange={updateRoomForm}
          onRoomUpdateSubmit={(event) => {
            const tokens = getAuthTokens();
            if (!tokens?.access) return handleLogout();
            void rooms.handleUpdateRoom(event, tokens.access);
          }}
          roomForm={rooms.roomForm}
          roomDeleteState={rooms.deleteRoomState}
          setEditingRoom={(room) => {
            rooms.setEditingRoomId(room.uuid);
            rooms.setRoomForm({
              name: room.name,
              description: room.description ?? "",
              start_date: room.start_date,
              status: room.status,
            });
          }}
          updateRoomState={rooms.updateRoomState}
        />

        {rooms.isCreateRoomModalOpen ? (
          <CreateRoomModal
            submitState={rooms.createRoomState}
            roomForm={rooms.roomForm}
            title="Новое соревнование"
            submitLabel="Создать"
            showStatus={false}
            onClose={() => {
              rooms.setIsCreateRoomModalOpen(false);
              rooms.setRoomForm({ name: "", description: "", start_date: "", status: "0" });
            }}
            onSubmit={(event) => {
              const tokens = getAuthTokens();
              if (!tokens?.access) return handleLogout();
              void rooms.handleCreateRoom(event, tokens.access);
            }}
            onRoomFormChange={updateRoomForm}
          />
        ) : null}

        {rooms.pendingDeleteRoom ? (
          <ConfirmDeleteRoomModal
            roomName={rooms.pendingDeleteRoom.name}
            submitState={rooms.deleteRoomState}
            onCancel={() => {
              if (rooms.deleteRoomState !== "loading") rooms.setPendingDeleteRoom(null);
            }}
            onConfirm={() => {
              const tokens = getAuthTokens();
              if (!tokens?.access) return handleLogout();
              void rooms.handleDeleteRoom(
                rooms.pendingDeleteRoom!.uuid,
                tokens.access,
                nav.activeRoomUuid,
                nav.openRoomUuids,
                nav.setOpenRoomUuids,
                nav.setActiveRoomUuid,
                setActiveRoomRingName,
                nav.setActiveTab,
              );
            }}
          />
        ) : null}

        {nav.pendingCabinetNavigation ? (
          <UnsavedChangesModal
            submitState={nav.cabinetNavigationState}
            onCancel={() => nav.setPendingCabinetNavigation(null)}
            onSave={() => void handleSaveAndNavigate()}
            onReset={handleResetAndNavigate}
          />
        ) : null}

        {boxers.isCreateBoxerModalOpen ? (
          <BoxerModal
            boxerForm={boxers.newBoxerForm}
            submitState={boxers.createBoxerState}
            title="Новый спортсмен"
            submitLabel="Сохранить"
            onClose={() => {
              if (boxers.createBoxerState !== "loading") {
                boxers.setIsCreateBoxerModalOpen(false);
                boxers.setNewBoxerForm(getEmptyBoxerForm());
              }
            }}
            onFieldChange={updateNewBoxerForm}
            onSubmit={(event) => {
              const tokens = getAuthTokens();
              if (!tokens?.access) return handleLogout();
              void boxers.handleCreateBoxer(event, tokens.access);
            }}
          />
        ) : null}

        {boxers.isEditBoxerModalOpen ? (
          <BoxerModal
            boxerForm={boxers.editingBoxerForm}
            submitState={boxers.updateBoxerState}
            title="Изменить спортсмена"
            submitLabel="Сохранить"
            onClose={boxers.handleStopEditBoxer}
            onFieldChange={updateEditingBoxerForm}
            onSubmit={(event) => {
              const tokens = getAuthTokens();
              if (!tokens?.access) return handleLogout();
              void boxers.handleSaveBoxer(event, tokens.access);
            }}
          />
        ) : null}
      </>
    );
  }

  return (
    <section className="auth-screen">
      <div className="auth-panel">
        {auth.view === "choice" ? (
          <AuthChoice
            onLoginOpen={() => {
              auth.setAuthMessage("");
              auth.setView("login");
            }}
            onRegisterOpen={() => {
              auth.setAuthMessage("");
              auth.setView("register");
            }}
          />
        ) : null}

        {auth.view === "login" ? (
          <LoginForm
            email={auth.email}
            loginState={auth.loginState}
            message={auth.authMessage}
            password={auth.password}
            onEmailChange={auth.setEmail}
            onPasswordChange={auth.setPassword}
            onSubmit={(event) => void auth.handleLogin(event, () => {
              rooms.setRoomsState("idle");
              boxers.setBoxersState?.("idle");
            })}
            onBack={() => {
              auth.setProfileMessage("");
              auth.setView("choice");
            }}
          />
        ) : null}

        {auth.view === "register" ? (
          <RegisterForm
            email={auth.email}
            message={auth.authMessage}
            registerPassword={auth.registerPassword}
            registerPasswordRepeat={auth.registerPasswordRepeat}
            registerState={auth.registerState}
            onEmailChange={auth.setEmail}
            onRegisterPasswordChange={auth.setRegisterPassword}
            onRegisterPasswordRepeatChange={auth.setRegisterPasswordRepeat}
            onSubmit={(event) => void auth.handleRegister(event)}
            onBack={() => {
              auth.setAuthMessage("");
              auth.setView("choice");
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
