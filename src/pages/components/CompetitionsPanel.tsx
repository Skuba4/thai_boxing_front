import { ChevronDown, Pin } from "lucide-react";
import { useMemo, useState } from "react";
import type { Room } from "../../features/auth/authApi";
import { getRoomStatusClassName, getRoomStatusLabel } from "../homeBoxers";
import type { CompetitionsPanelProps } from "../homePanelTypes";
import { AlertBanner } from "./AlertBanner";

const roomStatusOrder: Record<Room["status"], number> = {
  "0": 0,
  Y: 1,
  N: 2,
};

function sortRoomsByStatus(rooms: Room[]) {
  return [...rooms].sort((left, right) => {
    const statusDiff = roomStatusOrder[left.status] - roomStatusOrder[right.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return new Date(left.start_date).getTime() - new Date(right.start_date).getTime();
  });
}

export function CompetitionsPanel({
  hasPremiumAccess,
  message,
  myRooms,
  allRooms,
  pinnedRoomUuids,
  roomsState,
  onCreateRoomOpen,
  onRoomOpen,
  onRoomPinToggle,
}: CompetitionsPanelProps) {
  const [roomSearch, setRoomSearch] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const normalizedQuery = roomSearch.trim().toLowerCase();
  const visibleAllRooms = useMemo(() => {
    if (!normalizedQuery) {
      return sortRoomsByStatus(allRooms);
    }

    return sortRoomsByStatus(
      allRooms.filter((room) =>
        `${room.name} ${room.description}`.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [allRooms, normalizedQuery]);
  const visibleMyRooms = useMemo(() => {
    if (!normalizedQuery) {
      return sortRoomsByStatus(myRooms);
    }

    return sortRoomsByStatus(
      myRooms.filter((room) =>
        `${room.name} ${room.description}`.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [myRooms, normalizedQuery]);
  const participationRooms = useMemo(
    () =>
      visibleAllRooms.filter(
        (room) => !room.is_owner && room.my_trainer_application_status === "Y",
      ),
    [visibleAllRooms],
  );
  const guestRooms = useMemo(() => {
    const baseRooms = hasPremiumAccess
      ? visibleAllRooms.filter(
          (room) => !room.is_owner && room.my_trainer_application_status !== "Y",
        )
      : visibleAllRooms;
    return baseRooms;
  }, [hasPremiumAccess, visibleAllRooms]);
  const visibleSections = useMemo(() => {
    if (hasPremiumAccess) {
      return [
        { id: "my", title: "Мои соревнования", rooms: visibleMyRooms, withCreateTile: true },
        { id: "participation", title: "Моё участие", rooms: participationRooms, withCreateTile: false },
        { id: "guest", title: "Все соревнования", rooms: guestRooms, withCreateTile: false },
      ].filter((section) => section.withCreateTile || section.rooms.length > 0);
    }

    return guestRooms.length
      ? [{ id: "guest", title: "Все соревнования", rooms: guestRooms, withCreateTile: false }]
      : [];
  }, [guestRooms, hasPremiumAccess, participationRooms, visibleMyRooms]);

  function toggleSection(sectionId: string) {
    const sectionIndex = visibleSections.findIndex((section) => section.id === sectionId);
    const defaultCollapsed = sectionIndex > 0;

    setCollapsedSections((current) => ({
      ...current,
      [sectionId]: !(current[sectionId] ?? defaultCollapsed),
    }));
  }

  return (
    <section className="panel">
      <div className="boxers-toolbar competition-search-toolbar">
        <input
          className="boxers-search"
          type="search"
          value={roomSearch}
          onChange={(event) => setRoomSearch(event.target.value)}
          placeholder="Поиск"
        />
      </div>

      {message ? <AlertBanner message={message} /> : null}

      {roomsState === "loading" ? (
        <p className="panel-message">Загружаем соревнования...</p>
      ) : null}

      {visibleSections.map((section, index) => {
        const isCollapsed = collapsedSections[section.id] ?? index !== 0;

        return (
          <section key={section.id} className="competition-section">
            <button
              type="button"
              className="competition-section-header"
              onClick={() => toggleSection(section.id)}
            >
              <h3>{section.title}</h3>
              <ChevronDown
                size={18}
                strokeWidth={2.2}
                className={isCollapsed ? "competition-section-chevron" : "competition-section-chevron competition-section-chevron-open"}
                aria-hidden="true"
              />
            </button>

            {!isCollapsed ? (
              <div className="rooms-grid">
                {section.withCreateTile ? (
                  <button type="button" className="new-room-tile" onClick={onCreateRoomOpen}>
                    + Новое соревнование
                  </button>
                ) : null}

                {section.rooms.map((room) => (
                  <RoomCard
                    key={room.uuid}
                    isPinned={pinnedRoomUuids.includes(room.uuid)}
                    room={room}
                    onRoomOpen={onRoomOpen}
                    onRoomPinToggle={onRoomPinToggle}
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </section>
  );
}

function RoomCard({
  isPinned,
  room,
  onRoomOpen,
  onRoomPinToggle,
}: {
  isPinned: boolean;
  room: Room;
  onRoomOpen: CompetitionsPanelProps["onRoomOpen"];
  onRoomPinToggle: CompetitionsPanelProps["onRoomPinToggle"];
}) {
  return (
    <article key={room.uuid} className="room-card competition-card">
      <button type="button" className="room-card-body" onClick={() => onRoomOpen(room)}>
        <div className="room-card-header">
          <div className="competition-card-title-block">
            <h3 title={room.name}>{room.name}</h3>
            <p className="competition-card-description-inline" title={room.description || ""}>
              {room.description || "\u00A0"}
            </p>
          </div>
          <button
            type="button"
            className={`icon-button icon-button-compact icon-button-neutral competition-card-pin${isPinned ? " competition-card-pin-active" : ""}`}
            aria-label={isPinned ? "Открепить соревнование" : "Закрепить соревнование"}
            title={isPinned ? "Открепить" : "Закрепить"}
            onClick={(event) => {
              event.stopPropagation();
              onRoomPinToggle(room.uuid);
            }}
          >
            <Pin aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        </div>
        <div className="room-card-divider" />
        <div className="room-card-footer">
          <p className="room-card-meta">{new Date(room.start_date).toLocaleDateString("ru-RU")}</p>
          <span className={getRoomStatusClassName(room.status)}>
            {getRoomStatusLabel(room.status)}
          </span>
        </div>
      </button>
    </article>
  );
}
