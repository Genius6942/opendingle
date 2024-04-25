export const calculateIncrease = (
  base: number,
  frames: number,
  increase: number,
  marginTime: number,
) => {
  const times = Math.floor(Math.max(0, frames - marginTime) / 60);
  return base + increase * times;
};
