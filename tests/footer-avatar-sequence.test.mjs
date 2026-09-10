import assert from "node:assert/strict";
import test from "node:test";

import {
  AVATAR_SEQUENCE,
  getVisibleAvatarSequence,
} from "../src/footerAvatarSequence.js";

function assertNoConsecutiveDuplicates(sequence) {
  for (let index = 1; index < sequence.length; index += 1) {
    assert.notEqual(sequence[index].id, sequence[index - 1].id);
  }
}

test("keeps adjacent footer avatars distinct at every supported breakpoint", () => {
  for (const count of [3, 6, 8]) {
    const sequence = getVisibleAvatarSequence(count);

    assert.equal(sequence.length, count);
    assertNoConsecutiveDuplicates(sequence);
    assert.notEqual(sequence[0].id, sequence.at(-1).id);
  }
});

test("keeps the doubled ticker seam distinct", () => {
  assertNoConsecutiveDuplicates(AVATAR_SEQUENCE);
  assert.notEqual(AVATAR_SEQUENCE.at(-1).id, AVATAR_SEQUENCE[0].id);
});

test("uses versioned transparent sources for every footer avatar variant", () => {
  assert.deepEqual(
    AVATAR_SEQUENCE.map(({ sources }) => sources.png),
    [
      "/assets/footer/avatar-head-v1.png",
      "/assets/footer/avatar-head-sport-v1.png",
      "/assets/footer/avatar-head-tropical-v1.png",
      "/assets/footer/avatar-head-graduate-v1.png",
      "/assets/footer/avatar-head-cyborg-v1.png",
      "/assets/footer/avatar-head-sport-v1.png",
      "/assets/footer/avatar-head-tropical-v1.png",
      "/assets/footer/avatar-head-graduate-v1.png",
    ],
  );
});
