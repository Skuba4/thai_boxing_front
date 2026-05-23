import type { UserProfile } from "../features/auth/authApi";

export function getInitials(profile: UserProfile | null) {
  const first = profile?.first_name?.trim().charAt(0) ?? "";
  const last = profile?.last_name?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  return initials || "?";
}

export function getNavClassName(isActive: boolean) {
  return isActive ? "sidebar-link sidebar-link-active" : "sidebar-link";
}

export function updateCollectionItem<T extends { uuid: string }>(
  collection: T[],
  uuid: string,
  nextItem: T,
) {
  return collection.map((item) => (item.uuid === uuid ? nextItem : item));
}
