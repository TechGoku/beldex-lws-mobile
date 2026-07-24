// Fluid font-size helper. Most of the app sets `fontSize` as a fixed px
// value in MUI `sx` props, which never changes across a 320px phone and a
// 768px tablet. `rf(px)` turns a design-time px value into a `clamp()` that
// scales smoothly between a small-phone floor and a small-tablet ceiling
// (±`spread` around the original value), instead of staying frozen.
const MIN_VW = 360;
const MAX_VW = 768;
const ROOT_PX = 16;

const round = (n: number): string => (Math.round(n * 10000) / 10000).toString();

export function rf(px: number, spread = 0.12): string {
  const minPx = px * (1 - spread);
  const maxPx = px * (1 + spread);
  const slope = (maxPx - minPx) / (MAX_VW - MIN_VW);
  const intersectionRem = (minPx - slope * MIN_VW) / ROOT_PX;
  const slopeVw = slope * 100;
  const minRem = minPx / ROOT_PX;
  const maxRem = maxPx / ROOT_PX;
  return `clamp(${round(minRem)}rem, ${round(intersectionRem)}rem + ${round(slopeVw)}vw, ${round(maxRem)}rem)`;
}
