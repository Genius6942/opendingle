import { insert, query, transformID, update } from "../mongodb";
import { Account, UserQuery, getQuery } from "./types";
import { generateToken, revokeToken } from "./token";
import { getUser as getUserOg } from "../../client/src/api/game";
import { ObjectId } from "mongodb";
import config from "../../config";
import { loadPieces } from "../stats";

const token = process.env.TETRIO_TOKEN;
const getUser = (userID: string) => getUserOg(token, userID);

export const getAccount = async (options: UserQuery): Promise<Account | null> => {
  const res = await query<Omit<Account, "_id"> & { _id: ObjectId }>(
    "users",
    getQuery(options)
  );

  if (res.length === 0) return null;
  return transformID(res[0]);
};

export const updateAccountStats = async (
  query: UserQuery,
  stats: Partial<Account["stats"]>
) => {
  const account = await getAccount(query);
  if (!account) throw new Error("Account does not exist");
  update("users", getQuery(query), { $set: { stats } });
};

export const createAccount = async (userID: string) => {
  const tetrio = await getUser(userID);
  if (!tetrio) throw new Error("User not found");
  const token = generateToken();
  const account: Omit<Account, "_id"> = {
    token,
    tetrio: {
      id: tetrio._id,
      name: tetrio.username,
      avatar:
        tetrio.role === "anon"
          ? "https://tetr.io/res/avatar.png"
          : `https://tetr.io/user-content/avatars/${tetrio._id}.jpg?rv=${tetrio.avatar_revision}`,
    },
    stats: {
      time: 0,
      games: 0,
      lastGame: new Date(),
      solo: {
        wins: 0,
        losses: 0,
      },
    },
  };

  const res = await query<Account>("users", { "tetrio.id": tetrio._id });
  if (res.length > 0) throw new Error("Account already exists");

  const { insertedId } = await insert("users", account);
  return { documentID: insertedId.toString() as string, token };
};

export const updateAccountTetrio = async (query: UserQuery) => {
  const account = await getAccount(query);
  if (!account) throw new Error("Account does not exist");
  const tetrio = await getUser(account.tetrio.id);
  await update("users", query, {
    $set: {
      "tetrio.id": tetrio._id,
      "tetrio.name": tetrio.username,
      "tetrio.avatar":
        tetrio.role === "anon"
          ? "https://tetr.io/res/avatar.png"
          : `https://tetr.io/user-content/avatars/${tetrio._id}.jpg?rv=${tetrio.avatar_revision}`,
    },
  });
};

export const forceNewToken = async (query: UserQuery) => {
  const account = await getAccount(query);
  if (!account) throw new Error("Account does not exist");

  revokeToken(account.token);
  const newToken = generateToken();
  update("users", query, { $set: { token: newToken } });
};

export const getGlobalStats = async () => {
  // get all users and sum up their information like time, losses, accounts, etc
  const accounts = await query<Account>("users", {});

  const globalStats = {
    accounts: 0,
    time: 0,
    games: 0,
    wins: 0,
    losses: 0,
		pieces: await loadPieces()
  };

  accounts.forEach((account) => {
    globalStats.accounts++;
    globalStats.time += account.stats.time;
    globalStats.games += account.stats.games;
    globalStats.wins += account.stats.solo.wins;
    globalStats.losses += account.stats.solo.losses;
  });

  return globalStats;
};

export const getUsers = async() => {
	const accounts = await query<Account>("users", {});
	return accounts.map(account => {
		return {
			id: account.tetrio.id,
			name: account.tetrio.name,
			avatar: account.tetrio.avatar,
			stats: account.stats
		}
	})
}

export * from "./stats";
export * from "./types";
