const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const defaultEnv = {
  apiBaseUrl: "http://127.0.0.1:8000/api",
  authLoginPath: "/users/login/",
  authRegisterPath: "/users/register/",
  authProfilePath: "/users/profile/",
  authPremiumPath: "/users/premium/",
  roomsPath: "/referee/rooms/",
  roomsAllPath: "/referee/rooms/all/",
  boxersPath: "/referee/boxers/",
};

function normalizeBaseUrl(value?: string) {
  return value?.replace(/\/+$/, "") ?? "";
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(rawApiBaseUrl) || defaultEnv.apiBaseUrl,
  authLoginPath: defaultEnv.authLoginPath,
  authRegisterPath: defaultEnv.authRegisterPath,
  authProfilePath: defaultEnv.authProfilePath,
  authPremiumPath: defaultEnv.authPremiumPath,
  roomsPath: defaultEnv.roomsPath,
  roomsAllPath: defaultEnv.roomsAllPath,
  boxersPath: defaultEnv.boxersPath,
};
