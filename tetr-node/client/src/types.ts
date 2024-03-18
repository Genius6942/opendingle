import { EVENTS_TYPES as EVENTS } from "./constants";

export type EventsTypes = (typeof EVENTS)[keyof typeof EVENTS];

export type SessionEvents = {
  [EVENTS.SESSION_READY]: string;
  [EVENTS.SESSION_ERROR]: string;
  [EVENTS.SESSION_DEAD]: boolean;
};

/** raw ribbon events */
export type RibbonEvents = {
  [EVENTS.RIBBON_USER_PRESENCE]: {
    user: string;
    presence: {
      status: "online" | "away" | "busy" | "offline";
      detail: /*"" | "menus" | "40l" | "blitz" | "zen" | "custom" |*/ string;
      invitable: boolean;
    };
  };

  [EVENTS.RIBBON_USER_DM]: {
    id: string;
    data: {
      content: string;
      content_safe: string;
      user: string;
      userdata: {
        role: "banned" | "user" | "bot" | "halfmod" | "mod" | "admin" | "sysop";
        supporter: boolean;
        supporter_tier: number;
        verified: boolean;
      };
      system: boolean;
    };
    stream: string;
    ts: string;
  };

  [EVENTS.RIBBON_USER_INVITE]: {
    sender: string;
    roomid: string;
    roomname: string;
    roomname_safe: string;
  };

  [EVENTS.RIBBON_ROOM_CHAT]: {
    content: string;
    content_safe: string;
    user: {
      _id: string;
      username: string;
      role: "anon" | "user" | "bot" | "halfmod" | "mod" | "admin" | "sysop";
      supporter: boolean;
      supporter_tier: number;
      verified: boolean;
    };
    system: boolean;
    // no idea what this is, probably something to do with superlobby user logging
    suppressable: boolean;
  };

  [EVENTS.RIBBON_ROOM_PLAYER_REMOVE]: string;

  [EVENTS.RIBBON_ROOM_HOST_UPDATE]: string;

  [EVENTS.RIBBON_PLAYERS_ONLINE]: {
    /** numbers of players currently online */
    data: number;
  };

  [EVENTS.RIBBON_ROOM_UPDATE]: RoomUpdateData;

  [EVENTS.RIBBON_ROOM_BRACKET_UPDATE]: {
    uid: string;
    bracket: "player" | "spectator";
  };
};

//////////

/** client to ribbon message types */
export type ClientEvents = {};

export interface Player {
  _id: string;
  username: string;
  anon: boolean;
  bot: boolean;
  role: "user" | "anon" | "bot" | "halfmod" | "mod" | "admin" | "sysop";
  xp: number;
  badges: {
    id: string;
    label: string;
    ts: string;
  }[];
  record: {
    games: number;
    wins: number;
    streak: number;
  };
  bracket: "player" | "spectator" | "observer";
  supporter: boolean;
  verified: boolean;
  country: string;
  id: number;
}

export type AddUserData = Player;

export interface GameReadyData {
  players: {
    gameid: string;
    userid: string;
    options: {
      version: number;
      seed_random: boolean;
      seed: number;
      g: number;
      stock: number;
      countdown: boolean;
      countdown_count: number;
      countdown_interval: number;
      precountdown: number;
      prestart: number;
      mission: string;
      mission_type: string;
      zoominto: string;
      slot_counter1: string;
      slot_counter2: string;
      slot_counter3: string;
      slot_counter5: string;
      slot_bar1: string;
      display_fire: boolean;
      display_username: boolean;
      hasgarbage: boolean;
      bgmnoreset: boolean;
      neverstopbgm: boolean;
      display_next: boolean;
      display_hold: boolean;
      infinite_hold: boolean;
      gmargin: number;
      gincrease: number;
      garbagemultiplier: number;
      garbagemargin: number;
      garbageincrease: number;
      garbagecap: number;
      garbagecapincrease: number;
      garbagecapmax: number;
      garbageholesize: number;
      garbagephase: boolean;
      garbagequeue: boolean;
      garbageare: number;
      garbageentry: string;
      garbageblocking: string;
      garbagetargetbonus: string;
      presets: string;
      bagtype: string;
      spinbonuses: string;
      combotable: string;
      kickset: string;
      nextcount: number;
      allow_harddrop: boolean;
      display_shadow: boolean;
      locktime: number;
      garbagespeed: number;
      forfeit_time: number;
      are: number;
      lineclear_are: number;
      infinitemovement: boolean;
      lockresets: number;
      allow180: boolean;
      objective: { type: string };
      room_handling: boolean;
      room_handling_arr: number;
      room_handling_das: number;
      room_handling_sdf: number;
      manual_allowed: boolean;
      b2bchaining: boolean;
      allclears: boolean;
      clutch: boolean;
      nolockout: boolean;
      passthrough: string;
      can_undo: boolean;
      can_retry: boolean;
      retryisclear: boolean;
      noextrawidth: boolean;
      stride: boolean;
      boardwidth: number;
      boardheight: number;
      new_payback: boolean;
      song: string;
      latencypreference: string;
      handling: {
        arr: number;
        das: number;
        dcd: number;
        sdf: number;
        safelock: boolean;
        cancel: boolean;
      };
      fulloffset: number;
      fullinterval: number;
      gameid: string;
      username: string;
      constants_overrides: Record<string, any>;
      garbageattackcap: boolean;
      nosound: boolean;
      boardbuffer: number;
      survival_cap: number;
      survival_timer_itv: number;
      survival_layer_min: number;
      minoskin: {
        z: string;
        l: string;
        o: string;
        s: string;
        i: string;
        j: string;
        t: string;
        other: string;
      };
      ghostskin: string;
      boardskin: string;
    };
    alive: boolean;
  }[];
  isNew: boolean;
}

export interface ReplayInitData {
  listenID: string;
  frames: {
    frame: number;
    type: string;
    data: {
      id?: string;
      frame: number;
      type: string;
      data?: any;
      key?: string;
      hoisted?: boolean;
      subframe?: number;
    };
  }[];
  provisioned: number;
}

export interface GameBoardData {
  refereedata: {
    ft: number;
    wb: number;
    modename: string;
  };
  leaderboard: {
    user: {
      _id: string;
      username: string;
    };
    handling: {
      arr: number;
      das: number;
      dcd: number;
      sdf: number;
      safelock: boolean;
      cancel: boolean;
    };
    active: boolean;
    success: null | boolean;
    inputs: number;
    piecesplaced: number;
    naturalorder: number;
    score: number;
    wins: number;
    points: {
      primary: number;
      secondary: number;
      tertiary: number;
      extra: Record<string, any>;
    };
  }[];
}

export type EventDataMap = {
  "room.addplayer": AddUserData;
  "game.ready": GameReadyData;
  "game.board": GameBoardData;
  "game.match": GameMatchData;
  "room.leave": string;
  "game.end": GameEndData;
  err: string;
  replay: ReplayInitData | any;
};

export interface IGEData {
  data:
    | {
        type: "interaction" | "interaction_confirm";
        data: {
          iid: number;
          type: "interaction" | "interaction_confirm";
          amt: number;
          ackiid: number;
          x: number;
          y: number;
          column: number;
        };
        sender: string;
        sender_id: string;
        sent_frame: number;
        cid: number;
      }
    | {
        type: "kev";
        data: {
          type: "kev";
          victim: string;
          killer: {
            name: string;
            type: "sizzle";
          };
          fire: number;
        };
      };
  targetFrame: number;
  id: number;
  unlocks: number;
}

export interface IGEKevFrame {
  frame: number;
  type: "ige";
  data: {
    id: number;
    frame: number;
    type: "ige";
    data: {
      type: "kev";
      victim: {
        name: string;
        gameid: string;
      };
      killer: {
        name: string;
        gameid: string;
        type: string;
      };
      fire: number;
    };
  };
}

interface RoomUpdateData {
  id: string;
  name: string;
  name_safe: string;
  type: string;
  owner: string;
  creator: string;
  state: string;
  auto: {
    enabled: boolean;
    status: string;
    time: number;
    maxtime: number;
  };
  options: {
    version: number;
    seed_random: boolean;
    seed: number;
    g: number;
    stock: number;
    countdown: boolean;
    countdown_count: number;
    countdown_interval: number;
    precountdown: number;
    prestart: number;
    mission: string;
    mission_type: string;
    zoominto: string;
    slot_counter1: string;
    slot_counter2: string;
    slot_counter3: string;
    slot_counter5: string;
    slot_bar1: string;
    display_fire: boolean;
    display_username: boolean;
    hasgarbage: boolean;
    bgmnoreset: boolean;
    neverstopbgm: boolean;
    display_next: boolean;
    display_hold: boolean;
    infinite_hold: boolean;
    gmargin: number;
    gincrease: number;
    garbagemultiplier: number;
    garbagemargin: number;
    garbageincrease: number;
    garbagecap: number;
    garbagecapincrease: number;
    garbagecapmax: number;
    garbageholesize: number;
    garbagephase: number;
    garbagequeue: boolean;
    garbageare: number;
    garbageentry: string;
    garbageblocking: string;
    garbagetargetbonus: string;
    presets: string;
    bagtype: string;
    spinbonuses: string;
    combotable: string;
    kickset: string;
    nextcount: number;
    allow_harddrop: boolean;
    display_shadow: boolean;
    locktime: number;
    garbagespeed: number;
    forfeit_time: number;
    are: number;
    lineclear_are: number;
    infinitemovement: boolean;
    lockresets: number;
    allow180: boolean;
    objective: {
      type: string;
    };
    room_handling: boolean;
    room_handling_arr: number;
    room_handling_das: number;
    room_handling_sdf: number;
    manual_allowed: boolean;
    b2bchaining: boolean;
    allclears: boolean;
    clutch: boolean;
    nolockout: boolean;
    passthrough: string;
    can_undo: boolean;
    can_retry: boolean;
    retryisclear: boolean;
    noextrawidth: boolean;
    stride: boolean;
    boardwidth: number;
    boardheight: number;
    new_payback: boolean;
  };
  userLimit: number;
  autoStart: number;
  allowAnonymous: boolean;
  allowUnranked: boolean;
  allowBots: boolean;
  userRankLimit: string;
  useBestRankAsLimit: boolean;
  forceRequireXPToChat: boolean;
  bgm: string;
  match: {
    gamemode: string;
    modename: string;
    ft: number;
    wb: number;
    record_replays: boolean;
    winningKey: string;
    keys: {
      primary: string;
      primaryLabel: string;
      primaryLabelSingle: string;
      primaryIsAvg: boolean;
      secondary: string;
      secondaryLabel: string;
      secondaryLabelSingle: string;
      secondaryIsAvg: boolean;
      tertiary: string;
      tertiaryLabel: string;
      tertiaryLabelSingle: string;
      tertiaryIsAvg: boolean;
    };
    extra: {};
  };
  players: [
    {
      _id: string;
      username: string;
      anon: boolean;
      bot: boolean;
      role: string;
      xp: number;
      badges: [
        {
          id: string;
          label: string;
          group: null;
          ts: string;
        }
      ];
      record: {
        games: number;
        wins: number;
        streak: number;
      };
      bracket: string;
      supporter: boolean;
      verified: boolean;
      country: string;
    }
  ];
}

interface GameMatchData {
  refereedata: {
    ft: number;
    wb: number;
    modename: string;
  };
  leaderboard: Array<{
    id: string;
    username: string;
    handling: {
      arr: number;
      das: number;
      dcd: number;
      sdf: number;
      safelock: boolean;
      cancel: boolean;
    };
    active: boolean;
    success: null | any;
    inputs: number;
    piecesplaced: number;
    naturalorder: number;
    score: number;
    wins: number;
    points: {
      primary: number;
      secondary: number;
      tertiary: number;
      extra: {};
    };
  }>;
}

export interface FullFrame {
  frame: number;
  type: string;
  data: {
    successful: boolean;
    gameoverreason: null | any;
    replay: {};
    source: {};
    options: {
      version: number;
      seed_random: boolean;
      seed: number;
      g: number;
      stock: number;
      countdown: boolean;
      countdown_count: number;
      countdown_interval: number;
      precountdown: number;
      prestart: number;
      mission: string;
      mission_type: string;
      zoominto: string;
      slot_counter1: string;
      slot_counter2: string;
      slot_counter3: string;
      slot_counter5: string;
      slot_bar1: string;
      display_fire: boolean;
      display_username: boolean;
      hasgarbage: boolean;
      bgmnoreset: boolean;
      neverstopbgm: boolean;
      display_next: boolean;
      display_hold: boolean;
      infinite_hold: boolean;
      gmargin: number;
      gincrease: number;
      garbagemultiplier: number;
      garbagemargin: number;
      garbageincrease: number;
      garbagecap: number;
      garbagecapincrease: number;
      garbagecapmax: number;
      garbageholesize: number;
      garbagephase: boolean;
      garbagequeue: boolean;
      garbageare: number;
      garbageentry: string;
      garbageblocking: string;
      garbagetargetbonus: string;
      presets: string;
      bagtype: string;
      spinbonuses: string;
      combotable: string;
      kickset: string;
      nextcount: number;
      allow_harddrop: boolean;
      display_shadow: boolean;
      locktime: number;
      garbagespeed: number;
      forfeit_time: number;
      are: number;
      lineclear_are: number;
      infinitemovement: boolean;
      lockresets: number;
      allow180: boolean;
      objective: {
        type: string;
      };
      room_handling: boolean;
      room_handling_arr: number;
      room_handling_das: number;
      room_handling_sdf: number;
      manual_allowed: boolean;
      b2bchaining: boolean;
      allclears: boolean;
      clutch: boolean;
      nolockout: boolean;
      passthrough: string;
      can_undo: boolean;
      can_retry: boolean;
      retryisclear: boolean;
      noextrawidth: boolean;
      stride: boolean;
      boardwidth: number;
      boardheight: number;
      new_payback: boolean;
      song: string;
      latencypreference: string;
      handling: {
        arr: number;
        das: number;
        dcd: number;
        sdf: number;
        safelock: boolean;
        cancel: boolean;
      };
      fulloffset: number;
      fullinterval: number;
      gameid: string;
      username: string;
      constants_overrides: {};
      garbageattackcap: boolean;
      nosound: boolean;
      boardbuffer: number;
      survival_cap: number;
      survival_timer_itv: number;
      survival_layer_min: number;
      minoskin: {
        z: string;
        l: string;
        o: string;
        s: string;
        i: string;
        j: string;
        t: string;
        other: string;
      };
      ghostskin: string;
      boardskin: string;
    };
    stats: {
      seed: number;
      lines: number;
      level_lines: number;
      level_lines_needed: number;
      inputs: number;
      holds: number;
      time: {
        start: number;
        zero: boolean;
        locked: boolean;
        prev: number;
        frameoffset: number;
      };
      score: number;
      zenlevel: number;
      zenprogress: number;
      level: number;
      combo: number;
      currentcombopower: number;
      topcombo: number;
      btb: number;
      topbtb: number;
      currentbtbchainpower: number;
      tspins: number;
      piecesplaced: number;
      clears: {
        singles: number;
        doubles: number;
        triples: number;
        quads: number;
        pentas: number;
        realtspins: number;
        minitspins: number;
        minitspinsingles: number;
        tspinsingles: number;
        minitspindoubles: number;
        tspindoubles: number;
        tspintriples: number;
        tspinquads: number;
        tspinpentas: number;
        allclear: number;
      };
      garbage: {
        sent: number;
        received: number;
        attack: number;
        cleared: number;
      };
      kills: number;
      finesse: {
        combo: number;
        faults: number;
        perfectpieces: number;
      };
    };
    diyusi: number;
    enemies: any[];
    targets: any[];
    fire: number;
    game: {
      board: (string | null)[][];
      bag: string[];
      hold: {
        piece: null | any;
        locked: boolean;
      };
      g: number;
      controlling: {
        ldas: number;
        ldasiter: number;
        lshift: boolean;
        rdas: number;
        rdasiter: number;
        rshift: boolean;
        lastshift: number;
        softdrop: boolean;
      };
      handling: {
        arr: number;
        das: number;
        dcd: number;
        sdf: number;
        safelock: true;
        cancel: false;
      };
      playing: boolean;
    };
    killer: {
      gameid: null;
      name: null;
      type: string;
    };
    aggregatestats: {
      apm: number;
      pps: number;
      vsscore: number;
    };
  };
}

export interface GameEndData {
  leaderboard: {
    id: string;
    username: string;
    handling: {
      arr: number;
      das: number;
      dcd: number;
      sdf: number;
      safelock: boolean;
      cancel: boolean;
    };
    active: boolean;
    success: boolean;
    inputs: number;
    piecesplaced: number;
    naturalorder: number;
    score: number;
    wins: number;
    points: {
      primary: number;
      secondary: number;
      tertiary: number;
      extra: {};
    };
  }[];
  currentboard: {
    id: string;
    username: string;
    handling: {
      arr: number;
      das: number;
      dcd: number;
      sdf: number;
      safelock: boolean;
      cancel: boolean;
    };
    active: boolean;
    success: boolean;
    inputs: number;
    piecesplaced: number;
    naturalorder: number;
    score: number;
    wins: number;
    points: {
      primary: number;
      secondary: number;
      tertiary: number;
      extra: {};
    };
  }[];
  xpPerUser: number;
}
