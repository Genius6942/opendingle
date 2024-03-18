import get from "./get";

export interface RoomData {
  id: string;
  name: string;
  name_safe: string;
  type: string;
  userLimit: number;
  userRankLimit: string;
  state: string;
  allowAnonymous: boolean;
  allowUnranked: boolean;
  players: number;
  count: number;
}

/**
 * get direct messages, from new to oldest
 * @param token the client token
 * @returns array of dm data, empty array if none or on error
 */
export default async function getRooms(token: string) {
  const res = await get<any>(token, "rooms/");

  if (res === null) return [];
  else {
    if (res.success) return res.rooms as RoomData[];
    else return [];
  }
}
