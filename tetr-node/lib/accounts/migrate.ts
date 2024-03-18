// this is temporary ayyyayayyayay

// DO NOT RUN THE FOLLOWING CODE UNDER ANY CIRCUMSTANCES
// i just want to save it just in case
// this will mess up the database

import { createAccount } from ".";
import { query, update } from "../mongodb";

(async () => {
  // here we are going to migrate all the users cool
  // step 1: add stats to existing users

  const users = await query("users", {});
  await Promise.all(
    users.map((user) =>
      update(
        "users",
        { _id: user._id },
        {
          $set: {
            stats: {
              lastGame: new Date(),
              games: 0,
              time: 0,
              solo: {
                wins: 0,
                losses: 0,
              },
            },
          },
        },
      ),
    ),
  );

  console.log("done users");

  // step 2: update all the other users in stats

  const newUsers = (await query("stats", { type: "players" }))[0].data;

  for (const user of newUsers) {
    try {
      await createAccount(user);
      console.log("done", user);
    } catch (e) {
      console.warn(user + " " + e.message);
    }
    await new Promise((r) => setTimeout(r, 1010));
  }

  console.log("done stats");
  process.exit(0);
})();
