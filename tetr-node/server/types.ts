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
  botInRoom: boolean;
}

export interface User {
  id: string;
  token: string;
  tetrio: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  verified: boolean;
  email: string;
  flags: number;
  banner: string;
  accent_color: number;
  premium_type: number;
  public_flags: number;
}
