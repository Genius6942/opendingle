import nodeFetch from "node-fetch";
import newFetch from "./fetch";

// @ts-ignore
const fetch: typeof nodeFetch = newFetch;
export default fetch;
