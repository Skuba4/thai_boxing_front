export type BoxerSex = "M" | "F";
export type BoxerRank = "A" | "B" | "C";

export type Boxer = {
  uuid: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  birth_date: string;
  sex: BoxerSex;
  rank: BoxerRank;
  weight: string;
};

export type RoomBoxer = {
  uuid: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  age: number;
  sex: BoxerSex;
  rank: BoxerRank;
  weight: string;
  is_available: boolean;
  trainer: {
    first_name: string;
    last_name: string;
    email: string;
    city: string;
    club: string;
  } | null;
};

export type BoxerPayload = {
  first_name: string;
  last_name: string;
  middle_name: string;
  birth_date: string;
  sex: BoxerSex;
  rank: BoxerRank;
  weight: string;
};

export type RoomBoxerPayload = {
  first_name: string;
  last_name: string;
  middle_name: string;
  age: string;
  sex: BoxerSex;
  rank: BoxerRank;
  weight: string;
};
