import type { BoxerRank, BoxerSex, CreateGridPayload, FightStage, RingStatus, RoomStatus } from "../features/auth/authApi";

export type ProfileFormState = {
  first_name: string;
  last_name: string;
  city: string;
  club: string;
};

export type RoomFormState = {
  name: string;
  description: string;
  start_date: string;
  status: RoomStatus;
};

export type BoxerFormState = {
  first_name: string;
  last_name: string;
  middle_name: string;
  birth_date: string;
  sex: BoxerSex;
  rank: BoxerRank;
  weight: string;
};

export type RoomBoxerFormState = {
  first_name: string;
  last_name: string;
  middle_name: string;
  age: string;
  sex: BoxerSex;
  rank: BoxerRank;
  weight: string;
};

export type RingFormState = {
  status: RingStatus;
  description: string;
};

export type FightFormState = {
  ring: string;
  grid_order: number;
  ring_order?: number | null;
  stage: FightStage;
};

export type GridFormState = CreateGridPayload;
