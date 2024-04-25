import { Engine } from "..";

export const bfs = (
  engine: Engine,
  depth: number,
  target: [number, number][],
): false | string[] => {
  const keys = {
    left: engine.moveLeft.bind(engine),
    right: engine.moveRight.bind(engine),
    cw: engine.rotateCW.bind(engine),
    ccw: engine.rotateCCW.bind(engine),
    "180": engine.rotate180.bind(engine),
    soft: engine.softDrop.bind(engine),
  };

  const queue: string[][] = [];
  const reset = (() => {
    const og = {
      rotation: engine.falling.rotation,
      location: [...engine.falling.location] as [number, number],
    };
    return () => {
      engine.falling.rotation = og.rotation;
      engine.falling.location = [og.location[0], og.location[1]];
    };
  })();

  // populate queue with first moves
  for (const rot of [null, "ccw", "cw", "180"] as (keyof typeof keys)[]) {
    if (rot) {
      keys[rot]();
    }
    const left =
      engine.falling.blocks.reduce((a, b) => [Math.min(a[0], b[0]), 0])[0] +
      engine.falling.location[0];
    const right =
      engine.board.width -
      1 -
      (engine.falling.blocks.reduce((a, b) => [Math.max(a[0], b[0]), 0])[0] +
        engine.falling.location[0]);

    for (let x = 0; x < left; x++) {
      if (!rot && x === 0) continue;
      const k = rot
        ? [
            rot,
            ...Array(x)
              .fill("")
              .map(() => "left"),
          ]
        : [
            ...Array(x)
              .fill("")
              .map(() => "left"),
          ];
      queue.push(k);
    }

    for (let x = 1; x < right; x++) {
      const k = rot
        ? [
            rot,
            ...Array(x)
              .fill("")
              .map(() => "right"),
          ]
        : [
            ...Array(x)
              .fill("")
              .map(() => "right"),
          ];
      queue.push(k);
    }

    reset();
  }

  while (queue.length > 0) {
    const item = queue.shift() as (keyof typeof keys)[];
    for (const key of item.slice(0, item.length - 1)) {
      keys[key]();
    }

    const og = {
      rotation: engine.falling.rotation,
      location: [...engine.falling.location] as [number, number],
    };

    keys[item.at(-1) as (typeof item)[0]]();

    if (
      (["ccw", "cw", "180"].includes(item.at(-1) as any) &&
        engine.falling.rotation === og.rotation) ||
      (["left", "right"].includes(item.at(-1) as any) &&
        engine.falling.location[0] === og.location[0] &&
        engine.falling.location[1] === og.location[1])
    ) {
      reset();
      continue;
    }

    // check if all blocks match
    if (
      engine.falling.blocks
        .map((block) => [
          engine.falling.location[0] + block[0],
          engine.falling.location[1] - block[1],
        ])
        .every(
          (block: any) =>
            target.filter((t) => t[0] === block[0] && t[1] === block[1])
              .length > 0,
        )
    ) {
      reset();
      if (item[item.length - 1] === "soft") {
        item.splice(item.length - 1, 1);
      }
      return item;
    } else {
      if (item.length >= depth) {
        reset();
        continue;
      }
      const lastKey = item.at(-1) as keyof typeof keys;
      for (const key of Object.keys(keys)) {
        if (
          key === "hard" ||
          (key === "cw" && lastKey === "ccw") ||
          (key === "ccw" && lastKey === "cw") ||
          (key === "right" && lastKey === "left") ||
          (key === "left" && lastKey === "right")
        )
          continue;
        queue.push([...item, key]);
      }
      reset();
    }
  }

  return false;
};
