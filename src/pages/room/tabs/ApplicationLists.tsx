import { Ban, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import type { JudgeApplication, Ring, RoomApplication } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import type { PendingApplicationAction } from "../types";

function getApplicationStatusOrder(status: "0" | "Y" | "N") {
  if (status === "0") return 0;
  if (status === "Y") return 1;
  return 2;
}

type TrainerApplicationsListProps = {
  roomApplications: RoomApplication[];
  updateState: RequestState;
  updatingApplicationId: string | null;
  onPendingApplicationAction: (action: PendingApplicationAction) => void;
};

export function TrainerApplicationsList({
  roomApplications,
  updateState,
  updatingApplicationId,
  onPendingApplicationAction,
}: TrainerApplicationsListProps) {
  const sortedApplications = [...roomApplications].sort(
    (left, right) => getApplicationStatusOrder(left.status) - getApplicationStatusOrder(right.status),
  );
  const groupedApplications = [
    sortedApplications.filter((application) => application.status === "0"),
    sortedApplications.filter((application) => application.status === "Y"),
    sortedApplications.filter((application) => application.status === "N"),
  ].filter((group) => group.length > 0);

  return (
    <div className="applications-clubs-groups">
      {groupedApplications.map((group, groupIndex) => (
        <div key={groupIndex} className="applications-clubs-grid">
          {group.map((application, index) => {
        const isUpdating = updateState === "loading" && updatingApplicationId === application.uuid;
        const isWaiting = application.status === "0";
        const isApproved = application.status === "Y";
        const clubName = application.user?.club?.trim();
        const cityName = application.user?.city?.trim();
        const fallbackName = application.user
          ? `${application.user.first_name} ${application.user.last_name}`.trim()
          : application.uuid;
        const name = clubName
          ? (cityName ? `${clubName} (${cityName})` : clubName)
          : fallbackName;

        return (
          <article
            key={application.uuid}
            className={`applications-club-card${
              isApproved
                ? " applications-club-card-approved"
                : isWaiting
                  ? " applications-club-card-waiting"
                  : " applications-club-card-rejected"
            }`}
          >
            <div className="applications-club-card-header">
              <span className="applications-club-card-index">{index + 1}</span>
              <span className="applications-club-card-title" title={name}>{name}</span>
            </div>
            <div className="applications-club-card-divider" />
            <div className="applications-club-card-actions">
              {isWaiting || !isApproved ? (
                <button
                  type="button"
                  className="applications-link-button applications-link-button-approve"
                  disabled={isUpdating}
                  aria-label="Принять"
                  title="Принять"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPendingApplicationAction({ type: "approve", applicationUuid: application.uuid });
                  }}
                >
                  {isUpdating ? "..." : <Check size={16} strokeWidth={2.2} aria-hidden="true" />}
                </button>
              ) : null}
              {isWaiting || isApproved ? (
                <button
                  type="button"
                  className="applications-link-button applications-link-button-warn"
                  disabled={isUpdating}
                  aria-label="Отклонить"
                  title="Отклонить"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPendingApplicationAction({ type: "reject", applicationUuid: application.uuid });
                  }}
                >
                  {isUpdating ? "..." : <Ban size={16} strokeWidth={2.2} aria-hidden="true" />}
                </button>
              ) : null}
              <button
                type="button"
                className="applications-link-button applications-link-button-danger"
                disabled={isUpdating}
                aria-label="Удалить"
                title="Удалить"
                onClick={(event) => {
                  event.stopPropagation();
                  onPendingApplicationAction({ type: "delete", applicationUuid: application.uuid });
                }}
              >
                {isUpdating ? "..." : <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />}
              </button>
            </div>
          </article>
        );
          })}
        </div>
      ))}
    </div>
  );
}

type JudgeApplicationsListProps = {
  activeRings: Ring[];
  roomJudgeApplications: JudgeApplication[];
  updateState: RequestState;
  updatingJudgeApplicationId: string | null;
  onJudgeChange: (
    applicationUuid: string,
    payload: Partial<Pick<JudgeApplication, "status" | "ring" | "role" | "is_active">>,
  ) => void;
  onJudgeDelete: (applicationUuid: string) => void;
};

export function JudgeApplicationsList({
  activeRings,
  roomJudgeApplications,
  updateState,
  updatingJudgeApplicationId,
  onJudgeChange,
  onJudgeDelete,
}: JudgeApplicationsListProps) {
  const [draggedJudgeId, setDraggedJudgeId] = useState<string | null>(null);
  const [dragTargetKey, setDragTargetKey] = useState<string | null>(null);
  const pendingApplications = roomJudgeApplications.filter((application) => application.status !== "Y");
  const approvedApplications = roomJudgeApplications.filter((application) => application.status === "Y");
  const unassignedJudges = approvedApplications.filter((application) => !application.ring);
  const ringAssignments = activeRings.map((ring) => {
    const ringJudges = approvedApplications.filter((application) => application.ring === ring.name);
    return {
      ring,
      chiefJudge: ringJudges.find((application) => application.role === "chief") ?? null,
      sideJudges: ringJudges.filter((application) => application.role === "side"),
    };
  });

  function getJudgeName(application: JudgeApplication) {
    return application.user
      ? `${application.user.first_name} ${application.user.last_name}`.trim()
      : application.uuid;
  }

  function handleJudgeDragStart(applicationUuid: string) {
    setDraggedJudgeId(applicationUuid);
  }

  function handleJudgeDragEnd() {
    setDraggedJudgeId(null);
    setDragTargetKey(null);
  }

  function handleJudgeDrop(role: JudgeApplication["role"], ringName: JudgeApplication["ring"]) {
    if (!draggedJudgeId) {
      return;
    }

    const draggedJudge = approvedApplications.find((application) => application.uuid === draggedJudgeId);
    if (!draggedJudge) {
      setDraggedJudgeId(null);
      return;
    }

    if (draggedJudge.role === role && draggedJudge.ring === ringName) {
      setDraggedJudgeId(null);
      return;
    }

    onJudgeChange(draggedJudgeId, { role, ring: ringName });
    setDraggedJudgeId(null);
    setDragTargetKey(null);
  }

  return (
    <div className="applications-judge-layout">
      <div className="applications-judges-cards-grid">
        {pendingApplications.map((application, index) => {
            const isUpdating = updateState === "loading" && updatingJudgeApplicationId === application.uuid;
            const isWaiting = application.status === "0";
            const name = getJudgeName(application);

            return (
              <article
                key={application.uuid}
                className={`applications-judge-card${
                  isWaiting
                    ? " applications-judge-card-waiting"
                    : " applications-judge-card-rejected"
                }`}
              >
                <div className="applications-club-card-header">
                  <span className="applications-club-card-index">{index + 1}</span>
                  <span className="applications-club-card-title" title={name}>{name}</span>
                </div>
                <div className="applications-club-card-divider" />
                <div className="applications-club-card-actions">
                  <button
                    type="button"
                    className="applications-link-button applications-link-button-approve"
                    disabled={isUpdating}
                    aria-label="Принять"
                    title="Принять"
                    onClick={() => onJudgeChange(application.uuid, { status: "Y", ring: "", role: "side" })}
                  >
                    {isUpdating ? "..." : <Check size={16} strokeWidth={2.2} aria-hidden="true" />}
                  </button>
                  {isWaiting ? (
                    <button
                      type="button"
                      className="applications-link-button applications-link-button-warn"
                      disabled={isUpdating}
                      aria-label="Отклонить"
                      title="Отклонить"
                      onClick={() => onJudgeChange(application.uuid, { status: "N" })}
                    >
                      {isUpdating ? "..." : <Ban size={16} strokeWidth={2.2} aria-hidden="true" />}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="applications-link-button applications-link-button-danger"
                    disabled={isUpdating}
                    aria-label="Удалить"
                    title="Удалить"
                    onClick={() => onJudgeDelete(application.uuid)}
                  >
                    {isUpdating ? "..." : <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />}
                  </button>
                </div>
              </article>
            );
        })}
      </div>

      <div className="applications-judge-unassigned">
        <div className="applications-judge-unassigned-head">Нераспределенные</div>
        <div
          className={`applications-judge-unassigned-list${dragTargetKey === "unassigned" ? " applications-judge-drop-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragTargetKey("unassigned");
          }}
          onDragLeave={() => setDragTargetKey((current) => (current === "unassigned" ? null : current))}
          onDrop={() => handleJudgeDrop("side", "")}
        >
          {unassignedJudges.map((application, index) => (
            <div
              key={application.uuid}
              draggable
              className={`applications-judge-chip${draggedJudgeId === application.uuid ? " applications-judge-chip-dragging" : ""}`}
              onDragStart={() => handleJudgeDragStart(application.uuid)}
              onDragEnd={handleJudgeDragEnd}
            >
              <span className="applications-judge-chip-index">{index + 1}</span>
              <span className="applications-judge-chip-name">{getJudgeName(application)}</span>
              <button
                type="button"
                className="applications-link-button applications-link-button-danger"
                aria-label="Удалить"
                title="Удалить"
                onClick={() => onJudgeDelete(application.uuid)}
              >
                <Trash2 size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          ))}
          {!unassignedJudges.length ? <div className="applications-judge-empty">Пусто</div> : null}
        </div>
      </div>

      <div className="applications-judge-rings-grid">
        {!ringAssignments.length ? <div className="applications-judge-empty">Нет активных рингов</div> : null}
        {ringAssignments.map(({ ring, chiefJudge, sideJudges }) => (
          <section key={ring.name} className="applications-judge-ring-column">
            <div className="applications-judge-ring-title">{ring.name}</div>
            <div
              className={`applications-judge-chief-slot${!chiefJudge ? " applications-judge-drop-target" : ""}${dragTargetKey === `chief-${ring.name}` ? " applications-judge-drop-active" : ""}`}
              onDragOver={(event) => {
                if (!chiefJudge) {
                  event.preventDefault();
                  setDragTargetKey(`chief-${ring.name}`);
                }
              }}
              onDragLeave={() => setDragTargetKey((current) => (current === `chief-${ring.name}` ? null : current))}
              onDrop={() => {
                if (!chiefJudge) {
                  handleJudgeDrop("chief", ring.name as JudgeApplication["ring"]);
                }
              }}
            >
              {chiefJudge ? (
                <div
                  draggable
                  className={`applications-judge-chip applications-judge-chip-chief${draggedJudgeId === chiefJudge.uuid ? " applications-judge-chip-dragging" : ""}`}
                  onDragStart={() => handleJudgeDragStart(chiefJudge.uuid)}
                  onDragEnd={handleJudgeDragEnd}
                >
                  <span className="applications-judge-chip-index" aria-hidden="true" />
                  <span className="applications-judge-chip-name">{getJudgeName(chiefJudge)}</span>
                  <button
                    type="button"
                    className="applications-link-button applications-link-button-danger"
                    aria-label="Удалить"
                    title="Удалить"
                    onClick={() => onJudgeDelete(chiefJudge.uuid)}
                  >
                    <Trash2 size={14} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="applications-judge-slot-empty">Главный судья</div>
              )}
            </div>
            <div
              className={`applications-judge-side-list${dragTargetKey === `side-${ring.name}` ? " applications-judge-drop-active" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragTargetKey(`side-${ring.name}`);
              }}
              onDragLeave={() => setDragTargetKey((current) => (current === `side-${ring.name}` ? null : current))}
              onDrop={() => handleJudgeDrop("side", ring.name as JudgeApplication["ring"])}
            >
              {sideJudges.length ? (
                sideJudges.map((application, index) => (
                  <div
                    key={application.uuid}
                    draggable
                    className={`applications-judge-chip applications-judge-chip-side${draggedJudgeId === application.uuid ? " applications-judge-chip-dragging" : ""}`}
                    onDragStart={() => handleJudgeDragStart(application.uuid)}
                    onDragEnd={handleJudgeDragEnd}
                  >
                    <span className="applications-judge-chip-index">{index + 1}</span>
                    <span className="applications-judge-chip-name">{getJudgeName(application)}</span>
                    <button
                      type="button"
                      className="applications-link-button applications-link-button-danger"
                      aria-label="Удалить"
                      title="Удалить"
                      onClick={() => onJudgeDelete(application.uuid)}
                    >
                      <Trash2 size={14} strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="applications-judge-slot-empty">Боковые судьи</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
