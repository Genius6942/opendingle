import { addExtension, Packr, Unpackr } from "msgpackr";
import fetch from "node-fetch";

addExtension({
  Class: undefined!,
  type: 1,
  read: (e) => (null === e ? { success: true } : { success: true, ...e }),
});

addExtension({
  Class: undefined!,
  type: 2,
  read: (e) => (null === e ? { success: false } : { success: false, error: e }),
});

const { unpack } = new Unpackr({
  int64AsType: "number",
  bundleStrings: true,
  sequential: false,
});

const { pack } = new Packr({
  int64AsType: "number",
  bundleStrings: true,
  sequential: false,
});

export default async function post<T = unknown>(
  token: string,
  url: string,
  body: any,
  jsonExclusive = true,
): Promise<T & { success: boolean }> {
  let res: any = await fetch(encodeURI("https://tetr.io/api/" + url), {
    body: !!jsonExclusive ? JSON.stringify(body) : pack(body),
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "User-Agent": "v8/001",

      Accept: !!jsonExclusive
        ? "application/json"
        : "application/vnd.osk.theorypack",
    },
  });

  res = !!jsonExclusive ? await res.text() : await res.arrayBuffer();
  res = !!jsonExclusive ? JSON.parse(res) : unpack(Buffer.from(res));

  return res as any as T & { success: boolean };
}
