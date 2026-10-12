import test from "node:test";
import assert from "node:assert/strict";
import { decideSpawnProfile } from "../src/spawn-router.js";

test("explicit patterns skip auto profile selection", () => {
  assert.equal(decideSpawnProfile({ patterns: ["full"] }, { clarity: "clear", profile: "fast" }), undefined);
});

test("unclear task is never auto-switched", () => {
  assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "unclear", profile: "fast" }), undefined);
});

test("returns each valid profile", () => {
  for (const profile of ["fast", "balanced", "reasoning", "long_context"]) {
    assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "clear", profile }), profile);
    assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "partially_clear", profile }), profile);
  }
});

test("unknown profile string is rejected", () => {
  assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "clear", profile: "turbo" }), undefined);
});
