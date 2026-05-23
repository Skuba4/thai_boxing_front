import type { Boxer } from "../../../features/auth/authApi";
import { formatBoxerDate, getBoxerRankClassName, getBoxerSexLabel } from "../../homeBoxers";
import { ConfirmDeleteApplicationModal } from "../../components/modals/ConfirmModals";
import type { PendingApplicationAction } from "../types";

type SubmitState = "idle" | "loading" | "success" | "error";

const confirmByAction: Record<
  PendingApplicationAction["type"],
  {
    title: string;
    description: string;
    confirmLabel: string;
    confirmButtonClassName: string;
  }
> = {
  approve: {
    title: "Это добавит новых участников",
    description: "",
    confirmLabel: "Одобрить",
    confirmButtonClassName: "application-icon-button-approve",
  },
  wait: {
    title: "Это удалит связанные пары",
    description: "",
    confirmLabel: "Изменить",
    confirmButtonClassName: "application-icon-button-waiting",
  },
  "refresh-one": {
    title: "Обновить заявку?",
    description: "Это обновит состав тренера и может УДАЛИТЬ связанные пары его спортсменов.",
    confirmLabel: "Да, обновить",
    confirmButtonClassName: "sync-button",
  },
  "save-mine": {
    title: "Это удалит все связанные пары",
    description: "",
    confirmLabel: "Сохранить",
    confirmButtonClassName: "sync-button",
  },
  reject: {
    title: "Вы уверены?",
    description: "",
    confirmLabel: "Отказать",
    confirmButtonClassName: "confirm-button-warn",
  },
  "clear-mine": {
    title: "Это удалит связанные пары",
    description: "",
    confirmLabel: "Очистить",
    confirmButtonClassName: "application-icon-button-delete",
  },
  delete: {
    title: "Это удалит связанные пары",
    description: "",
    confirmLabel: "Да, удалить",
    confirmButtonClassName: "danger-button",
  },
};

export function PendingApplicationConfirm({
  action,
  boxers = [],
  submitState,
  onCancel,
  onConfirm,
}: {
  action: PendingApplicationAction;
  boxers?: Boxer[];
  submitState: SubmitState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const config = confirmByAction[action.type];
  const shouldShowBoxers = action.type === "approve" && boxers.length > 0;

  return (
    <ConfirmDeleteApplicationModal
      title={config.title}
      description={config.description}
      descriptionClassName="modal-text modal-text-warning"
      content={
        shouldShowBoxers ? (
          <div className="room-application-boxers-list room-application-boxers-list-readonly">
            <div className="room-application-boxers-table">
              <div className="room-application-boxers-row room-application-boxers-row-head room-application-boxers-row-readonly">
                <span className="room-application-boxers-index-head" aria-hidden="true" />
                <span>ФИО</span>
                <span>Класс</span>
                <span>Вес</span>
                <span>Дата</span>
                <span>Пол</span>
              </div>

              {boxers.map((boxer, index) => (
                <div key={boxer.uuid} className="room-application-boxers-row room-application-boxers-row-readonly">
                  <span className="room-application-boxers-index-cell">{index + 1}</span>
                  <span className="room-application-boxer-name" title={`${boxer.last_name} ${boxer.first_name}`.trim()}>
                    {`${boxer.last_name} ${boxer.first_name}`.trim()}
                  </span>
                  <span>
                    <span className={getBoxerRankClassName(boxer.rank)}>{boxer.rank}</span>
                  </span>
                  <span>{boxer.weight}</span>
                  <span>{formatBoxerDate(boxer.birth_date)}</span>
                  <span>{getBoxerSexLabel(boxer.sex)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : undefined
      }
      confirmLabel={config.confirmLabel}
      confirmButtonClassName={config.confirmButtonClassName}
      submitState={submitState}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
