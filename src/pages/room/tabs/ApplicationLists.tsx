import { Ban, Check, ListX, Pencil, Trash2 } from "lucide-react";
import type { JudgeApplication, Ring, RoomApplication } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";
import type { PendingApplicationAction } from "../types";

function getApplicationStatusOrder(status: "0" | "Y" | "N") {
  if (status === "Y") return 0;
  if (status === "0") return 1;
  return 2;
}

type TrainerApplicationsListProps = {
  roomApplications: RoomApplication[];
  updateState: RequestState;
  updatingApplicationId: string | null;
  onOwnerBoxersOpen: () => void;
  onPendingApplicationAction: (action: PendingApplicationAction) => void;
};

export function OwnerClubCard({
  onOwnerBoxersOpen,
  onPendingApplicationAction,
}: {
  onOwnerBoxersOpen: () => void;
  onPendingApplicationAction: (action: PendingApplicationAction) => void;
}) {
  return (
    <div className="applications-club-card-content">
      <div className="applications-club-card-header">
        <span className="applications-club-card-title">Мой клуб</span>
      </div>
      <div className="applications-club-card-divider" />
      <div className="applications-club-card-actions">
        <button
          type="button"
          className="applications-link-button applications-link-button-warn"
          aria-label="Редактировать"
          title="Редактировать"
          onClick={onOwnerBoxersOpen}
        >
          <Pencil size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="applications-link-button applications-link-button-danger"
          aria-label="Очистить список"
          title="Очистить список"
          onClick={() => onPendingApplicationAction({ type: "clear-mine" })}
        >
          <ListX size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function TrainerApplicationsList({
  roomApplications,
  updateState,
  updatingApplicationId,
  onOwnerBoxersOpen,
  onPendingApplicationAction,
}: TrainerApplicationsListProps) {
  const sortedApplications = [...roomApplications].sort(
    (left, right) => getApplicationStatusOrder(left.status) - getApplicationStatusOrder(right.status),
  );

  return (
    <div className="applications-clubs-grid">
      <OwnerClubCard
        onOwnerBoxersOpen={onOwnerBoxersOpen}
        onPendingApplicationAction={onPendingApplicationAction}
      />

      {sortedApplications.map((application, index) => {
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
        // Reserved for future debugging:
        // onPendingApplicationAction({ type: "refresh-one", applicationUuid: application.uuid });

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
  // Reserved for future debugging / quick rollback of judge actions.
  void onJudgeDelete;

  const sortedApplications = [...roomJudgeApplications].sort(
    (left, right) => getApplicationStatusOrder(left.status) - getApplicationStatusOrder(right.status),
  );

  return (
    <div className="applications-table applications-table-judges">
      <div className="applications-judges-head">
        <span aria-hidden="true" />
        <span>ФИО</span>
        <span>Роль</span>
        <span>Ринг</span>
        <span className="applications-table-actions-head" />
      </div>

      {sortedApplications.map((application, index) => {
        const isUpdating = updateState === "loading" && updatingJudgeApplicationId === application.uuid;
        const isWaiting = application.status === "0";
        const isApproved = application.status === "Y";
        const name = application.user
          ? `${application.user.first_name} ${application.user.last_name}`.trim()
          : application.uuid;

        return (
          <div
            key={application.uuid}
            className={`applications-judges-row${
              isApproved
                ? " applications-judges-row-approved"
                : isWaiting
                  ? " applications-judges-row-waiting"
                  : " applications-judges-row-rejected"
            }`}
          >
            <span className="applications-judges-index">{index + 1}</span>
            <span className="applications-table-name" title={name}>{name}</span>
            {isApproved ? (
              <label className="field judge-application-field judge-application-field-inline">
                <select
                  value={application.role}
                  disabled={isUpdating}
                  onChange={(event) => onJudgeChange(application.uuid, { role: event.target.value as JudgeApplication["role"] })}
                >
                  <option value="chief">Главный</option>
                  <option value="side">Боковой</option>
                </select>
              </label>
            ) : (
              <span />
            )}
            {isApproved ? (
              <label className="field judge-application-field judge-application-field-inline">
                <select
                  value={application.ring ?? ""}
                  disabled={isUpdating}
                  onChange={(event) => onJudgeChange(application.uuid, { ring: (event.target.value || "") as JudgeApplication["ring"] })}
                >
                  <option value="">-</option>
                  {activeRings.map((ring) => (
                    <option key={ring.name} value={ring.name}>
                      {ring.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <span />
            )}
            <div className="applications-table-actions">
              {isWaiting || !isApproved ? (
                <button
                  type="button"
                  className="applications-link-button applications-link-button-approve"
                  disabled={isUpdating}
                  aria-label="Принять"
                  title="Принять"
                  onClick={() => onJudgeChange(application.uuid, { status: "Y" })}
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
          </div>
        );
      })}
    </div>
  );
}
