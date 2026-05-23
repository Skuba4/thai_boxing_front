import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { RoomBoxer } from "../../features/auth/authApi";
import { filterBoxers } from "../homeBoxers";
import type { RoomBoxerSortField, RoomBoxerSortRule } from "./types";

const rankOrder = { A: 1, B: 2, C: 3 };
const sexOrder = { M: 1, F: 2 };

export function useBoxerSort(boxers: RoomBoxer[]) {
  const [search, setSearch] = useState("");
  const [sortRules, setSortRules] = useState<RoomBoxerSortRule[]>([]);

  const sortedBoxers = useMemo(() => {
    const filteredBoxers = filterBoxers(boxers, search);
    const boxersWithAvailabilityOrder = [...filteredBoxers].sort((left, right) => {
      if (left.is_available === right.is_available) {
        return 0;
      }

      return left.is_available ? -1 : 1;
    });

    if (!sortRules.length) {
      return boxersWithAvailabilityOrder.sort((left, right) => {
        const lastNameComparison = left.last_name.localeCompare(right.last_name, "ru");
        return lastNameComparison || left.first_name.localeCompare(right.first_name, "ru");
      });
    }

    return boxersWithAvailabilityOrder.sort((left, right) => {
      if (left.is_available !== right.is_available) {
        return left.is_available ? -1 : 1;
      }

      for (const rule of sortRules) {
        const comparison = compareBoxers(left, right, rule.field);

        if (comparison !== 0) {
          return rule.direction === "asc" ? comparison : -comparison;
        }
      }

      return 0;
    });
  }, [boxers, search, sortRules]);

  function handleSort(field: RoomBoxerSortField, withSecondary = false) {
    setSortRules((current) => {
      const existingRule = current.find((rule) => rule.field === field);
      const nextRule: RoomBoxerSortRule = {
        field,
        direction: existingRule?.direction === "asc" ? "desc" : "asc",
      };

      if (!withSecondary) {
        return [nextRule];
      }

      const withoutField = current.filter((rule) => rule.field !== field).slice(0, 1);
      return [...withoutField, nextRule];
    });
  }

  function renderSortButton(field: RoomBoxerSortField, label: string) {
    return (
      <button
        type="button"
        className="table-sort-button"
        onClick={(event: MouseEvent<HTMLButtonElement>) => handleSort(field, event.shiftKey)}
        title="Клик: сортировка, Shift+клик: добавить вторую сортировку"
      >
        {renderSortLabel(field, label, sortRules)}
      </button>
    );
  }

  return {
    activeBoxers: sortedBoxers.filter((boxer) => boxer.is_available),
    hasFilters: sortRules.length > 0 || search.trim().length > 0,
    inactiveBoxers: sortedBoxers.filter((boxer) => !boxer.is_available),
    renderSortButton,
    resetSort: () => {
      setSortRules([]);
      setSearch("");
    },
    search,
    setSearch,
    setSortRules,
  };
}

function compareBoxers(left: RoomBoxer, right: RoomBoxer, field: RoomBoxerSortField) {
  if (field === "rank") {
    return rankOrder[left.rank] - rankOrder[right.rank];
  }

  if (field === "weight") {
    return Number(left.weight) - Number(right.weight);
  }

  if (field === "age") {
    return left.age - right.age;
  }

  if (field === "sex") {
    return sexOrder[left.sex] - sexOrder[right.sex];
  }

  return (left.trainer?.club || "").localeCompare(right.trainer?.club || "", "ru");
}

function renderSortLabel(field: RoomBoxerSortField, label: string, sortRules: RoomBoxerSortRule[]) {
  const rule = sortRules.find((item) => item.field === field);

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
      {sortRules.length > 1 && ruleIndex >= 0 ? <span className="table-sort-order">{ruleIndex + 1}</span> : null}
    </>
  );
}
