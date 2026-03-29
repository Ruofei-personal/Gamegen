import { DefaultGameEngine, type LevelDetail, type ViewportTransform } from "@gamegen/game-engine";

const level: LevelDetail = {
  id: "demo-1",
  title: "Demo Level",
  mode: "classic",
  contentVersion: "v1",
  left: { assetId: "left", url: "/assets/left.jpg", width: 1280, height: 720, mime: "image/jpeg" },
  right: { assetId: "right", url: "/assets/right.jpg", width: 1280, height: 720, mime: "image/jpeg" },
  regions: [
    { regionId: "a", shape: { kind: "bbox", x: 0.2, y: 0.3, w: 0.08, h: 0.08 } },
    { regionId: "b", shape: { kind: "circle", cx: 0.7, cy: 0.55, r: 0.04 } }
  ]
};

const engine = new DefaultGameEngine();
let state = engine.init(level);

export const viewport: ViewportTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  containerWidth: 1280,
  containerHeight: 720
};

export function onBoardTap(screenX: number, screenY: number): string {
  const res = engine.applyTap(
    state,
    { side: "left", screenX, screenY, ts: Date.now() },
    viewport
  );
  state = res.state;

  if (res.result.feedback === "found" && engine.isCompleted(state)) {
    return "已完成本关";
  }

  if (res.result.feedback === "duplicate") {
    return "该差异已找到";
  }

  return res.result.feedback === "found" ? "命中差异" : "未命中";
}
