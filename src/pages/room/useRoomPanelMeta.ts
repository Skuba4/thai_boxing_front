import { useMemo } from "react";
import type { JudgeApplication, RoomApplication } from "../../features/auth/authApi";
import { getRoomApplications, getRoomJudgeApplications } from "./selectors";

export function getJudgeApplicationUserName(application: JudgeApplication | undefined) {
  if (!application?.user) {
    return "Свободно";
  }

  return [application.user.last_name, application.user.first_name].filter(Boolean).join(" ") || application.user.email;
}

export function useRoomPanelMeta({
  applications,
  judgeApplications,
  roomUuid,
  roundTimerRemainingSeconds,
}: {
  applications: RoomApplication[];
  judgeApplications: JudgeApplication[];
  roomUuid: string;
  roundTimerRemainingSeconds: number;
}) {
  const roomApplications = useMemo(() => getRoomApplications(applications, roomUuid), [applications, roomUuid]);
  const roomJudgeApplications = useMemo(
    () => getRoomJudgeApplications(judgeApplications, roomUuid),
    [judgeApplications, roomUuid],
  );
  const waitingOwnerApplicationsCount =
    roomApplications.filter((application) => application.status === "0").length +
    roomJudgeApplications.filter((application) => application.status === "0").length;

  const roundTimerText = useMemo(() => {
    const minutes = Math.floor(roundTimerRemainingSeconds / 60);
    const seconds = roundTimerRemainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [roundTimerRemainingSeconds]);

  return {
    roomApplications,
    roomJudgeApplications,
    roundTimerText,
    waitingOwnerApplicationsCount,
  };
}
