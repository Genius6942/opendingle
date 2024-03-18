import fetch from "node-fetch";
import { SpawnMessage } from "../../../worker";
import config from "../../../config";

const initializeWorkerHandler = () => {
  if (!process.env.WORKERS) {
    throw new Error("workers not specified");
  }
  if (!process.env.WORKER_URL_FORMULA) {
    throw new Error("worker url formula not specified");
  }
  if (!process.env.WORKER_KEY) {
    throw new Error("worker key not specified");
  }

  const getWorkerURL = (worker: string) =>
    process.env.WORKER_URL_FORMULA.replaceAll("<id>", worker);

  const workers = process.env.WORKERS.split(",");
  const fetchWorkerStatuses = async () => {
    return Promise.all(
      workers.map(
        async (
          worker
        ): Promise<
          | { ok: false; worker: string; data: string }
          | { ok: true; worker: string; data: { rooms: string[] } }
        > => {
          try {
            return {
              ok: true,
              worker,
              data: (await fetch(getWorkerURL(worker) + "/status").then((r) => {
                return r.json();
              })) as {
                rooms: string[];
              },
            };
          } catch (e) {
            return { ok: false, worker, data: e };
          }
        }
      )
    );
  };

  const loadBalanceSpawn = async (
    data: SpawnMessage,
    onSlow = () => {},
    targetWorker?: string
  ) => {
    const slowTimeout = setTimeout(onSlow, config.constants.slowWorkerTimeout);
    const validWorkers = (await fetchWorkerStatuses()).filter((worker) => worker.ok) as {
      ok: true;
      data: { rooms: string[] };
      worker: string;
    }[];
    clearTimeout(slowTimeout);
    if (validWorkers.length === 0) throw new Error("No valid workers alive");

    const minRooms = validWorkers.reduce(
      (a, b) => Math.min(b.data.rooms.length, a),
      Infinity
    );
    const leastPopulatedWorkers = validWorkers.filter(
      (worker) => worker.data.rooms.length === minRooms
    );

    const worker =
      { ok: true, data: { rooms: [] }, worker: targetWorker } ||
      leastPopulatedWorkers[
        config.constants.workerChoiceMethod === "random"
          ? Math.floor(Math.random() * leastPopulatedWorkers.length)
          : 0
      ];

    const res: { success: false; message: string } | { success: true; code: string } =
      await fetch(getWorkerURL(worker.worker) + "/spawn", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + process.env.WORKER_KEY,
          "Content-Type": "application/json",
        },
      })
        .then((r) => {
          return r.json();
        })
        .catch((e) => {
          throw e;
        });

    if (res.success) return res.code;
    else {
      // @ts-ignore
      throw res.message;
    }
  };

  return {
    loadBalanceSpawn,
    getWorkerURL,
    workers,
    fetchWorkerStatuses,
  };
};

export default initializeWorkerHandler;
