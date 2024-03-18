import {
  MongoClient,
  OptionalId,
  Document,
  ServerApiVersion,
  WithId,
  Filter,
  ObjectId,
} from "mongodb";
// Replace the placeholder with your Atlas connection string
const uri = process.env.MONGODB_URI!;

const database = process.env.MODE === "production" ? "prod" : "dev";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let connecting: boolean | Promise<MongoClient> = true;

(async () => {
  // Connect to the MongoDB cluster
  connecting = client.connect();
  await connecting;
  connecting = false;
})();

export const query = async <T = any>(
  collection: string,
  query: Filter<Document>,
  projection: Document = {},
) => {
  if (connecting) await connecting;
  return (await client
    .db(database)
    .collection(collection)
    .find(query)
    .project(projection)
    .toArray()) as WithId<T>[];
};

export const update = async <T = any>(
  collection: string,
  query: any,
  update: any,
) => {
  if (connecting) await connecting;
  return (await client
    .db(database)
    .collection(collection)
    .updateOne(query, update)) as T;
};

export const insert = async <T = any>(
  collection: string,
  doc: OptionalId<Document>,
) => {
  if (connecting) await connecting;
  return (await client.db(database).collection(collection).insertOne(doc)) as T;
};

export const updateOrInsert = async <T = any>(
  collection: string,
  search: any,
  set: any,
) => {
  if (connecting) await connecting;
  const queryRes = await query(collection, search);
  if (queryRes.length > 0) {
    return await update<T>(collection, search, { $set: { ...set } });
  } else {
    return await insert<T>(collection, set);
  }
};

export const remove = async (collection: string, search: any) => {
  if (connecting) await connecting;
  const res = await client
    .db(database)
    .collection(collection)
    .deleteOne(search);
  return !!res.deletedCount;
};

export const transformID = <T extends { _id: ObjectId }>(object: T) => {
  return { ...object, _id: object._id.toString() } as Omit<T, "_id"> & {
    _id: string;
  };
};
