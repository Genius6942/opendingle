export const getMSTillNextPiece = ({
  pieces,
  pps,
  time,
  acceleration = 0,
  cap,
  max = Infinity,
  min = -Infinity,
}: {
  pieces: number;
  pps: number;
  time: number;
  acceleration: number;
  cap: number;
  max: number;
  min: number;
}) => {
  const res = ((pieces + 1) / pps) * 1000 - time;
  const accelerationAddition = (time * acceleration) / 1000;

  // min/max are opposite of what makes sense
  // because ms time is calculated by dividing by pps.
  // if pps is greater mstime is smaller
  return Math.max(
    1000 / cap,
    Math.max(
      getStaticMSTillNextPiece(max + accelerationAddition),
      Math.min(
        getStaticMSTillNextPiece(min + accelerationAddition),
        res + accelerationAddition,
      ),
    ),
  );
};

export const getStaticMSTillNextPiece = (pps: number) => 1000 / pps;
