import { describe, expect, it } from "vitest";
import { DefaultGameEngine, type LevelDetail } from "../src/index.js";

const sampleLevel: LevelDetail = {
  id: "lv-1",
  title: "sample",
  mode: "classic",
  left: { assetId: "a", url: "left.png", width: 1000, height: 1000, mime: "image/png" },
  right: { assetId: "b", url: "right.png", width: 1000, height: 1000, mime: "image/png" },
  contentVersion: "v1",
  regions: [{ regionId: "r1", shape: { kind: "bbox", x: 0.1, y: 0.1, w: 0.2, h: 0.2 } }]
};

const viewport = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  containerWidth: 1000,
  containerHeight: 1000
};

describe("DefaultGameEngine", () => {
  it("marks hit regions", () => {
    const engine = new DefaultGameEngine();
    const state = engine.init(sampleLevel);
    const { result, state: next } = engine.applyTap(
      state,
      { side: "left", screenX: 150, screenY: 150, ts: 1000 },
      viewport
    );

    expect(result.feedback).toBe("found");
    expect(next.foundRegionIds.has("r1")).toBe(true);
    expect(engine.isCompleted(next)).toBe(true);
  });

  it("counts misses", () => {
    const engine = new DefaultGameEngine();
    const state = engine.init(sampleLevel);
    const { result, state: next } = engine.applyTap(
      state,
      { side: "left", screenX: 900, screenY: 900, ts: 1000 },
      viewport
    );

    expect(result.feedback).toBe("miss");
    expect(next.misses).toBe(1);
  });
});
