export const calculateFrames = (
  keys: string[],
  start: number,
  end: number,
  maxKeypressDuration = 1,
) => {
  if (maxKeypressDuration * keys.length * 2 < end - start) {
    const frameTime = (end - start) / keys.length;
    return keys
      .map((key, i) => {
        const frame = i * frameTime + start;
        return [
          {
            frame: Math.floor(frame),
            type: "keydown",
            data: { key, subframe: frame - Math.floor(frame) },
            provisioned: end,
          },
          {
            frame: Math.floor(frame + maxKeypressDuration),
            type: "keyup",
            data: {
              key,
              subframe: frame - Math.floor(frame),
            },
            provisioned: end,
          },
        ];
      })
      .flat();
  } else {
    return keys
      .map((key, i) => {
        const frame1 = i * 2 * ((end - start) / (keys.length * 2));
        const frame2 = (i * 2 + 1) * ((end - start) / (keys.length * 2));
        return [
          {
            frame: Math.floor(frame1 + start),
            type: "keydown",
            data: { key, subframe: frame1 - Math.floor(frame1) },
            provisioned: end,
          },
          {
            frame: Math.floor(frame2 + start),
            type: "keyup",
            data: {
              key,
              subframe: frame2 - Math.floor(frame2),
            },
            provisioned: end,
          },
        ];
      })
      .flat();
  }
};
