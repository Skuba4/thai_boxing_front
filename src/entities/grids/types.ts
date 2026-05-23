import type { Ring } from "../rings/types";

export type Grid = {
  uuid: string;
  room: string;
  name: string;
  boxer_list: Array<string | null>;
  ring: Ring | string | null;
};

export type CreateGridPayload = {
  name: string;
  boxer_list: string[];
};

export type UpdateGridPayload = Partial<CreateGridPayload> & {
  ring?: string | null;
};

export type BuildGridStagePayload = {
  boxer_list: Array<string | null>;
};
