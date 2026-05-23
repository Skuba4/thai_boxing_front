export type RequestState = "idle" | "loading" | "success" | "error";
export type AuthView = "choice" | "login" | "register" | "cabinet";
export type CabinetTab = "competitions" | "competition-room" | "athletes" | "profile";
export type PremiumStatus = boolean | null;

export const PREMIUM_REQUESTED = false;
export const PREMIUM_ACTIVE = true;
