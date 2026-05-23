import type { Boxer } from "../boxers/types";

export type RoomApplicationStatus = "0" | "Y" | "N";

export type RoomApplication = {
  uuid: string;
  room: string;
  status: RoomApplicationStatus;
  boxers?: Boxer[];
  user: {
    first_name: string;
    last_name: string;
    email: string;
    city: string;
    club: string;
  } | null;
};

export type JudgeApplication = {
  uuid: string;
  room: string;
  status: RoomApplicationStatus;
  ring: "" | "A" | "B" | "C" | "D" | "E";
  role: "chief" | "side";
  is_active: boolean;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    city: string;
    club: string;
  } | null;
};

export type CreateRoomApplicationPayload = {
  boxer_ids: string[];
};

export type UpdateJudgeApplicationPayload = Partial<
  Pick<JudgeApplication, "status" | "ring" | "role" | "is_active">
>;
