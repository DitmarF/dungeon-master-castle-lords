import {
  requireCampaignSeed,
  type CampaignSeedSource,
} from "./random.ts";

export const systemCampaignSeedSource: CampaignSeedSource = {
  nextCampaignSeed() {
    if (typeof globalThis.crypto?.getRandomValues !== "function") {
      throw new Error("Campaign seed generation is unavailable.");
    }

    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return requireCampaignSeed(values[0]);
  },
};
