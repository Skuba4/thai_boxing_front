import { env } from "../../config/env";

type RequestOptions = RequestInit & {
  authToken?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (options.authToken) {
    headers.set("Authorization", `Bearer ${options.authToken}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }

    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
