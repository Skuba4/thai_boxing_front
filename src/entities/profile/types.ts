export type UserProfile = {
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  city: string;
  club: string;
  premium?: {
    is_premium: boolean;
  } | null;
};

export type UpdateProfilePayload = {
  first_name: string;
  last_name: string;
  city: string;
  club: string;
};

export type PremiumApplicationResponse = {
  message: string;
};
