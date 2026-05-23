import type { Ring, RingStatus } from "../../../features/auth/authApi";
import type { RequestState } from "../../homeSharedTypes";

type RingsTabProps = {
  activeRings: Ring[];
  canEdit: boolean;
  inactiveRings: Ring[];
  ringsState: RequestState;
  settingsOnly?: boolean;
  onEditRing: (ringName: string) => void;
  onOpenRing: (ringName: string) => void;
  onToggleRing: (ring: Ring, status: RingStatus) => void;
};

export function RingsTab({
  activeRings,
  canEdit,
  inactiveRings,
  ringsState,
  settingsOnly = false,
  onEditRing,
  onOpenRing,
  onToggleRing,
}: RingsTabProps) {
  const rings = [...activeRings, ...inactiveRings];
  const orderedRings = sortRings(rings);

  return (
    <div className="rings-panel">
      {ringsState === "loading" ? (
        <p className="panel-message">Загружаем ринги...</p>
      ) : null}
      <div className="rings-grid rings-grid-cards">
        {orderedRings.map((ring) => (
          <RingCard
            key={ring.name}
            ring={ring}
            canEdit={canEdit}
            settingsOnly={settingsOnly}
            onEditRing={onEditRing}
            onOpenRing={onOpenRing}
            onToggleRing={onToggleRing}
          />
        ))}
      </div>
    </div>
  );
}

function sortRings(rings: Ring[]) {
  const order = ["A", "B", "C", "D", "E"];

  return [...rings].sort((left, right) => {
    const leftName = normalizeRingName(left.name);
    const rightName = normalizeRingName(right.name);
    return order.indexOf(leftName) - order.indexOf(rightName);
  });
}

function normalizeRingName(name: string) {
  return name.replace(/^Ринг\s*/i, "").trim();
}

function getRingLabel(name: string) {
  return `Ринг ${normalizeRingName(name)}`;
}

function RingCard({
  canEdit,
  ring,
  settingsOnly,
  onEditRing,
  onOpenRing,
  onToggleRing,
}: {
  canEdit: boolean;
  ring: Ring;
  settingsOnly: boolean;
  onEditRing: (ringName: string) => void;
  onOpenRing: (ringName: string) => void;
  onToggleRing: (ring: Ring, status: RingStatus) => void;
}) {
  const isInactive = ring.status === "N";
  const description = ring.description?.trim() || "Описание";

  return (
    <article className={`ring-card ring-card-tile${isInactive ? " ring-card-inactive" : ""}`}>
      <div
        className="ring-card-main"
        role={isInactive || settingsOnly ? undefined : "button"}
        tabIndex={isInactive || settingsOnly ? undefined : 0}
        onClick={() => {
          if (!isInactive && !settingsOnly) {
            onOpenRing(ring.name);
          }
        }}
        onKeyDown={(event) => {
          if (!isInactive && !settingsOnly && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onOpenRing(ring.name);
          }
        }}
      >
        <div className="ring-card-header">
          <h3>{getRingLabel(ring.name)}</h3>
          {canEdit ? (
            <label
              className="ring-card-switch"
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={!isInactive}
                onChange={() => onToggleRing(ring, isInactive ? "Y" : "N")}
                aria-label={`${isInactive ? "Включить" : "Выключить"} ${ring.name}`}
              />
              <span className="ring-card-switch-slider" />
            </label>
          ) : null}
        </div>
        <div className="ring-card-divider" />
        <button
          type="button"
          className={`ring-card-description-button${canEdit ? "" : " ring-card-description-button-readonly"}`}
          title={description}
          onClick={(event) => {
            event.stopPropagation();
            if (canEdit && !isInactive) {
              onEditRing(ring.name);
            }
          }}
        >
          {description}
        </button>
      </div>
    </article>
  );
}
