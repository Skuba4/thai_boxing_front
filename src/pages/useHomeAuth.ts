import { useState } from "react";
import type { FormEvent } from "react";
import {
  activatePremium,
  getProfile,
  login,
  register,
  updateProfile,
  type UserProfile,
} from "../features/auth/authApi";
import { clearAuthTokens, setAuthTokens } from "../features/auth/authStorage";
import { useFlashMessageState } from "./alerts";
import { getErrorMessage } from "./homeErrors";
import type { ProfileFormState } from "./homeForms";
import { getPremiumStatusFromResponse, normalizePremiumStatus } from "./homePremium";
import { PREMIUM_ACTIVE, type AuthView, type PremiumStatus, type RequestState } from "./homeSharedTypes";

export function useHomeAuth() {
  const [view, setView] = useState<AuthView>("choice");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordRepeat, setRegisterPasswordRepeat] = useState("");
  const authFlash = useFlashMessageState();
  const profileFlash = useFlashMessageState();
  const [loginState, setLoginState] = useState<RequestState>("idle");
  const [registerState, setRegisterState] = useState<RequestState>("idle");
  const [profileState, setProfileState] = useState<RequestState>("idle");
  const [saveState, setSaveState] = useState<RequestState>("idle");
  const [premiumState, setPremiumState] = useState<RequestState>("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [premiumApplicationStatus, setPremiumApplicationStatus] = useState<PremiumStatus>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    first_name: "",
    last_name: "",
    city: "",
    club: "",
  });

  async function loadProfile(accessToken: string, onPremiumRevoked?: () => void) {
    try {
      setProfileState("loading");
      const nextProfile = await getProfile(accessToken);
      setProfile(nextProfile);
      setEmail(nextProfile.email);
      setProfileForm({
        first_name: nextProfile.first_name ?? "",
        last_name: nextProfile.last_name ?? "",
        city: nextProfile.city ?? "",
        club: nextProfile.club ?? "",
      });
      const nextPremiumStatus = normalizePremiumStatus(nextProfile.premium);
      setPremiumApplicationStatus(nextPremiumStatus);
      setView("cabinet");
      profileFlash.setMessage("");
      setProfileState("success");
      if (nextPremiumStatus !== PREMIUM_ACTIVE) {
        onPremiumRevoked?.();
      }
      return nextPremiumStatus;
    } catch {
      setProfileState("error");
      clearAuthTokens();
      authFlash.setMessage("");
      setView("login");
      return null;
    }
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
    onLoggedIn: () => void,
    onProfileLoaded?: (premiumStatus: PremiumStatus, accessToken: string) => Promise<void> | void,
    onPremiumRevoked?: () => void,
  ) {
    event.preventDefault();
    try {
      setLoginState("loading");
      authFlash.setMessage("");
      const tokens = await login({ email, password });
      if (!tokens.access) throw new Error("Login response does not contain access token.");
      setAuthTokens(tokens);
      onLoggedIn();
      const premiumStatus = await loadProfile(tokens.access, onPremiumRevoked);
      if (premiumStatus !== null) {
        await onProfileLoaded?.(premiumStatus, tokens.access);
      }
      setLoginState("success");
    } catch (error) {
      setLoginState("error");
      authFlash.setMessage(getErrorMessage(error));
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setRegisterState("loading");
      authFlash.setMessage("");
      await register({ email, password1: registerPassword, password2: registerPasswordRepeat });
      setRegisterState("success");
      setPassword("");
      setRegisterPassword("");
      setRegisterPasswordRepeat("");
      setView("login");
    } catch (error) {
      setRegisterState("error");
      authFlash.setMessage(getErrorMessage(error));
    }
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>, accessToken: string) {
    event.preventDefault();
    try {
      setSaveState("loading");
      const updatedProfile = await updateProfile(accessToken, profileForm);
      setProfile(updatedProfile);
      setProfileForm({
        first_name: updatedProfile.first_name ?? "",
        last_name: updatedProfile.last_name ?? "",
        city: updatedProfile.city ?? "",
        club: updatedProfile.club ?? "",
      });
      setPremiumApplicationStatus(normalizePremiumStatus(updatedProfile.premium));
      setSaveState("success");
      profileFlash.setMessage("Профиль сохранен.");
    } catch (error) {
      setSaveState("error");
      profileFlash.setMessage(getErrorMessage(error));
    }
  }

  async function handlePremiumApplication(accessToken: string, reloadProfile: () => Promise<unknown>) {
    try {
      setPremiumState("loading");
      const response = await activatePremium(accessToken);
      const nextPremiumStatus = getPremiumStatusFromResponse(response.message);
      if (nextPremiumStatus !== null) setPremiumApplicationStatus(nextPremiumStatus);
      await reloadProfile();
      setPremiumState("success");
      profileFlash.setMessage(response.message);
    } catch (error) {
      setPremiumState("error");
      profileFlash.setMessage(getErrorMessage(error));
    }
  }

  function resetAuthState() {
    setView("choice");
    setEmail("");
    setPassword("");
    setRegisterPassword("");
    setRegisterPasswordRepeat("");
    authFlash.setMessage("");
    profileFlash.setMessage("");
    setLoginState("idle");
    setRegisterState("idle");
    setProfileState("idle");
    setSaveState("idle");
    setPremiumState("idle");
    setProfile(null);
    setPremiumApplicationStatus(null);
    setProfileForm({ first_name: "", last_name: "", city: "", club: "" });
  }

  return {
    authMessage: authFlash.message,
    authMessageVersion: authFlash.messageVersion,
    email,
    handleLogin,
    handlePremiumApplication,
    handleProfileSave,
    handleRegister,
    isBootstrapping,
    loadProfile,
    loginState,
    password,
    premiumApplicationStatus,
    premiumState,
    profile,
    profileForm,
    profileMessage: profileFlash.message,
    profileMessageVersion: profileFlash.messageVersion,
    profileState,
    registerPassword,
    registerPasswordRepeat,
    registerState,
    resetAuthState,
    saveState,
    setAuthMessage: authFlash.setMessage,
    setEmail,
    setIsBootstrapping,
    setPassword,
    setPremiumApplicationStatus,
    setProfileMessage: profileFlash.setMessage,
    setProfileForm,
    setRegisterPassword,
    setRegisterPasswordRepeat,
    setView,
    view,
  };
}
