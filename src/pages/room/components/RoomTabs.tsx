import type { Ring } from "../../../entities/rings/types";
import type { OwnerTab, RoomTab } from "../types";

type Props = {
  activeRingName: string | null;
  canViewPairs: boolean;
  canViewParticipants: boolean;
  isOwner: boolean;
  ownerTab: OwnerTab;
  rings: Ring[];
  waitingApplicationsCount: number;
  onChange: (tab: RoomTab) => void;
  onRingOpen: (ringName: string) => void;
};

export function RoomTabs({
  activeRingName,
  canViewPairs,
  canViewParticipants,
  isOwner,
  ownerTab,
  rings,
  waitingApplicationsCount,
  onChange,
  onRingOpen,
}: Props) {
  return (
    <div className="room-owner-tabs">
      {isOwner ? (
        <Tab active={ownerTab === "applications"} onClick={() => onChange("applications")}>
          Заявки
          {waitingApplicationsCount ? (
            <span className="applications-button-badge">{waitingApplicationsCount}</span>
          ) : null}
        </Tab>
      ) : null}
      {canViewParticipants ? (
        <Tab active={ownerTab === "participants"} onClick={() => onChange("participants")}>
          Участники
        </Tab>
      ) : null}
      {canViewPairs ? (
        <Tab active={ownerTab === "pairs"} onClick={() => onChange("pairs")}>
          Сетки
        </Tab>
      ) : null}
      {rings.map((ring) => (
        <Tab
          key={ring.name}
          active={ownerTab === "ring-detail" && activeRingName === ring.name}
          onClick={() => onRingOpen(ring.name)}
        >
          {ring.name}
        </Tab>
      ))}
    </div>
  );
}

function Tab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={active ? "room-owner-tab room-owner-tab-active" : "room-owner-tab"} onClick={onClick}>
      {children}
    </button>
  );
}
