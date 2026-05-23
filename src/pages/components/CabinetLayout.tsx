import type { PropsWithChildren } from "react";
import type { HomePageBaseProps } from "../homePanelTypes";
import { getInitials, getNavClassName } from "../homeShared";

export function CabinetLayout({
  activeTab,
  activeRoom,
  activeRooms,
  children,
  email,
  hasPremiumAccess,
  onTabChange,
  onOpenRoomTab,
  profile,
}: PropsWithChildren<HomePageBaseProps>) {
  return (
    <div className="cabinet-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <SidebarButton
            isActive={activeTab === "competitions"}
            label="Соревнования"
            onClick={() => onTabChange("competitions")}
          />
          {activeRooms.map((room) => (
            <div key={room.uuid} className="sidebar-room-group">
              <SidebarButton
                isActive={activeTab === "competition-room" && activeRoom?.uuid === room.uuid}
                isNested
                label={room.name}
                onClick={() => onOpenRoomTab(room.uuid)}
              />
            </div>
          ))}
          {hasPremiumAccess ? (
            <SidebarButton
              isActive={activeTab === "athletes"}
              label="Список спортсменов"
              onClick={() => onTabChange("athletes")}
            />
          ) : null}
          <SidebarButton
            isActive={activeTab === "profile"}
            label="Профиль"
            onClick={() => onTabChange("profile")}
          />
        </nav>

        <div className="sidebar-user">
          <div className="avatar-placeholder" aria-hidden="true">
            {getInitials(profile)}
          </div>
          <span>{profile?.email ?? email}</span>
        </div>
      </aside>

      <div className="cabinet-content">{children}</div>
    </div>
  );
}

function SidebarButton({
  className = "",
  isActive,
  isNested = false,
  label,
  onClick,
}: {
  className?: string;
  isActive: boolean;
  isNested?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${getNavClassName(isActive)}${isNested ? " sidebar-link-nested" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      <span className="sidebar-link-label">{label}</span>
    </button>
  );
}
