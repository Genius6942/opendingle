import { query, updateOrInsert } from "../mongodb";
import { PiecesStat } from "./pieces";
import { PlayersStat } from "./players";
import { UpvotesStat } from "./upvotes";

export type Stat = {
  _id: string;
} & (PlayersStat | PiecesStat | UpvotesStat);

export type ExtractStatDataType<
  TType extends Stat["type"],
  TStat = Stat,
> = TStat extends {
  type: TType;
  data: infer TData;
}
  ? TData
  : never;

export const loadRawStats = async (): Promise<Stat[]> =>
  (await query("stats", {})).map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

export const updateStat = async <T extends Stat["type"]>(
  type: T,
  data: ExtractStatDataType<T>,
) => {
  await updateOrInsert("stats", { type }, { type, data });
  return true;
};

export * from "./players";
export * from "./pieces";
export * from "./upvotes";