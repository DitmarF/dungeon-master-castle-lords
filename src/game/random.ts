export type CampaignSeed = number;

export interface RandomSource {
  next(): number;
}

export interface CampaignSeedSource {
  nextCampaignSeed(): CampaignSeed;
}

const MAX_UINT32 = 0xffff_ffff;

export function isCampaignSeed(value: unknown): value is CampaignSeed {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_UINT32
  );
}

export function requireCampaignSeed(value: unknown): CampaignSeed {
  if (!isCampaignSeed(value)) {
    throw new Error("Campaign seed must be an unsigned 32-bit integer.");
  }
  return value;
}

export function createDeterministicRandom(seed: CampaignSeed): RandomSource {
  let value = requireCampaignSeed(seed) >>> 0;

  return {
    next() {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
    },
  };
}

export function randomInteger(
  random: RandomSource,
  min: number,
  max: number,
): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error("Random integer bounds must be ordered integers.");
  }
  return Math.floor(random.next() * (max - min + 1)) + min;
}
