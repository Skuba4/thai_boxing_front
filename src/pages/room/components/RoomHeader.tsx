import { Settings } from "lucide-react";
import type { Room } from "../../../entities/rooms/types";
import { getRoomStatusClassName, getRoomStatusLabel } from "../../homeBoxers";

type Props = {
  room: Room;
  onRoomSettingsOpen: () => void;
};

export function RoomHeader({
  room,
  onRoomSettingsOpen,
}: Props) {
  return (
    <div className="panel-header">
      <div className="room-header-meta-block">
        <h2>{room.name}</h2>
        <div className="room-header-meta">
          <span className="room-card-meta">{new Date(room.start_date).toLocaleDateString("ru-RU")}</span>
          <span className={getRoomStatusClassName(room.status)}>{getRoomStatusLabel(room.status)}</span>
        </div>
      </div>

      {room.is_owner ? (
        <button
          type="button"
          className="icon-button icon-button-compact icon-button-neutral room-edit-button"
          aria-label="Редактировать соревнование"
          onClick={onRoomSettingsOpen}
        >
          <Settings size={23} strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
}
