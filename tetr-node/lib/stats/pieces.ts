// deprecated

import { loadRawStats, updateStat } from ".";

export type PiecesStat = {
  type: "pieces";
  data: number;
};

export const loadPieces = async () => {
  const all = await loadRawStats();
  for (const item of all) {
    if (item.type === "pieces") {
      return item.data;
    }
  }
	return 0;
};

export const addPieces = async (newPieces: number) => {
  const currentPieces = await loadPieces();
  updateStat("pieces", currentPieces + newPieces);
};
