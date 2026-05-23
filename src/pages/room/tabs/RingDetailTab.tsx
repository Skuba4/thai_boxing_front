import type { ReactNode } from "react";
import type { Ring } from "../../../features/auth/authApi";

type RingDetailTabProps = {
  activeRing: Ring | null;
  children: ReactNode;
  emptyContent: ReactNode;
  hasGrids: boolean;
};

export function RingDetailTab({
  activeRing,
  children,
  emptyContent,
  hasGrids,
}: RingDetailTabProps) {
  if (!activeRing) {
    return null;
  }

  if (!hasGrids) {
    return <div className="panel-placeholder">{emptyContent}</div>;
  }

  return <div className="ring-grids-section">{children}</div>;
}
