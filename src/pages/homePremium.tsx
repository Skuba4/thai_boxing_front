/* eslint-disable react-refresh/only-export-components */
import type { UserProfile } from "../features/auth/authApi";
import type { PremiumStatus } from "./homeSharedTypes";
import type { PremiumStatusBlockProps } from "./homePanelTypes";
import { PREMIUM_ACTIVE, PREMIUM_REQUESTED } from "./homeSharedTypes";

export function normalizePremiumStatus(
  value: UserProfile["premium"] | boolean | null | undefined,
): PremiumStatus {
  if (typeof value === "boolean") return value;

  if (
    typeof value === "object" &&
    value !== null &&
    "is_premium" in value &&
    typeof (value as { is_premium?: unknown }).is_premium === "boolean"
  ) {
    return (value as { is_premium: boolean }).is_premium;
  }

  return null;
}

export function getPremiumStatusFromResponse(message: string): PremiumStatus {
  const normalizedMessage = message.trim().toLowerCase();
  if (
    normalizedMessage.includes("заявка отправлена") ||
    normalizedMessage.includes("заявка уже есть")
  ) {
    return PREMIUM_REQUESTED;
  }
  return null;
}

export function renderPremiumNotice(status: PremiumStatus) {
  if (status === PREMIUM_ACTIVE) {
    return <div className="premium-notice premium-notice-approved">Статус тренера активен.</div>;
  }

  if (status === PREMIUM_REQUESTED) {
    return <div className="premium-notice premium-notice-waiting">Заявка на тренерство подана. Ожидайте решения.</div>;
  }

  return null;
}

export function PremiumStatusBlock({
  premiumApplicationStatus,
  premiumState,
  onSubmit,
}: PremiumStatusBlockProps) {
  if (premiumApplicationStatus === null) {
    return (
      <button
        type="button"
        className="outline-button premium-button"
        disabled={premiumState === "loading"}
        onClick={onSubmit}
      >
        {premiumState === "loading" ? "Отправляем..." : "Подать заявку на тренерство"}
      </button>
    );
  }

  if (premiumApplicationStatus === PREMIUM_REQUESTED) {
    return <div className="premium-inline premium-inline-wait">Заявка на тренерство</div>;
  }

  return <div className="premium-inline premium-inline-approved">Тренер</div>;
}
