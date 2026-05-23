import type { Boxer, BoxerPayload, BoxerRank, RoomStatus, RingStatus } from "../features/auth/authApi";
import type { BoxerFormState, RoomBoxerFormState } from "./homeForms";

export function capitalizeFirstLetter(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function normalizeWeightInput(value: string) {
  const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [integerPart = "", ...fractionParts] = normalizedValue.split(".");
  const limitedIntegerPart = integerPart.slice(0, 3);
  const fractionPart = fractionParts.join("").slice(0, 1);
  return normalizedValue.includes(".") ? `${limitedIntegerPart}.${fractionPart}` : limitedIntegerPart;
}

export function getEmptyBoxerForm(): BoxerFormState {
  return { first_name: "", last_name: "", middle_name: "", birth_date: "", sex: "M", rank: "A", weight: "" };
}

export function getEmptyRoomBoxerForm(): RoomBoxerFormState {
  return { first_name: "", last_name: "", middle_name: "", age: "", sex: "M", rank: "A", weight: "" };
}

export function isValidBoxerForm(form: BoxerPayload) {
  return Boolean(form.first_name && form.last_name && form.birth_date && form.sex && form.rank && form.weight);
}

export function isValidRoomBoxerForm(form: RoomBoxerFormState) {
  return Boolean(form.first_name && form.last_name && form.age && form.sex && form.rank && form.weight);
}

export function getMaxBoxerBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 5);
  return date.toISOString().split("T")[0];
}

export function getMinRoomStartDate() {
  return new Date().toISOString().split("T")[0];
}

export function getMaxRoomStartDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
}

export function getBoxerFullName(boxer: Pick<Boxer, "first_name" | "last_name" | "middle_name">) {
  return [boxer.last_name, boxer.first_name].filter(Boolean).join(" ");
}

export function formatBoxerDate(value: string) {
  return value ? new Date(value).toLocaleDateString("ru-RU") : "-";
}

export function getBoxerSexLabel(value: Boxer["sex"]) {
  if (value === "M") return "М";
  if (value === "F") return "Ж";
  return value;
}

export function getBoxerRankClassName(rank: BoxerRank) {
  return `boxer-rank boxer-rank-${rank.toLowerCase()}`;
}

export function filterBoxers<T extends Pick<Boxer, "first_name" | "last_name" | "middle_name">>(
  boxers: T[],
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return boxers;
  }

  return boxers.filter((boxer) =>
    `${boxer.last_name} ${boxer.first_name} ${boxer.middle_name ?? ""}`.toLowerCase().includes(normalizedSearch),
  );
}

export function getRoomStatusLabel(status: RoomStatus) {
  if (status === "0") return "Подготовка";
  if (status === "Y") return "Активно";
  return "Завершено";
}

export function getRoomStatusClassName(status: RoomStatus) {
  if (status === "0") return "room-status room-status-wait";
  if (status === "Y") return "room-status room-status-active";
  return "room-status room-status-finished";
}

export function getRingStatusLabel(status: RingStatus) {
  return status === "N" ? "Не используется" : "Используется";
}

export function getRingStatusClassName(status: RingStatus) {
  return status === "N" ? "room-status room-status-finished" : "room-status room-status-active";
}
