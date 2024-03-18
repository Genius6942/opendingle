export const XPtoLevel = (xp: number) =>
  Math.pow(xp / 500, 0.6) + xp / (5000 + Math.max(0, xp - 4000000) / 5000) + 1;

export const getLevelProgress = (xp: number) =>
  Math.floor((XPtoLevel(xp) % 1) * 100);
