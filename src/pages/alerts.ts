import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export type AlertTone = "success" | "error" | "warning";

const ERROR_MARKERS = [
  "не удалось",
  "ошибка",
  "истекла",
  "невер",
  "недостаточно",
  "already",
  "invalid",
  "forbidden",
  "not found",
  "failed",
];

const WARNING_MARKERS = [
  "сначала ",
  "выбери ",
  "изменений нет",
  "максимум ",
  "в ринге нет",
  "иначе потеряете",
  "удален",
  "удалена",
  "удалены",
  "убран",
  "убрана",
  "убраны",
  "снят",
  "снята",
  "сняты",
  "сброшен",
  "сброшена",
  "сброшены",
  "откреп",
  "выключен",
  "выключена",
  "выключены",
  "остановлен",
  "остановлена",
  "остановлены",
];

export function getAlertTone(message: string): AlertTone {
  const normalizedMessage = message.trim().toLowerCase();

  if (ERROR_MARKERS.some((marker) => normalizedMessage.includes(marker))) {
    return "error";
  }

  if (WARNING_MARKERS.some((marker) => normalizedMessage.includes(marker))) {
    return "warning";
  }

  return "success";
}

export function useAutoClearMessage(message: string, clearMessage: () => void, version?: number) {
  const previousMessageRef = useRef(message);

  useEffect(() => {
    if (!message) {
      previousMessageRef.current = message;
      return;
    }

    if (message !== previousMessageRef.current) {
      previousMessageRef.current = message;
    }
  }, [message]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(clearMessage, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [clearMessage, message, version]);
}

export function useFlashMessageState(initialMessage = "") {
  const [message, setMessageState] = useState(initialMessage);
  const [messageVersion, setMessageVersion] = useState(0);

  const setMessage = useCallback<Dispatch<SetStateAction<string>>>((nextMessage) => {
    const resolvedMessage = typeof nextMessage === "function" ? nextMessage(message) : nextMessage;

    setMessageVersion((current) => current + 1);
    setMessageState((current) => {
      if (resolvedMessage === "" || current !== resolvedMessage) {
        return resolvedMessage;
      }

      return "";
    });

    if (resolvedMessage) {
      window.setTimeout(() => {
        setMessageState(resolvedMessage);
      }, 0);
    }
  }, [message]);

  return {
    message,
    messageVersion,
    setMessage,
  };
}
