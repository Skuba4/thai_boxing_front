import type { RoomApplicationStatus } from "../../entities/applications/types";
import type { RoomJudge } from "../../entities/rooms/types";
import type { Room } from "../../entities/rooms/types";
import type { Ring } from "../../features/auth/authApi";

type BannerTone = "warning" | "success" | "danger";

export type RoomUiBanner = {
  tone: BannerTone;
  text: string;
  icon: "alert" | "check" | "cross";
  action?: {
    kind: "trainer-apply" | "trainer-edit" | "trainer-delete" | "judge-apply" | "judge-delete";
    label: string;
    tone: "apply" | "edit" | "delete" | "judge";
    loadingText: string;
  };
  secondaryAction?: {
    kind: "trainer-delete";
    label: string;
    tone: "delete";
    loadingText: string;
  };
};

export type RoomUiScenarioState = ReturnType<typeof getRoomUiScenario>;
export type RoomSectionVisibility = ReturnType<typeof getRoomSectionVisibility>;

type Input = {
  activeRingName: string | null;
  guestRoomApplicationStatus: RoomApplicationStatus | null;
  hasPremiumAccess: boolean;
  isChiefJudge: boolean;
  isOwner: boolean;
  isSideJudge: boolean;
  isSpectatorGuest: boolean;
  judgeStatus: RoomApplicationStatus | null;
  room: Room;
};

type AccessInput = {
  guestRoomApplicationStatus: RoomApplicationStatus | null;
  guestJudge: RoomJudge | null;
  hasPremiumAccess: boolean;
  room: Room;
  rings: Ring[];
};

export type RoomAccessState = {
  canViewPairs: boolean;
  canViewParticipants: boolean;
  canViewRings: boolean;
  canViewRingsOverview: boolean;
  isActiveSideJudge: boolean;
  isApprovedTrainer: boolean;
  isChiefJudge: boolean;
  isInactiveSideJudge: boolean;
  isJudge: boolean;
  isSideJudge: boolean;
  isSpectatorGuest: boolean;
  isUnassignedJudge: boolean;
  judgeRingName: string | null;
  judgeStatus: RoomApplicationStatus | null;
};

function getPreparationDateText(room: Room) {
  return new Date(room.start_date).toLocaleDateString("ru-RU");
}

export function getRoomAccessState(input: AccessInput): RoomAccessState {
  const { guestJudge, guestRoomApplicationStatus, hasPremiumAccess, room, rings } = input;
  const isApprovedTrainer = !room.is_owner && hasPremiumAccess && guestRoomApplicationStatus === "Y";
  const judgeStatus = guestJudge?.status ?? null;
  const judgeRingName = guestJudge?.ring || null;
  const isJudge = !room.is_owner && judgeStatus === "Y";
  const judgeRing = rings.find((ring) => ring.name === judgeRingName)?.my_judge_extended ?? null;
  const judgeRole = judgeRing?.role ?? guestJudge?.role ?? null;
  const isChiefJudge = isJudge && judgeRole === "chief";
  const isSideJudge = isJudge && judgeRole === "side";
  const isActiveSideJudge = isSideJudge && judgeRing?.is_active === true;
  const isInactiveSideJudge = isSideJudge && judgeRing?.is_active === false;

  return {
    canViewPairs: room.is_owner || isApprovedTrainer,
    canViewParticipants: room.is_owner || isApprovedTrainer,
    canViewRings: true,
    canViewRingsOverview: room.is_owner,
    isActiveSideJudge,
    isApprovedTrainer,
    isChiefJudge,
    isInactiveSideJudge,
    isJudge,
    isSideJudge,
    isSpectatorGuest: !room.is_owner && !isApprovedTrainer && !isJudge,
    isUnassignedJudge: isJudge && !judgeRingName,
    judgeRingName,
    judgeStatus,
  };
}

export function getVisibleRingTabs({
  access,
  rings,
  room,
}: {
  access: Pick<RoomAccessState, "isApprovedTrainer" | "isChiefJudge" | "isJudge" | "judgeRingName">;
  rings: Ring[];
  room: Room;
}) {
  const activeRings = [...rings]
    .filter((ring) => ring.status !== "N")
    .sort((left, right) => left.name.localeCompare(right.name));
  const inactiveRings = [...rings]
    .filter((ring) => ring.status === "N")
    .sort((left, right) => left.name.localeCompare(right.name));
  const visibleRingTabs = room.is_owner
    ? activeRings
    : access.isApprovedTrainer
      ? activeRings
      : access.isChiefJudge && room.status === "N"
        ? activeRings
        : access.isJudge
          ? [...rings].filter((ring) => ring.name === access.judgeRingName).sort((left, right) => left.name.localeCompare(right.name))
          : room.status === "Y" || room.status === "N"
            ? activeRings
            : [];

  return { activeRings, inactiveRings, visibleRingTabs };
}

export function getRoomUiScenario(input: Input) {
  const { activeRingName, guestRoomApplicationStatus, hasPremiumAccess, isChiefJudge, isOwner, isSideJudge, isSpectatorGuest, judgeStatus, room } = input;

  const isGuestTrainerPending = hasPremiumAccess && guestRoomApplicationStatus === "0";
  const isGuestTrainerApproved = hasPremiumAccess && guestRoomApplicationStatus === "Y";
  const isGuestTrainerRejected = hasPremiumAccess && guestRoomApplicationStatus === "N";
  const isGuestJudgePending = !hasPremiumAccess && judgeStatus === "0" && room.status === "0";
  const isGuestJudgeApproved = !hasPremiumAccess && judgeStatus === "Y" && room.status === "0";
  const isGuestJudgeRejected = !hasPremiumAccess && judgeStatus === "N";
  const isChiefJudgePreparation = isChiefJudge && room.status === "0";
  const isChiefJudgeActive = isChiefJudge && room.status === "Y";
  const isChiefJudgeCompleted = isChiefJudge && room.status === "N";
  const isSideJudgeActive = isSideJudge && room.status === "Y";

  let primaryBanner: RoomUiBanner | null = null;

  if (isGuestTrainerApproved && room.status === "0") {
    primaryBanner = {
      tone: "success",
      icon: "check",
      text: "Ваши спортсмены участвуют в данном соревновании. Вы участвуете в жеребьевке.",
    };
  } else if (isGuestJudgeApproved) {
    primaryBanner = {
      tone: "success",
      icon: "check",
      text: "Заявка на судейство одобрена. Ринг и роль вы узнаете когда соревнование начнется. Ожидайте.",
    };
  } else if (isChiefJudgeActive) {
    primaryBanner = {
      tone: "success",
      icon: "check",
      text: `Ринг ${activeRingName ?? ""}. Главный судья.`,
    };
  } else if (isSideJudgeActive) {
    primaryBanner = {
      tone: "success",
      icon: "check",
      text: `Ринг ${activeRingName ?? ""}. Боковой судья.`,
    };
  } else if (isChiefJudgeCompleted) {
    primaryBanner = {
      tone: "success",
      icon: "check",
      text: "Соревнование завершено. Спасибо за участие.",
    };
  } else if (isSpectatorGuest && room.status === "0") {
    if (isGuestTrainerRejected) {
      primaryBanner = {
        tone: "danger",
        icon: "cross",
        text: "Вам отказано в участии.",
      };
    } else if (isGuestJudgeRejected) {
      primaryBanner = {
        tone: "danger",
        icon: "cross",
        text: "Вам отказано в участии в качестве судьи.",
      };
    } else if (isGuestTrainerPending) {
      primaryBanner = {
        tone: "success",
        icon: "check",
        text: "Вы подали заявку на участие, ожидайте решение по ней.",
        action: {
          kind: "trainer-edit",
          label: "Изменить состав",
          tone: "edit",
          loadingText: "Загрузка...",
        },
        secondaryAction: {
          kind: "trainer-delete",
          label: "Удалить заявку",
          tone: "delete",
          loadingText: "Удаление...",
        },
      };
    } else if (isGuestJudgePending) {
      primaryBanner = {
        tone: "success",
        icon: "check",
        text: `Соревнование начнется ${getPreparationDateText(room)}. Вы подали заявку на судейство, ожидайте решения.`,
        action: {
          kind: "judge-delete",
          label: "Удалить заявку",
          tone: "delete",
          loadingText: "Удаление...",
        },
      };
    } else if (hasPremiumAccess) {
      primaryBanner = {
        tone: "warning",
        icon: "alert",
        text: `Соревнование начнется ${getPreparationDateText(room)}. Вы можете подать заявку на участие.`,
        action: {
          kind: "trainer-apply",
          label: "Подать заявку",
          tone: "apply",
          loadingText: "Отправка...",
        },
      };
    } else {
      primaryBanner = {
        tone: "warning",
        icon: "alert",
        text: `Соревнование начнется ${getPreparationDateText(room)}. Вы можете подать заявку на судейство.`,
        action: {
          kind: "judge-apply",
          label: "Подать заявку",
          tone: "judge",
          loadingText: "Отправка...",
        },
      };
    }
  }

  return {
    hidePreparationContent:
      !isOwner && (isChiefJudgePreparation || isGuestJudgeApproved || (isSpectatorGuest && room.status === "0")),
    hideTabs: isChiefJudgeActive || isSideJudgeActive || (!isOwner && (isChiefJudgePreparation || isGuestJudgeApproved || (isSpectatorGuest && room.status === "0"))),
    renderCompletedChiefAsReadonly: isChiefJudgeCompleted,
    primaryBanner,
  };
}

export function getRoomSectionVisibility({
  access,
  ownerTab,
  scenario,
}: {
  access: {
    canViewPairs: boolean;
    canViewParticipants: boolean;
    isOwner: boolean;
  };
  ownerTab: "applications" | "participants" | "pairs" | "rings" | "ring-detail";
  scenario: RoomUiScenarioState;
}) {
  const canRenderContent = !scenario.hidePreparationContent;

  return {
    showTabs: !scenario.hideTabs,
    showApplications: canRenderContent && ownerTab === "applications" && access.isOwner,
    showParticipants: canRenderContent && ownerTab === "participants" && access.canViewParticipants,
    showPairs: canRenderContent && ownerTab === "pairs" && access.canViewPairs,
    showRingDetail: canRenderContent && ownerTab === "ring-detail",
  };
}
