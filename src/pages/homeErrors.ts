export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const { message } = error;

    try {
      const parsedMessage = JSON.parse(message) as unknown;

      if (typeof parsedMessage === "string") {
        return normalizeFriendlyErrorMessage(parsedMessage);
      }

      if (Array.isArray(parsedMessage)) {
        const values = parsedMessage
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean);

        if (values.length > 0) {
          return values.map(normalizeFriendlyErrorMessage).join("\n");
        }
      }

      if (typeof parsedMessage === "object" && parsedMessage !== null) {
        if (
          "detail" in parsedMessage &&
          typeof (parsedMessage as { detail?: unknown }).detail === "string"
        ) {
          return normalizeFriendlyErrorMessage((parsedMessage as { detail: string }).detail);
        }

        const fieldMessages = Object.entries(parsedMessage as Record<string, unknown>).flatMap(
          ([field, value]) => {
            if (typeof value === "string") {
              const trimmedValue = value.trim();
              const friendlyValue = normalizeFriendlyErrorMessage(trimmedValue);

              if (field === "email" && isDuplicateEmailMessage(friendlyValue)) {
                return [friendlyValue];
              }

              if (field === "password2" && isPasswordMismatchMessage(friendlyValue)) {
                return ["Пароли не совпадают."];
              }

              return trimmedValue
                ? [
                    field === "non_field_errors"
                      ? friendlyValue
                      : `${getUserErrorFieldLabel(field)}: ${friendlyValue}`,
                  ]
                : [];
            }

            if (Array.isArray(value)) {
              return value
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => normalizeFriendlyErrorMessage(item))
                .map((item) => {
                  if (field === "email" && isDuplicateEmailMessage(item)) {
                    return item;
                  }

                  if (field === "password2" && isPasswordMismatchMessage(item)) {
                    return "Пароли не совпадают.";
                  }

                  return field === "non_field_errors"
                    ? item
                    : `${getUserErrorFieldLabel(field)}: ${item}`;
                });
            }

            return [];
          },
        );

        if (fieldMessages.length > 0) {
          return fieldMessages.join("\n");
        }
      }
    } catch {
      return normalizeFriendlyErrorMessage(message);
    }

    return normalizeFriendlyErrorMessage(message);
  }

  return "Что-то пошло не так. Попробуй еще раз.";
}

const USER_ERROR_FIELD_LABELS: Record<string, string> = {
  email: "Почта",
  password1: "Пароль",
  password2: "Повтор пароля",
  first_name: "Имя",
  last_name: "Фамилия",
  city: "Город",
  club: "Клуб",
};

function getUserErrorFieldLabel(field: string) {
  return USER_ERROR_FIELD_LABELS[field] ?? field;
}

function normalizeFriendlyErrorMessage(message: string) {
  const normalizedMessage = message.trim();
  const normalizedLowerMessage = normalizedMessage.toLowerCase();

  if (
    normalizedLowerMessage.includes("user with this email already exists") ||
    normalizedLowerMessage.includes("пользователь с таким email уже существует") ||
    (normalizedLowerMessage.includes("unique") && normalizedLowerMessage.includes("email"))
  ) {
    return "Пользователь с таким Email уже существует.";
  }

  if (normalizedLowerMessage.includes("не найдено активной учетной записи с указанными данными")) {
    return "Неверный логин или пароль.";
  }

  if (normalizedLowerMessage.includes("authentication credentials were not provided")) {
    return "Нужно войти в аккаунт.";
  }

  if (normalizedLowerMessage.includes("given token not valid")) {
    return "Сессия истекла. Войди заново.";
  }

  return normalizedMessage;
}

function isDuplicateEmailMessage(message: string) {
  const normalizedLowerMessage = message.trim().toLowerCase();

  return (
    normalizedLowerMessage.includes("user with this email already exists") ||
    normalizedLowerMessage.includes("пользователь с таким email уже существует") ||
    normalizedLowerMessage.includes("пользователь с такой почтой уже зарегистрирован") ||
    (normalizedLowerMessage.includes("unique") && normalizedLowerMessage.includes("email"))
  );
}

function isPasswordMismatchMessage(message: string) {
  return message.trim().toLowerCase().includes("пароли не совпадают");
}
