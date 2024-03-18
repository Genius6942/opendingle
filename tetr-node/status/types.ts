export interface APIUserData {
  success: boolean;
  error?: string;
  cache?: {
    // Cache properties if available
  };
  data?: {
    user: {
      _id: string;
      username: string;
      role:
        | "anon"
        | "user"
        | "bot"
        | "halfmod"
        | "mod"
        | "admin"
        | "sysop"
        | "banned";
      ts?: string;
      botmaster?: string;
      badges: {
        id: string;
        label: string;
        ts?: string;
      }[];
      xp: number;
      gamesplayed: number;
      gameswon: number;
      gametime: number;
      country?: string | null;
      badstanding?: boolean;
      supporter: boolean;
      supporter_tier: number;
      verified: boolean;
      league: {
        gamesplayed: number;
        gameswon: number;
        rating: number;
        rank: string;
        bestrank: string;
        standing: number;
        standing_local: number;
        next_rank?: string | null;
        prev_rank?: string | null;
        next_at: number;
        prev_at: number;
        percentile: number;
        percentile_rank: string;
        glicko?: number;
        rd?: number;
        apm?: number;
        pps?: number;
        vs?: number;
        decaying: boolean;
      };
      avatar_revision?: number;
      banner_revision?: number;
      bio?: string;
      connections: {
        discord?: {
          id: string;
          username: string;
          friend_count: number;
          distinguishment?: {
            type: string;
          };
        };
      };
    };
  };
}

export type StatusData = {
  id: number;
  server: {
    main: { active: false } | { active: true; connected: boolean };
    workers: ({ id: string } & (
      | { active: false }
      | { active: true; rooms: number }
    ))[];
  };
  account:
    | {
        active: false;
      }
    | {
        active: true;

        level: number;
        levelProgress: number;
        xp: number;
        gamesPlayed: number;
        gamesWon: number;
        playtime: number;
      };
};
