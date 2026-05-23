import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { Ring } from "../../../features/auth/authApi";
import type { RoomUiScenarioState } from "../scenario";
import type { OwnerTab, RoomTab } from "../types";
import { RoomTabs } from "./RoomTabs";
import type { RoomWorkspaceBannerAction, RoomWorkspaceProps } from "./RoomWorkspace.types";

type Props = {
  access: RoomWorkspaceProps["access"];
  activeRingName: string | null;
  ownerTab: OwnerTab;
  renderBannerAction: (kind: RoomWorkspaceBannerAction) => ReactNode;
  scenario: RoomUiScenarioState;
  visibleRingTabs: Ring[];
  waitingApplicationsCount: number;
  onOpenRing: (ringName: string) => void;
  onTabChange: (tab: RoomTab) => void;
};

export function RoomWorkspaceStatusBlock({
  access,
  activeRingName,
  ownerTab,
  renderBannerAction,
  scenario,
  visibleRingTabs,
  waitingApplicationsCount,
  onOpenRing,
  onTabChange,
}: Props) {
  return (
    <>
      {!scenario.hideTabs ? (
        <RoomTabs
          activeRingName={activeRingName}
          canViewPairs={access.canViewPairs}
          canViewParticipants={access.canViewParticipants}
          isOwner={access.isOwner}
          ownerTab={ownerTab}
          rings={visibleRingTabs}
          waitingApplicationsCount={waitingApplicationsCount}
          onChange={onTabChange}
          onRingOpen={(ringName) => void onOpenRing(ringName)}
        />
      ) : null}

      {scenario.primaryBanner ? (
        <div
          className={`room-applications-warning${
            scenario.primaryBanner.tone === "success"
              ? " room-applications-warning-success"
              : scenario.primaryBanner.tone === "danger"
                ? " room-applications-warning-danger"
                : ""
          }`}
        >
          {scenario.primaryBanner.icon === "cross" ? (
            <CircleX size={16} strokeWidth={2.2} aria-hidden="true" />
          ) : scenario.primaryBanner.icon === "check" ? (
            <CircleCheck size={16} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <TriangleAlert size={16} strokeWidth={2.2} aria-hidden="true" />
          )}
          <p className="room-applications-note">{scenario.primaryBanner.text}</p>
          {scenario.primaryBanner.action && scenario.primaryBanner.secondaryAction ? (
            <div className="room-guest-status-actions room-applications-warning-actions">
              {renderBannerAction(scenario.primaryBanner.action)}
              {renderBannerAction(scenario.primaryBanner.secondaryAction)}
            </div>
          ) : scenario.primaryBanner.action ? (
            renderBannerAction(scenario.primaryBanner.action)
          ) : null}
        </div>
      ) : null}
    </>
  );
}
