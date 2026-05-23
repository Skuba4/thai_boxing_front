export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access?: string;
  refresh?: string;
  token?: string;
};

export type RegisterPayload = {
  email: string;
  password1: string;
  password2: string;
};
