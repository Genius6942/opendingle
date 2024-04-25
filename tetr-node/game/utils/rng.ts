export const rng = (seed: number) => {
  let t = seed % 2147483647;

  if (t <= 0) {
    t += 2147483646;
  }

  return {
    next: function () {
      return (t = (16807 * t) % 2147483647);
    },
    nextFloat: function () {
      return (this.next() - 1) / 2147483646;
    },
    shuffleArray: function (array: string[]) {
      if (array.length == 0) {
        return array;
      }

      for (let i = array.length - 1; i != 0; i--) {
        const r = Math.floor(this.nextFloat() * (i + 1));
        [array[i], array[r]] = [array[r], array[i]];
      }

      return array;
    },
  };
};

export const bag7 = (seed: number) => {
  const gen = rng(seed);
  return () => gen.shuffleArray(["Z", "L", "O", "S", "I", "J", "T"]);
};

export const classic = (seed: number) => {
  const TETROMINOS = ["Z", "L", "O", "S", "I", "J", "T"];
  let lastGenerated: number | null = null;
  const gen = rng(seed);

  return () => {
    let index = Math.floor(gen.nextFloat() * (TETROMINOS.length + 1));

    if (index === lastGenerated || index >= TETROMINOS.length) {
      index = Math.floor(gen.nextFloat() * TETROMINOS.length);
    }

    return TETROMINOS[index];
  };
};

export const pairs = (seed: number) => {
  const gen = rng(seed);
  return () => {
    const s = gen.shuffleArray(["Z", "L", "O", "S", "I", "J", "T"]);
    const pairs = gen.shuffleArray([s[0], s[0], s[0], s[1], s[1], s[1]]);

    return pairs;
  };
};

export const random = (seed: number) => {
  const gen = rng(seed);
  return () => {
    const TETROMINOS = ["Z", "L", "O", "S", "I", "J", "T"];
    return TETROMINOS[Math.floor(gen.nextFloat() * TETROMINOS.length)];
  };
};
