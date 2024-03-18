export interface Config {
  /**
   * Bot owner's user ID
   */
  owner: string;
  /**
   * Bot admins' user IDs
   */
  admins: string[];
  /**
   * Blacklisted user IDs
   */
  blacklist: string[];
  /**
   * User IDs that can use the bot in test mode
   */
  testUsers: string[];

  /**
   * Bot's user ID
   */
  self: string;

  /**
   * Whether or not the bot is in dev mode
   */
  dev: boolean;
  /**
   * Site the bot is hosted on
   */
  siteURL: string;

  /**
   * Whether workers should be used
   */
  workers: boolean;

  /**
   * Constants for the bot
   */
  constants: {
    /**
     * How long to wait before saying a worker is slow
     */
    slowWorkerTimeout: 5000;
    /**
     * How to choose a worker
     */
    workerChoiceMethod: "first-available" | "random";
    /**
     * Rooms that the bot is banned from joining
     */
    bannedRooms: { [key: string]: string };
  };

  /**
   * Whether the bot should use GPT-3 in the chat
   *
   * Requires `OPENAI_API_KEY` to be set
   */
  gpt: false;
}

const config: Config = {
  owner: "", // Required
  admins: [],
  blacklist: [],
  testUsers: [],

  self: "", // Required

  dev: process.env.MODE !== "production",
  siteURL: process.env.SITE_URL,

  workers: false,
  constants: {
    slowWorkerTimeout: 5000,
    workerChoiceMethod: "first-available",
    bannedRooms: {
      STREAMERLOBBY: "Bots may not join event rooms with valuable rewards.",
      "X-QP": "Bots may not join quick play.",
    },
  },

  gpt: false,
};

export default config;
