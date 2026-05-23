import type { RoomApplicationStatus } from "../applications/types";

export type RoomStatus = "0" | "Y" | "N";

export type RoomJudge = {
  status: RoomApplicationStatus;
  role: "chief" | "side";
  ring: "" | "A" | "B" | "C" | "D" | "E";
  is_active: boolean;
};

export type Room = {
  uuid: string;
  name: string;
  description: string;
  start_date: string;
  status: RoomStatus;
  is_owner: boolean;
  my_trainer_application_status: RoomApplicationStatus | null;
  my_judge: RoomJudge | null;
};

export type CreateRoomPayload = {
  name: string;
  description: string;
  start_date: string;
  status: RoomStatus;
};
