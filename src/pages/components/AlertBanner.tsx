import { AlertCircle, CircleCheckBig, TriangleAlert } from "lucide-react";
import { getAlertTone } from "../alerts";

export function AlertBanner({ message }: { message: string }) {
  const tone = getAlertTone(message);
  const Icon = tone === "success" ? CircleCheckBig : tone === "warning" ? TriangleAlert : AlertCircle;

  return (
    <div className={`alert-banner alert-banner-${tone}`} role="status" aria-live="polite">
      <Icon className="alert-banner-icon" size={18} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
