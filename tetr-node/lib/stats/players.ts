// deprecated

import { loadRawStats, updateStat } from ".";

export type PlayersStat = {
  type: "players";
  data: string[];
};

export const loadPlayers = async () => {
  const all = await loadRawStats();
  for (const item of all) {
    if (item.type === "players") {
      return item.data;
    }
  }
  throw new Error("Players stats not found");
};

export const updatePlayers = async (newPlayers: string[]) => {
  const players = new Set(await loadPlayers());
  newPlayers.forEach((newPlayer) => players.add(newPlayer));

  updateStat("players", Array.from(players));
};
