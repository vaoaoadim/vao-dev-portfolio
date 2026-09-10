const ASSET_ROOT = "/assets/footer";

const AVATARS = {
  base: {
    id: "base",
    sources: {
      avif: `${ASSET_ROOT}/avatar-head-v1.avif`,
      webp: `${ASSET_ROOT}/avatar-head-v1.webp`,
      png: `${ASSET_ROOT}/avatar-head-v1.png`,
    },
  },
  graduate: {
    id: "graduate",
    sources: {
      avif: `${ASSET_ROOT}/avatar-head-graduate-v1.avif`,
      webp: `${ASSET_ROOT}/avatar-head-graduate-v1.webp`,
      png: `${ASSET_ROOT}/avatar-head-graduate-v1.png`,
    },
  },
  cyborg: {
    id: "cyborg",
    sources: {
      avif: `${ASSET_ROOT}/avatar-head-cyborg-v1.avif`,
      webp: `${ASSET_ROOT}/avatar-head-cyborg-v1.webp`,
      png: `${ASSET_ROOT}/avatar-head-cyborg-v1.png`,
    },
  },
  tropical: {
    id: "tropical",
    sources: {
      avif: `${ASSET_ROOT}/avatar-head-tropical-v1.avif`,
      webp: `${ASSET_ROOT}/avatar-head-tropical-v1.webp`,
      png: `${ASSET_ROOT}/avatar-head-tropical-v1.png`,
    },
  },
  sport: {
    id: "sport",
    sources: {
      avif: `${ASSET_ROOT}/avatar-head-sport-v1.avif`,
      webp: `${ASSET_ROOT}/avatar-head-sport-v1.webp`,
      png: `${ASSET_ROOT}/avatar-head-sport-v1.png`,
    },
  },
};

// Every responsive prefix and the duplicated-track seam start and end with different avatars.
const SEQUENCE_IDS = [
  "base",
  "graduate",
  "cyborg",
  "tropical",
  "sport",
  "graduate",
  "cyborg",
  "tropical",
];

export const AVATAR_SEQUENCE = Object.freeze(SEQUENCE_IDS.map((id) => AVATARS[id]));

export function getVisibleAvatarSequence(count) {
  return AVATAR_SEQUENCE.slice(0, count);
}
