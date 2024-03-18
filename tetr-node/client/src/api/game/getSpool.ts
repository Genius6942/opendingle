import get from "./get";
import getDespool from "./getDespool";
import { log } from "../../../../game/utils/log";

export default async function getSpool(token: string): Promise<any> {
  const res =
    (await get<any>(token, "server/ribbon")) ||
    (await get<any>(token, "server/ribbon"));
  if (res?.success) {
    let data: {
      detail?: string;
      endpoint?: string;
      token?: string | undefined;
    } = {};

    try {
      if (res.spools === null) {
        data.detail = "fallback";
        data.endpoint = `tetr.io${res.endpoint}`;
        data.token = res.spools.token ?? undefined;

        return data;
      }

      for (let x of res.spools.spools) {
        try {
          let spool = await getDespool(token, x.host); /* TODO: h */
          /* what if a spoon is newly started tho */
          /* what if every spool is overloaded tho */
          if (spool.online && !spool.overloaded) {
            data.detail = "recommended";
            data.endpoint = `${x.host}${res.endpoint}`;
            data.token = res.spools.token;

            break;
          }
        } catch (e) {
          log("failed to get despool", x.host);
          continue;
        }
      }
    } catch (e) {
      log("failed to get ribbon endpoint");
      log(JSON.stringify(res));
      log(e);
    }

    return data;
  } else {
    // log(res);
    throw new Error("failed to find ribbon endpoint");
  }
}
