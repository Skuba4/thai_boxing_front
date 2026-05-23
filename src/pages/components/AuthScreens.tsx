import type { AuthChoiceProps, LoginFormProps, RegisterFormProps } from "../homePanelTypes";
import { AlertBanner } from "./AlertBanner";

export function AuthChoice({ onLoginOpen, onRegisterOpen }: AuthChoiceProps) {
  return (
    <div className="auth-choice">
      <div className="auth-actions">
        <button type="button" onClick={onLoginOpen}>
          Вход
        </button>
        <button type="button" onClick={onRegisterOpen}>
          Регистрация
        </button>
      </div>
    </div>
  );
}

export function LoginForm({
  email,
  loginState,
  message,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
}: LoginFormProps) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="field">
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Email"
          autoComplete="email"
        />
      </label>
      <label className="field">
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Пароль"
          autoComplete="current-password"
        />
      </label>
      {message ? <AlertBanner message={message} /> : null}
      <div className="auth-actions">
        <button type="submit" disabled={loginState === "loading" || !email || !password}>
          {loginState === "loading" ? "Входим..." : "Войти"}
        </button>
        <button type="button" className="text-button" onClick={onBack}>
          Назад
        </button>
      </div>
    </form>
  );
}

export function RegisterForm({
  email,
  message,
  registerPassword,
  registerPasswordRepeat,
  registerState,
  onEmailChange,
  onRegisterPasswordChange,
  onRegisterPasswordRepeatChange,
  onSubmit,
  onBack,
}: RegisterFormProps) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="field">
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Электронная почта"
          autoComplete="email"
        />
      </label>
      <label className="field">
        <input
          type="password"
          value={registerPassword}
          onChange={(event) => onRegisterPasswordChange(event.target.value)}
          placeholder="Пароль"
        />
      </label>
      <label className="field">
        <input
          type="password"
          value={registerPasswordRepeat}
          onChange={(event) => onRegisterPasswordRepeatChange(event.target.value)}
          placeholder="Повторить пароль"
        />
      </label>
      {message ? <AlertBanner message={message} /> : null}
      <div className="auth-actions">
        <button
          type="submit"
          disabled={
            registerState === "loading" ||
            !email ||
            !registerPassword ||
            !registerPasswordRepeat
          }
        >
          {registerState === "loading" ? "Регистрируем..." : "Зарегистрироваться"}
        </button>
        <button type="button" className="text-button" onClick={onBack}>
          Назад
        </button>
      </div>
    </form>
  );
}
