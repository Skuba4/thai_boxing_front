export type RingStatus = "0" | "Y" | "N";

export type RingJudgeExtended = {
  role: "chief" | "side";
  is_active: boolean;
} | null;

export type Ring = {
  name: string;
  room: string;
  status: RingStatus;
  description: string;
  my_judge_extended: RingJudgeExtended;
};

export type UpdateRingPayload = {
  status: RingStatus;
  description: string;
};
