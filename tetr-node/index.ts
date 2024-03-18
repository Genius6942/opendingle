import dotenv from "dotenv";
import { log } from "./game/utils/log";
import fs from "node:fs/promises";
import path from "node:path";
if (process.env.MODE !== "production") {
  dotenv.config({ path: process.cwd() + "/.env" });
  log("loaded env");
}

if (!process.env.JOB) {
  console.error(
    "No job specified, please specify a `JOB` property in the .env file. Possible values: dev, status, main"
  );
  process.exit(0);
}
fetch("http://ip-api.com/json/")
  .then((r) => r.json())
  .then(({ query: ip, countryCode, region, city }: { [k: string]: string }) =>
    console.log("Starting from ip", ip, `at ${city}, ${region} in ${countryCode}`)
  )
  .catch((e) => console.error("failed to query ip:", e));
fetch("https://ch.tetr.io/api/users/haelp")
  .then((r) => r.json())
  .then((r) => console.log("owner:", r.data.user.username))
  .catch((e) => console.error(e));

import createBot from "./game/index";
import launchServer from "./server";
import launchStatusServer from "./status";
import startWorker from "./worker";
console.log("Machine:", process.env.MACHINE_ID);
// createBot({joinRoom: '1234'});
if (process.env.JOB === "dev") {
  log("Starting status and main servers and single worker in dev mode");
  launchServer(process.env.TETRIO_TOKEN!);
  launchStatusServer();
  startWorker(process.env.TETRIO_TOKEN!, createBot);
} else if (process.env.JOB === "status") {
  log("Starting status server in production mode");
  launchStatusServer();
} else if (process.env.JOB === "main") {
  log("Starting production main server");
  launchServer(process.env.TETRIO_TOKEN!);
} else if (process.env.JOB === "worker") {
  log("Starting production worker");
  startWorker(process.env.TETRIO_TOKEN!, createBot);
} else {
  console.error("Invalid job provided:", process.env.JOB);
}

async function createDirectoryIfNotExists(directoryPath: string) {
  try {
    await fs.access(directoryPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(directoryPath, { recursive: true });
      console.log(`Directory created: ${directoryPath}`);
    } else {
      throw error;
    }
  }
}

const myDir = path.join(process.cwd(), "wslogs");

createDirectoryIfNotExists(myDir).catch(console.error);
