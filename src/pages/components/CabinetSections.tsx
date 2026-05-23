import type { Dispatch, SetStateAction } from "react";
import type { Boxer, Ring, Room, UserProfile } from "../../features/auth/authApi";
import { AthletesPanel } from "./AthletesPanel";
import { CabinetLayout } from "./CabinetLayout";
import { CompetitionsPanel } from "./CompetitionsPanel";
import { ProfilePanel } from "./ProfilePanel";
import { RoomPanel } from "../room/RoomPage";
import type { ProfileFormState } from "../homeForms";
import type { RoomFormState } from "../homeForms";
import type { RoomPanelCache } from "../homePanelTypes";
import type { CabinetTab, PremiumStatus, RequestState } from "../homeSharedTypes";

export function CabinetSections(props: {
  activeRoom: Room | null;
  activeRoomRingName: string | null;
  activeRooms: Room[];
  activeTab: CabinetTab;
  allRooms: Room[];
  athletesMessage: string;
  boxerSearch: string;
  boxers: Boxer[];
  boxersState: RequestState;
  competitionsMessage: string;
  createBoxerState: RequestState;
  deleteBoxerState: RequestState;
  deletingBoxerId: string | null;
  email: string;
  filteredBoxers: Boxer[];
  hasPremiumAccess: boolean;
  myRooms: Room[];
  premiumApplicationStatus: PremiumStatus;
  premiumState: RequestState;
  profile: UserProfile | null;
  profileForm: ProfileFormState;
  profileMessage: string;
  roomPanelCache: Record<string, RoomPanelCache>;
  roomsState: RequestState;
  saveState: RequestState;
  setActiveRoomRingName: Dispatch<SetStateAction<string | null>>;
  setActiveTab: Dispatch<SetStateAction<CabinetTab>>;
  setBoxerSearch: Dispatch<SetStateAction<string>>;
  onBoxerDelete: (boxerUuid: string) => void;
  onBoxerEditOpen: (boxer: Boxer) => void;
  onCabinetTabChange: (nextTab: CabinetTab) => void;
  onCreateBoxerOpen: () => void;
  onCreateRoomOpen: () => void;
  onLogout: () => void;
  onOpenRoomTab: (roomUuid: string) => void;
  onRoomDeleteConfirm: () => void;
  onRoomPatch: (roomUuid: string, patch: Partial<Room>) => void;
  onRoomFormChange: <K extends keyof RoomFormState>(field: K, value: RoomFormState[K]) => void;
  onRoomPinToggle: (roomUuid: string) => void;
  onRoomUpdateSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onPasswordChangePlaceholder: () => void;
  onPremiumSubmit: () => void;
  onProfileFormChange: (field: keyof ProfileFormState, value: string) => void;
  onProfileReset: () => void;
  onProfileSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onRoomActiveRingsChange: (rings: Ring[]) => void;
  onRoomCacheChange: (roomUuid: string, nextState: RoomPanelCache) => void;
  roomForm: RoomFormState;
  roomDeleteState: RequestState;
  setEditingRoom: (room: Room) => void;
  updateRoomState: RequestState;
}) {
  const {
    activeRoom,
    activeRoomRingName,
    activeRooms,
    activeTab,
    allRooms,
    athletesMessage,
    boxerSearch,
    boxersState,
    competitionsMessage,
    createBoxerState,
    deleteBoxerState,
    deletingBoxerId,
    email,
    filteredBoxers,
    hasPremiumAccess,
    myRooms,
    premiumApplicationStatus,
    premiumState,
    profile,
    profileForm,
    profileMessage,
    roomPanelCache,
    roomsState,
    saveState,
    setActiveRoomRingName,
    setActiveTab,
    onBoxerDelete,
    onBoxerEditOpen,
    onCabinetTabChange,
    onCreateBoxerOpen,
    onCreateRoomOpen,
    onLogout,
    onOpenRoomTab,
    onRoomDeleteConfirm,
    onRoomPatch,
    onRoomFormChange,
    onRoomPinToggle,
    onRoomUpdateSubmit,
    onPasswordChangePlaceholder,
    onPremiumSubmit,
    onProfileFormChange,
    onProfileReset,
    onProfileSave,
    onRoomActiveRingsChange,
    onRoomCacheChange,
    roomForm,
    roomDeleteState,
    setEditingRoom,
    updateRoomState,
  } = props;

  return (
    <section className="cabinet-screen">
      <CabinetLayout
        activeTab={activeTab}
        activeRoom={activeRoom}
        activeRooms={activeRooms}
        email={email}
        hasPremiumAccess={hasPremiumAccess}
        message=""
        onLogout={onLogout}
        onOpenRoomTab={onOpenRoomTab}
        onTabChange={onCabinetTabChange}
        profile={profile}
      >
        {activeTab === "profile" ? (
          <ProfilePanel
            email={email}
            message={profileMessage}
            premiumApplicationStatus={premiumApplicationStatus}
            premiumState={premiumState}
            profile={profile}
            profileForm={profileForm}
            saveState={saveState}
            onLogout={onLogout}
            onPasswordChangePlaceholder={onPasswordChangePlaceholder}
            onPremiumSubmit={onPremiumSubmit}
            onProfileSave={onProfileSave}
            onProfileReset={onProfileReset}
            onProfileFormChange={onProfileFormChange}
          />
        ) : null}

        {activeTab === "competitions" ? (
          <CompetitionsPanel
            hasPremiumAccess={hasPremiumAccess}
            message={competitionsMessage}
            myRooms={myRooms}
            allRooms={allRooms}
            pinnedRoomUuids={activeRooms.map((room) => room.uuid)}
            roomsState={roomsState}
            onCreateRoomOpen={onCreateRoomOpen}
            onRoomOpen={(room) => onOpenRoomTab(room.uuid)}
            onRoomPinToggle={onRoomPinToggle}
          />
        ) : null}

        {activeTab === "competition-room" && activeRoom ? (
          activeRoom.is_owner && !hasPremiumAccess ? (
            <section className="panel room-access-panel">
              <div className="room-access-message">
                <h2>{activeRoom.name}</h2>
                <p>Для доступа к управлению нужен активный премиум.</p>
                <button type="button" className="toolbar-action-button" onClick={() => setActiveTab("profile")}>
                  Перейти в профиль
                </button>
              </div>
            </section>
          ) : (
            <RoomPanel
              activeRingName={activeRoomRingName}
              cachedState={roomPanelCache[activeRoom.uuid]}
              currentUserEmail={email}
              hasPremiumAccess={hasPremiumAccess}
              onActiveRingNameChange={setActiveRoomRingName}
              onCacheChange={onRoomCacheChange}
              onActiveRingsChange={onRoomActiveRingsChange}
              onRoomDeleteConfirm={onRoomDeleteConfirm}
              onRoomPatch={onRoomPatch}
              onRoomFormChange={onRoomFormChange}
              onRoomUpdateSubmit={onRoomUpdateSubmit}
              roomForm={roomForm}
              roomDeleteState={roomDeleteState}
              setEditingRoom={setEditingRoom}
              updateRoomState={updateRoomState}
              room={activeRoom}
            />
          )
        ) : null}

        {activeTab === "athletes" ? (
          <AthletesPanel
            boxerSearch={boxerSearch}
            boxersState={boxersState}
            createBoxerState={createBoxerState}
            deleteBoxerState={deleteBoxerState}
            deletingBoxerId={deletingBoxerId}
            filteredBoxers={filteredBoxers}
            message={athletesMessage}
            onBoxerSearchChange={props.setBoxerSearch}
            onCreateBoxerOpen={onCreateBoxerOpen}
            onDeleteBoxer={onBoxerDelete}
            onEditBoxerOpen={onBoxerEditOpen}
          />
        ) : null}
      </CabinetLayout>
    </section>
  );
}
