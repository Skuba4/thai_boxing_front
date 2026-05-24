import { useState } from "react";
import type { AuthChoiceProps, LoginFormProps, RegisterFormProps } from "../homePanelTypes";
import { AlertBanner } from "./AlertBanner";
import { Modal, ModalActions } from "./modals/Modal";

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
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  return (
    <>
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
        <label className="auth-policy-consent">
          <input
            type="checkbox"
            checked={isPolicyAccepted}
            onChange={(event) => setIsPolicyAccepted(event.target.checked)}
          />
          <span className="auth-policy-checkmark" aria-hidden="true" />
          <span>
            Принимаю{" "}
            <button
              type="button"
              className="auth-policy-link"
              onClick={(event) => {
                event.preventDefault();
                setIsPolicyModalOpen(true);
              }}
            >
              политику конфиденциальности
            </button>
          </span>
        </label>
        {message ? <AlertBanner message={message} /> : null}
        <div className="auth-actions">
          <button
            type="submit"
            disabled={
              registerState === "loading" ||
              !email ||
              !registerPassword ||
              !registerPasswordRepeat ||
              !isPolicyAccepted
            }
          >
            {registerState === "loading" ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
          <button type="button" className="text-button" onClick={onBack}>
            Назад
          </button>
        </div>
      </form>

      {isPolicyModalOpen ? (
        <Modal className="auth-policy-modal" onClose={() => setIsPolicyModalOpen(false)}>
          <h3>Политика и условия</h3>
          <div className="auth-policy-modal-content">
            <section className="auth-policy-modal-section">
              <h4>Политика конфиденциальности</h4>
              <p className="modal-text">
                Сервис обрабатывает только данные, необходимые для регистрации, входа и работы функций сайта.
              </p>
              <p className="modal-text">
                Используя сайт, пользователь соглашается на обработку учетных и технических данных в объеме,
                необходимом для работы сервиса.
              </p>
            </section>
            <section className="auth-policy-modal-section">
              <h4>Условия использования</h4>
              <p className="modal-text">
                Сайт является pet-проектом и предоставляется как есть, без гарантии бесперебойной работы и
                отсутствия технических ошибок.
              </p>
              <p className="modal-text">
                Автор проекта прикладывает разумные усилия для стабильной работы сервиса, но не несет
                ответственности за убытки, возникшие из-за сбоев, ошибок или временной недоступности сайта.
              </p>
            </section>
          </div>
          <ModalActions centered>
            <button type="button" className="outline-button" onClick={() => setIsPolicyModalOpen(false)}>
              Закрыть
            </button>
          </ModalActions>
        </Modal>
      ) : null}
    </>
  );
}
