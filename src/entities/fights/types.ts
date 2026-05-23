export type FightStage = "1/32" | "1/16" | "1/8" | "1/4" | "1/2" | "final";
export type FightStatus = "active" | "inactive";

export type FightSlot = {
  corner: "red" | "blue";
  boxer: string | null;
  source_fight: string | null;
  resolved_boxer?: string | null;
};

export type Fight = {
  uuid: string;
  grid: string;
  ring: string | null;
  grid_order: number | null;
  ring_order: number | null;
  stage: FightStage;
  status: FightStatus;
  slots: FightSlot[];
  winner: string | null;
};

export type CreateFightPayload = {
  ring: string;
  grid_order: number;
  ring_order?: number | null;
  stage: FightStage;
  slots: Array<{
    corner: "red" | "blue";
    boxer: string;
    source_fight?: string | null;
  }>;
};

export type UpdateFightRingOrderPayload = {
  fights: Record<string, number>;
  data?: Record<string, number>;
};

export type UpdateFightWinnerPayload = {
  winner: string | null;
};

export type UpdateFightStatusPayload = {
  status: FightStatus;
};

export type NoteRound = "1" | "2" | "3";

export type Note = {
  red_remark: string;
  blue_remark: string;
  round: NoteRound;
  fight: string;
  judge: string;
};

export type CreateNotePayload = {
  red_remark: string;
  blue_remark: string;
  round: NoteRound;
};
