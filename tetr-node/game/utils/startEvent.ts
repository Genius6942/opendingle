import { FullFrame, GameReadyData } from "../../client/src/types";

export default ({
  // @ts-ignore
  gameID,
  seed,
  pieces,
  options,
  bgm,
  username,
  handling,
  fullinterval,
  fulloffset,
  // @ts-ignore
  targets,
  multiplayer,
}: {
  gameID: string;
  seed: number;
  pieces: string[];
  options: GameReadyData["players"][0]["options"];
  bgm: string;
  fullinterval: number;
  fulloffset: number;
  username: string;
  multipleTargets?: true;
  targets: string[];
  handling: {
    arr: number;
    das: number;
    dcd: number;
    sdf: number;
    safelock: boolean;
    cancel: boolean;
  };
  multiplayer?: boolean;
}) => [
  {
    frame: 0,
    type: "full",
    data: {
      successful: false,
      gameoverreason: null,
      replay: {},
      source: {},
      options: {
        ...options,
        displayFire: multiplayer,
        ignorebgm: false,
        fulloffset,
        fullinterval,
        song: bgm,
        username,
        constants_overrides: {},
        boardbuffer: 20,
        physical: true,
        minoskin: {
          z: "tetrio",
          l: "tetrio",
          o: "tetrio",
          s: "tetrio",
          i: "tetrio",
          j: "tetrio",
          t: "tetrio",
          other: "tetrio",
        },
        ghostskin: "tetrio",
        boardskin: "generic",
      },
      stats: {
        seed: seed,
        lines: 0,
        level_lines: 0,
        level_lines_needed: 1,
        inputs: 0,
        holds: 0,
        time: { start: 0, zero: true, locked: false, prev: 0, frameoffset: 0 },
        score: 0,
        zenlevel: 1,
        zenprogress: 0,
        level: 1,
        combo: 0,
        currentcombopower: 0,
        topcombo: 0,
        btb: 0,
        topbtb: 0,
        currentbtbchainpower: 0,
        tspins: 0,
        piecesplaced: 0,
        clears: {
          singles: 0,
          doubles: 0,
          triples: 0,
          quads: 0,
          pentas: 0,
          realtspins: 0,
          minitspins: 0,
          minitspinsingles: 0,
          tspinsingles: 0,
          minitspindoubles: 0,
          tspindoubles: 0,
          tspintriples: 0,
          tspinquads: 0,
          tspinpentas: 0,
          allclear: 0,
        },
        garbage: { sent: 0, received: 0, attack: 0, cleared: 0 },
        kills: 0,
        finesse: { combo: 0, faults: 0, perfectpieces: 0 },
      },
      diyusi: 0,
      enemies: [],
      targets: [],
      fire: 0,
      game: {
        board: Array.from({ length: options.boardheight * 2 }, () =>
          Array.from({ length: options.boardwidth }, () => null),
        ),
        bag: [...pieces.map((piece) => piece.toLowerCase())],
        hold: { piece: null, locked: false },
        g: options.g,
        controlling: {
          ldas: 0,
          ldasiter: 0,
          lshift: false,
          rdas: 0,
          rdasiter: 0,
          rshift: false,
          lastshift: 0,
          softdrop: false,
        },
        handling: handling,
        playing: true,
      },
      killer: { name: null, type: "sizzle", gameid: null },
      aggregatestats: { apm: 0, pps: 0, vsscore: 0 },
    },
  } as FullFrame,
  { frame: 0, type: "start", data: {} },
];
