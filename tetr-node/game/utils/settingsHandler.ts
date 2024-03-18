import { RibbonEvents } from "../../client/src/types";

type DeepKeys<T> = T extends object
  ? T extends any[]
    ? never
    : {
        // @ts-ignore
        [K in keyof T]-?: K | `${K}.${DeepKeys<T[K]>}`;
      }[keyof T]
  : "";

// @ts-ignore
type RemoveDotOptions<T extends string> = T extends `${infer U}.` ? never : T;

type DeepKey<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer First}.${infer Rest}`
    ? First extends keyof T
      ? DeepKey<T[First], Rest>
      : never
    : never;

type DeepKeyValue<T, K extends string> = K extends keyof T
  ? T[K]
  : DeepKey<T, K>;

type Key = RemoveDotOptions<DeepKeys<RibbonEvents["room.update"]>>;

export type RoomConfigOption<T = Key> = {
  key: T;
  level: "info" | "warning" | "error";
  message: string;
  // @ts-ignore
  check: (value: DeepKeyValue<RibbonEvents["room.update"], T>) => boolean;
};

const getNestedValue = <T, K = unknown>(
  obj: T,
  // @ts-ignore
  key: RemoveDotOptions<DeepKeys<T>>,
) => {
  const keys = (key as string).split(".");
  let val = obj;
  keys.forEach((key) => {
    if (typeof val === "object") {
      // @ts-ignore
      if ((!key) in val) throw new Error("invalid key");
      val = val[key];
    } else {
      throw new Error("invalid key");
    }
  });

  return val as any as K;
};

interface ConstraintOutput {
  level: "info" | "warning" | "error";
  message: string;
  value: any;
  property: Key;
}

const greaterSeverity = (
  a: "info" | "warning" | "error",
  b: "info" | "warning" | "error",
) => {
  if (a === "error" || b === "error") {
    return "error";
  } else if (a === "warning" || b === "warning") {
    return "warning";
  } else return "info";
};

export class SettingsHandler {
  constraints: RoomConfigOption[];
  constructor(ignoreDefaults = false) {
    this.constraints = ignoreDefaults ? [] : SettingsHandler.defaultConstraints;
  }

  checkRoomUpdate(data: RibbonEvents["room.update"]) {
    const outputs: ConstraintOutput[] = [];
    this.constraints.forEach((constraint) => {
      const value = getNestedValue(data, constraint.key);
      if (!constraint.check(value)) {
        outputs.push({
          level: constraint.level,
          message: constraint.message,
          property: constraint.key,
          value,
        });
      }
    });

    if (outputs.length === 0) return false;
    else {
      return {
        level: outputs.reduce(
          (a, b) => greaterSeverity(a, b.level),
          outputs[0].level,
        ),
        outputs,
      };
    }
  }

  addConstraint(constraint: RoomConfigOption) {
    this.constraints.push(constraint);
    return this;
  }
  removeConstraint(key: Key) {
    this.constraints = this.constraints.filter(
      (constraint) => constraint.key !== key,
    );
    return this;
  }

  static defaultConstraints: RoomConfigOption[] = [
    {
      key: "options.bagtype",
      check(value: string) {
        return value === "7-bag";
      },
      level: "error",
      message: "Bot only supports `7-bag` bag type",
    },
    {
      key: "options.spinbonuses",
      check(value: string) {
        return value === "T-spins";
      },
      level: "error",
      message: "Bot requires allowed spins to be `t-spins` to play",
    },
    {
      key: "options.combotable",
      check(value: string) {
        return value === "multiplier";
      },
      level: "error",
      message: "Bot only supports `multiplier` combo table",
    },
    {
      key: "options.kickset",
      check(value: string) {
        return value === "SRS+";
      },
      level: "error",
      message: "Bot only supports `SRS+` kicktable",
    },
    {
      key: "options.allow_harddrop",
      check(value: boolean) {
        return value;
      },
      level: "error",
      message: "Bot requires hard drop to be enabled to play",
    },
    {
      key: "options.display_hold",
      check(value: boolean) {
        return value;
      },
      level: "error",
      message: "Bot requires hold to work",
    },
    {
      key: "options.are",
      check(value: number) {
        return value === 0;
      },
      level: "error",
      message: "Bot only supports `0` ARE",
    },
    {
      key: "options.lineclear_are",
      check(value: number) {
        return value === 0;
      },
      level: "error",
      message: "Bot only supports `0` line clear ARE",
    },
    {
      key: "options.room_handling",
      check(value: boolean) {
        return !value;
      },
      level: "error",
      message: "Bot does not support custom room handling",
    },
    {
      key: "options.boardheight",
      check(value: number) {
        return value === 20;
      },
      level: "error",
      message: "Bot only supports default board height of 20",
    },
    {
      key: "options.boardwidth",
      check(value: number) {
        return value === 10;
      },
      level: "error",
      message: "Bot only supports default board width of 10",
    },
    {
      key: "options.g",
      check(value: number) {
        return value <= 0.05;
      },
      level: "warning",
      message: "Bot may misdrop at low pps and high gravity",
    },
    {
      key: "options.gincrease",
      check(value: number) {
        return value <= 0.005;
      },
      level: "warning",
      message: "Bot may misdrop at low pps and high gravity",
    },
    {
      key: "options.locktime",
      check(value: number) {
        return value > 1;
      },
      level: "error",
      message: "Bot requires at least 1 lock delay",
    },
    {
      key: "options.b2bchaining",
      check(value: boolean) {
        return value;
      },
      level: "error",
      message: "Bot requires B2B chaining to be on",
    },
    {
      key: "options.stock",
      check(value: number) {
        return value === 0;
      },
      level: "error",
      message: "Bot does not support stock",
    },
    {
      key: "options.passthrough",
      check(value: string) {
        return value === "zero";
      },
      level: "error",
      message: "Bot only supports default `zero` passthrough",
    },
    {
      key: "match.gamemode",
      check(value: string) {
        return value === "versus" || value === "practice";
      },
      level: "error",
      message: "Bot does not properly support royale mode",
    },
    {
      key: "options.garbagephase",
      check(value: number) {
        return value === 0;
      },
      level: "error",
      message: "Bot does not support garbage phase",
    },
    {
      key: "options.garbageentry",
      check(value: string) {
        return value === "instant";
      },
      level: "error",
      message: "Bot does not support non-instant garbage entry",
    },
    {
      key: "options.garbagetargetbonus",
      check(value: string) {
        return value === "none";
      },
      level: "error",
      message: "Bot does not support garbage targeting bonuses",
    },
  ];
}
