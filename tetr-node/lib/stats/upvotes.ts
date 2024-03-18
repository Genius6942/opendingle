import { loadRawStats, updateStat } from ".";

export type UpvotesStat = {
  type: "upvotes";
  data: [string, number][];
};

export const loadUpvotes = async () => {
  const all = await loadRawStats();
  for (const item of all) {
    if (item.type === "upvotes") {
      return item.data;
    }
  }
  throw new Error("Upvotes stats not found");
};

export const updateUpvotes = async (newUpvotes: UpvotesStat['data']) => {
  
  updateStat("upvotes", newUpvotes);
};
