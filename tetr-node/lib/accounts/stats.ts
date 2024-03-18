import { createAccount, getAccount, updateAccountStats } from ".";

export const afterGame = async (users: string[], time: number, winnerID?: string) => {
  const solo = users.length <= 1;
  for (const user of users) {
    const userData = await getAccount({ tetrioID: user });
    if (!userData) {
      try {
        await createAccount(user);
      } catch {
        continue;
      }
    }
    try {
      await updateAccountStats(
        { tetrioID: user },
        {
          lastGame: new Date(),
          games: userData.stats.games + 1,
          time: userData.stats.time + time,
          solo: {
            wins: userData.stats.solo.wins + (solo && winnerID === user ? 1 : 0),
            losses: userData.stats.solo.losses + (solo && winnerID === user ? 0 : 1),
          },
        }
      );
    } catch {}
  }
};
