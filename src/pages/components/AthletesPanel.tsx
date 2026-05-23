import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { formatBoxerDate, getBoxerFullName, getBoxerRankClassName, getBoxerSexLabel } from "../homeBoxers";
import type { AthletesPanelProps } from "../homePanelTypes";
import { AlertBanner } from "./AlertBanner";

type BoxerSortField = "rank" | "weight" | "birth_date" | "sex";
type BoxerSortDirection = "asc" | "desc";
type BoxerSortRule = {
  field: BoxerSortField;
  direction: BoxerSortDirection;
};

export function AthletesPanel({
  boxerSearch,
  boxersState,
  createBoxerState,
  deleteBoxerState,
  deletingBoxerId,
  filteredBoxers,
  message,
  onBoxerSearchChange,
  onCreateBoxerOpen,
  onDeleteBoxer,
  onEditBoxerOpen,
}: AthletesPanelProps) {
  const [sortRules, setSortRules] = useState<BoxerSortRule[]>([]);
  const sortedBoxers = useMemo(() => {
    if (!sortRules.length) {
      return [...filteredBoxers].sort((left, right) => {
        const lastNameComparison = left.last_name.localeCompare(right.last_name, "ru");

        if (lastNameComparison !== 0) {
          return lastNameComparison;
        }

        return left.first_name.localeCompare(right.first_name, "ru");
      });
    }

    const rankOrder = { A: 1, B: 2, C: 3 };
    const sexOrder = { M: 1, F: 2 };
    const sorted = [...filteredBoxers].sort((left, right) => {
      for (const rule of sortRules) {
        let comparison = 0;

        if (rule.field === "rank") {
          comparison = rankOrder[left.rank] - rankOrder[right.rank];
        } else if (rule.field === "weight") {
          comparison = Number(left.weight) - Number(right.weight);
        } else if (rule.field === "birth_date") {
          comparison =
            new Date(left.birth_date).getTime() - new Date(right.birth_date).getTime();
        } else {
          comparison = sexOrder[left.sex] - sexOrder[right.sex];
        }

        if (comparison !== 0) {
          return rule.direction === "asc" ? comparison : -comparison;
        }
      }

      return 0;
    });

    return sorted;
  }, [filteredBoxers, sortRules]);

  function handleSort(field: BoxerSortField, withSecondary = false) {
    setSortRules((current) => {
      const existingRule = current.find((rule) => rule.field === field);
      const nextDirection =
        existingRule?.direction === "asc" ? "desc" : "asc";
      const nextRule: BoxerSortRule = {
        field,
        direction: existingRule ? nextDirection : "asc",
      };

      if (!withSecondary) {
        return [nextRule];
      }

      const withoutField = current.filter((rule) => rule.field !== field).slice(0, 1);
      return [...withoutField, nextRule];
    });
  }

  function handleSortClick(field: BoxerSortField, event: MouseEvent<HTMLButtonElement>) {
    handleSort(field, event.shiftKey);
  }

  function getSortRule(field: BoxerSortField) {
    return sortRules.find((rule) => rule.field === field) ?? null;
  }

  function renderSortLabel(field: BoxerSortField, label: string) {
    const rule = getSortRule(field);

    if (!rule) {
      return label;
    }

    const ruleIndex = sortRules.findIndex((item) => item.field === field);

    return (
      <>
        {label}{" "}
        <span
          className={
            rule.direction === "asc"
              ? "table-sort-arrow table-sort-arrow-asc"
              : "table-sort-arrow table-sort-arrow-desc"
          }
        >
          {rule.direction === "asc" ? "↑" : "↓"}
        </span>
        {sortRules.length > 1 && ruleIndex >= 0 ? (
          <span className="table-sort-order">{ruleIndex + 1}</span>
        ) : null}
      </>
    );
  }

  function getSortLabelTitle(field: BoxerSortField) {
    const rule = getSortRule(field);

    if (!rule) {
      return "Клик: сортировка, Shift+клик: добавить вторую сортировку";
    }

    return `Сейчас: ${rule.direction === "asc" ? "по возрастанию" : "по убыванию"}`;
  }

  function renderSortButton(field: BoxerSortField, label: string) {
    return (
      <button
        type="button"
        className="table-sort-button"
        onClick={(event) => handleSortClick(field, event)}
        title={getSortLabelTitle(field)}
      >
        {renderSortLabel(field, label)}
      </button>
    );
  }

  function renderHeadRow() {
    return (
      <div className="boxers-row boxers-row-head">
        <span className="boxers-index-cell" aria-hidden="true" />
        <span>ФИО</span>
        {renderSortButton("rank", "Класс")}
        {renderSortButton("weight", "Вес")}
        {renderSortButton("birth_date", "Дата")}
        {renderSortButton("sex", "Пол")}
        <span />
      </div>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Список спортсменов</h2>
      </div>

      <div className="boxers-toolbar">
        <input
          className="boxers-search"
          type="text"
          value={boxerSearch}
          onChange={(event) => onBoxerSearchChange(event.target.value)}
          placeholder="Поиск"
        />
        <div className="room-owner-actions">
          <button
            type="button"
            className="toolbar-action-button"
            onClick={onCreateBoxerOpen}
            disabled={createBoxerState === "loading"}
          >
            Добавить
          </button>
        </div>
      </div>

      {message ? <AlertBanner message={message} /> : null}

      <div className="boxers-table">
        {renderHeadRow()}

        {sortedBoxers.map((boxer, index) => (
          <div key={boxer.uuid} className="boxers-row">
            <span className="boxers-index-cell">{index + 1}</span>
            <div className="boxer-name-cell" title={getBoxerFullName(boxer)}>{getBoxerFullName(boxer)}</div>
            <span className={getBoxerRankClassName(boxer.rank)}>{boxer.rank}</span>
            <span>{boxer.weight}</span>
            <span>{formatBoxerDate(boxer.birth_date)}</span>
            <span>{getBoxerSexLabel(boxer.sex)}</span>
            <div className="boxer-inline-actions">
              <button
                type="button"
                className="icon-button icon-button-compact icon-button-warm boxer-action-button"
                onClick={() => onEditBoxerOpen(boxer)}
                aria-label="Редактировать спортсмена"
              >
                <Pencil size={15} strokeWidth={2.1} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button icon-button-compact icon-button-danger boxer-action-button"
                onClick={() => onDeleteBoxer(boxer.uuid)}
                disabled={deleteBoxerState === "loading" && deletingBoxerId === boxer.uuid}
                aria-label="Удалить спортсмена"
              >
                {deleteBoxerState === "loading" && deletingBoxerId === boxer.uuid ? (
                  <LoaderCircle size={15} strokeWidth={2.1} aria-hidden="true" />
                ) : (
                  <Trash2 size={15} strokeWidth={2.1} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {boxersState === "loading" ? <p className="panel-message">Загружаем спортсменов...</p> : null}
    </section>
  );
}
