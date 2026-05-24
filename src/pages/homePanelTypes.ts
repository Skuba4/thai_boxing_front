import type React from "react";
import type {
  Boxer,
  BoxerPayload,
  Fight,
  Grid,
  Note,
  Ring,
  Room,
  RoomBoxer,
  RoomBoxerPayload,
  UserProfile,
} from "../features/auth/authApi";
import type { BoxerFormState, FightFormState, GridFormState, ProfileFormState, RingFormState, RoomBoxerFormState, RoomFormState } from "./homeForms";
import type { CabinetTab, PremiumStatus, RequestState } from "./homeSharedTypes";

export type RoomPanelCache = {
  boxers: RoomBoxer[];
  boxersState: RequestState;
  rings: Ring[];
  ringsState: RequestState;
  grids: Grid[];
  gridsState: RequestState;
  builtGridFights: Record<string, Fight[]>;
  activeRing: Ring | null;
  hasUnsavedDraftMoves: boolean;
  draftMovesByTargetGrid: Record<string, string[]>;
};

export type PremiumStatusBlockProps = {
  premiumApplicationStatus: PremiumStatus;
  premiumState: RequestState;
  onSubmit: () => void;
};

export type ProfilePanelProps = {
  email: string;
  message: string;
  premiumApplicationStatus: PremiumStatus;
  premiumState: RequestState;
  profile: UserProfile | null;
  profileForm: ProfileFormState;
  saveState: RequestState;
  onLogout: () => void;
  onPasswordChangePlaceholder: () => void;
  onPremiumSubmit: () => void;
  onProfileSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onProfileReset: () => void;
  onProfileFormChange: (field: keyof ProfileFormState, value: string) => void;
};

export type CompetitionsPanelProps = {
  hasPremiumAccess: boolean;
  message: string;
  myRooms: Room[];
  allRooms: Room[];
  pinnedRoomUuids: string[];
  roomsState: RequestState;
  onCreateRoomOpen: () => void;
  onRoomOpen: (room: Room) => void;
  onRoomPinToggle: (roomUuid: string) => void;
};

export type AthletesPanelProps = {
  boxerSearch: string;
  boxersState: RequestState;
  createBoxerState: RequestState;
  deleteBoxerState: RequestState;
  deletingBoxerId: string | null;
  filteredBoxers: Boxer[];
  message: string;
  onBoxerSearchChange: (value: string) => void;
  onCreateBoxerOpen: () => void;
  onDeleteBoxer: (boxerUuid: string) => void;
  onEditBoxerOpen: (boxer: Boxer) => void;
};

export type AuthChoiceProps = {
  onLoginOpen: () => void;
  onRegisterOpen: () => void;
};

export type LoginFormProps = {
  email: string;
  loginState: RequestState;
  message: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export type RegisterFormProps = {
  email: string;
  message: string;
  registerPassword: string;
  registerPasswordRepeat: string;
  registerState: RequestState;
  onEmailChange: (value: string) => void;
  onRegisterPasswordChange: (value: string) => void;
  onRegisterPasswordRepeatChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export type CreateRoomModalProps = {
  submitState: RequestState;
  roomForm: RoomFormState;
  title: string;
  submitLabel: string;
  showStatus?: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRoomFormChange: <K extends keyof RoomFormState>(field: K, value: RoomFormState[K]) => void;
};

export type RoomSettingsModalProps = {
  activeSettingsTab: "room" | "rings" | "owner-boxers";
  applicationBoxers: Boxer[];
  deleteRoomState: RequestState;
  roomForm: RoomFormState;
  rings: Ring[];
  ringsState: RequestState;
  room: Room;
  updateRoomState: RequestState;
  onDeleteRoom: () => void;
  onClose: () => void;
  onEditRing: (ringName: string) => void;
  onRoomFormChange: <K extends keyof RoomFormState>(field: K, value: RoomFormState[K]) => void;
  onRoomSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onOwnerBoxersClear: () => void;
  onSettingsTabChange: (tab: "room" | "rings" | "owner-boxers") => void;
  onOwnerBoxerToggle: (boxerUuid: string) => void;
  onOwnerBoxersSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  selectedApplicationBoxerIds: string[];
  submitState: RequestState;
  onToggleRing: (ring: Ring, status: Ring["status"]) => void;
};

export type ConfirmDeleteRoomModalProps = { roomName: string; submitState: RequestState; onCancel: () => void; onConfirm: () => void };
export type ConfirmDeleteApplicationModalProps = { title?: string; description?: string; descriptionClassName?: string; className?: string; content?: React.ReactNode; confirmLabel?: string; confirmButtonClassName?: string; showCancelButton?: boolean; submitState: RequestState; onCancel: () => void; onConfirm: () => void };
export type UnsavedChangesModalProps = { submitState: RequestState; onCancel: () => void; onSave: () => void; onReset: () => void };
export type BoxerModalProps = { boxerForm: BoxerFormState; submitState: RequestState; title: string; submitLabel: string; onClose: () => void; onFieldChange: (field: keyof BoxerFormState, value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
export type RoomBoxerModalProps = { boxerForm: RoomBoxerFormState; submitState: RequestState; title: string; submitLabel: string; onClose: () => void; onFieldChange: (field: keyof RoomBoxerPayload, value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
export type RingModalProps = { ring: Ring; ringForm: RingFormState; submitState: RequestState; onClose: () => void; onFieldChange: <K extends keyof RingFormState>(field: K, value: RingFormState[K]) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
export type FightModalProps = { fightForm: FightFormState; selectedBoxers: Array<Pick<Boxer, "uuid" | "first_name" | "last_name">>; availableRings: Ring[]; submitState: RequestState; title?: string; submitLabel?: string; onClose: () => void; onFieldChange: <K extends keyof FightFormState>(field: K, value: FightFormState[K]) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
export type GridModalProps = { gridForm: GridFormState; grids: Grid[]; selectedBoxers: Array<Pick<Boxer, "uuid" | "first_name" | "last_name">>; submitState: RequestState; title?: string; submitLabel?: string; onClose: () => void; onFieldChange: <K extends keyof GridFormState>(field: K, value: GridFormState[K]) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
export type FightNotesModalProps = { fightNumber: number | null; gridName: string; redName: string; blueName: string; notes: Note[]; submitState: RequestState; onClose: () => void };
export type RoomApplicationBoxersModalProps = { boxers: Boxer[]; selectedBoxerIds: string[]; submitState: RequestState; submitLabel?: string; onClose: () => void; onToggleBoxer: (boxerUuid: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
export type HomePageBaseProps = { activeTab: CabinetTab; activeRoom: Room | null; activeRooms: Room[]; email: string; message: string; hasPremiumAccess: boolean; onLogout: () => void; onOpenRoomTab: (roomUuid: string) => void; onTabChange: (tab: CabinetTab) => void; profile: UserProfile | null };
export type BoxerPayloadType = BoxerPayload;
