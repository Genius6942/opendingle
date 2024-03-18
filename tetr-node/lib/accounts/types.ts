import { ObjectId } from "mongodb";

export interface Account {
  _id: string;
  token: string;
  tetrio: {
    id: string;
    name: string;
    avatar: string;
  };
  stats: {
    lastGame: Date;
    games: number;
    time: number;
    solo: {
      wins: number;
      losses: number;
    };
  };
}

export type UserQuery = { tetrioID: string } | { documentID: string };

export const getQuery = (options: UserQuery) => {
  if ("tetrioID" in options) return { "tetrio.id": options.tetrioID };
  return { _id: new ObjectId(options.documentID) };
};
