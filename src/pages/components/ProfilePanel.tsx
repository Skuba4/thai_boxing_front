import type { ProfilePanelProps } from "../homePanelTypes";
import { PremiumStatusBlock } from "../homePremium";
import { getInitials } from "../homeShared";

export function ProfilePanel({
  email,
  premiumApplicationStatus,
  premiumState,
  profile,
  profileForm,
  saveState,
  onLogout,
  onPasswordChangePlaceholder,
  onPremiumSubmit,
  onProfileSave,
  onProfileReset,
  onProfileFormChange,
}: ProfilePanelProps) {
  const initialProfileForm = {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    city: profile?.city ?? "",
    club: profile?.club ?? "",
  };
  const hasProfileChanges =
    profileForm.first_name !== initialProfileForm.first_name ||
    profileForm.last_name !== initialProfileForm.last_name ||
    profileForm.city !== initialProfileForm.city ||
    profileForm.club !== initialProfileForm.club;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Профиль</h2>
        <button type="button" className="outline-button toolbar-action-button" onClick={onLogout}>
          Выйти из системы
        </button>
      </div>

      <div className="profile-toolbar">
        <div className="avatar-large" aria-hidden="true">
          {getInitials(profile)}
        </div>

        <PremiumStatusBlock
          premiumApplicationStatus={premiumApplicationStatus}
          premiumState={premiumState}
          onSubmit={onPremiumSubmit}
        />
      </div>

      <form className="profile-form" onSubmit={onProfileSave}>
        <div className="field-grid">
          <label className="field">
            <span>Имя</span>
            <input
              type="text"
              maxLength={30}
              value={profileForm.first_name}
              onChange={(event) => onProfileFormChange("first_name", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Фамилия</span>
            <input
              type="text"
              maxLength={30}
              value={profileForm.last_name}
              onChange={(event) => onProfileFormChange("last_name", event.target.value)}
            />
          </label>
        </div>

        <div className="field-grid">
          <label className="field field-grow">
            <span>Email</span>
            <input type="email" value={profile?.email ?? email} disabled />
          </label>
          <label className="field">
            <span>Пароль</span>
            <button
              type="button"
              className="outline-button email-action-button"
              onClick={onPasswordChangePlaceholder}
            >
              Изменить пароль
            </button>
          </label>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Город</span>
            <input
              type="text"
              maxLength={30}
              value={profileForm.city}
              onChange={(event) => onProfileFormChange("city", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Клуб</span>
            <input
              type="text"
              maxLength={30}
              value={profileForm.club}
              onChange={(event) => onProfileFormChange("club", event.target.value)}
            />
          </label>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="outline-button toolbar-action-button"
            onClick={onProfileReset}
            disabled={saveState === "loading" || !hasProfileChanges}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="toolbar-action-button"
            disabled={saveState === "loading" || !hasProfileChanges}
          >
            {saveState === "loading" ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </form>

    </section>
  );
}
