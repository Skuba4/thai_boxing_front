import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { JudgeApplication, Ring, RoomApplication } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import type { PendingApplicationAction } from "../types";
import { JudgeApplicationsList, TrainerApplicationsList } from "./ApplicationLists";

type ApplicationsTabProps = {
  activeRings: Ring[];
  applicationsState: RequestState;
  judgeApplicationsState: RequestState;
  roomApplications: RoomApplication[];
  roomJudgeApplications: JudgeApplication[];
  updateState: RequestState;
  updatingApplicationId: string | null;
  updatingJudgeApplicationId: string | null;
  onJudgeChange: (
    applicationUuid: string,
    payload: Partial<Pick<JudgeApplication, "status" | "ring" | "role" | "is_active">>,
  ) => void;
  onJudgeDelete: (applicationUuid: string) => void;
  onPendingApplicationAction: (action: PendingApplicationAction) => void;
};

export function ApplicationsTab({
  activeRings,
  applicationsState,
  judgeApplicationsState,
  roomApplications,
  roomJudgeApplications,
  updateState,
  updatingApplicationId,
  updatingJudgeApplicationId,
  onJudgeChange,
  onJudgeDelete,
  onPendingApplicationAction,
}: ApplicationsTabProps) {
  const [activeSection, setActiveSection] = useState<"trainers" | "judges">("trainers");
  const trainerWaitingCount = roomApplications.filter((application) => application.status === "0").length;
  const judgeWaitingCount = roomJudgeApplications.filter((application) => application.status === "0").length;

  return (
    <div className="room-applications-panel">
      <div className="room-applications-warning">
        <TriangleAlert size={16} strokeWidth={2.2} aria-hidden="true" />
        <p className="room-applications-note">
          Вносите изменения до жеребьевки иначе потеряете уже созданные пары
        </p>
      </div>

      {applicationsState === "loading" || judgeApplicationsState === "loading" ? (
        <p className="panel-message">Загружаем заявки...</p>
      ) : null}

      <div className="room-applications-sections">
        <button
          type="button"
          className={activeSection === "trainers" ? "room-applications-section-tab room-applications-section-tab-active" : "room-applications-section-tab"}
          onClick={() => setActiveSection("trainers")}
        >
          Клубы
          {trainerWaitingCount ? <span className="applications-button-badge">{trainerWaitingCount}</span> : null}
        </button>
        <button
          type="button"
          className={activeSection === "judges" ? "room-applications-section-tab room-applications-section-tab-active" : "room-applications-section-tab"}
          onClick={() => setActiveSection("judges")}
        >
          Судьи
          {judgeWaitingCount ? <span className="applications-button-badge">{judgeWaitingCount}</span> : null}
        </button>
      </div>

      {activeSection === "trainers" ? (
        <TrainerApplicationsList
          roomApplications={roomApplications}
          updateState={updateState}
          updatingApplicationId={updatingApplicationId}
          onPendingApplicationAction={onPendingApplicationAction}
        />
      ) : (
        <JudgeApplicationsList
          activeRings={activeRings}
          roomJudgeApplications={roomJudgeApplications}
          updateState={updateState}
          updatingJudgeApplicationId={updatingJudgeApplicationId}
          onJudgeChange={onJudgeChange}
          onJudgeDelete={onJudgeDelete}
        />
      )}
    </div>
  );
}
