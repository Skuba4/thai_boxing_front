const ACCESS_TOKEN_KEY = "front_access_token";
const REFRESH_TOKEN_KEY = "front_refresh_token";

export type AuthTokens = {
  access: string;
  refresh?: string;
};

export function getAuthTokens(): AuthTokens | null {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;

  if (!access) {
    return null;
  }

  return { access, refresh };
}

export function setAuthTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);

  if (tokens.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
