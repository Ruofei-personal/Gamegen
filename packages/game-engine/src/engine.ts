import {
  type DifferenceRegion,
  type GameEngine,
  type GameState,
  type HitResult,
  type LevelDetail,
  type TapEvent,
  type ViewportTransform
} from "./types.js";

const DEBOUNCE_MS = 150;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

const mapToNormalized = (
  e: TapEvent,
  vp: ViewportTransform
): { x: number; y: number } => {
  const localX = (e.screenX - vp.translateX) / (vp.containerWidth * vp.scale);
  const localY = (e.screenY - vp.translateY) / (vp.containerHeight * vp.scale);

  return { x: clamp01(localX), y: clamp01(localY) };
};

const inRegion = (x: number, y: number, region: DifferenceRegion): boolean => {
  const { shape } = region;

  if (shape.kind === "circle") {
    const dx = x - shape.cx;
    const dy = y - shape.cy;
    return dx * dx + dy * dy <= shape.r * shape.r;
  }

  if (shape.kind === "bbox") {
    return x >= shape.x && x <= shape.x + shape.w && y >= shape.y && y <= shape.y + shape.h;
  }

  // ray casting for polygon
  let inside = false;
  for (let i = 0, j = shape.points.length - 1; i < shape.points.length; j = i++) {
    const pi = shape.points[i];
    const pj = shape.points[j];
    const intersect =
      pi.y > y !== pj.y > y && x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y + Number.EPSILON) + pi.x;
    if (intersect) inside = !inside;
  }
  return inside;
};

export class DefaultGameEngine implements GameEngine {
  private lastTapAt = 0;

  init(level: LevelDetail): GameState {
    return {
      level,
      foundRegionIds: new Set<string>(),
      misses: 0,
      hintsUsed: 0,
      startedAt: Date.now(),
      paused: false,
      remainingSec: level.mode === "timed" ? level.timeLimitSec : undefined
    };
  }

  applyTap(state: GameState, e: TapEvent, vp: ViewportTransform): { state: GameState; result: HitResult } {
    if (state.paused) {
      return { state, result: { hit: false, feedback: "miss" } };
    }

    if (e.ts - this.lastTapAt < DEBOUNCE_MS) {
      return { state, result: { hit: false, feedback: "miss" } };
    }
    this.lastTapAt = e.ts;

    const pt = mapToNormalized(e, vp);
    const region = state.level.regions.find((item) => inRegion(pt.x, pt.y, item));

    if (!region) {
      return {
        state: { ...state, misses: state.misses + 1 },
        result: { hit: false, feedback: "miss" }
      };
    }

    if (state.foundRegionIds.has(region.regionId)) {
      return {
        state,
        result: {
          hit: true,
          regionId: region.regionId,
          alreadyFound: true,
          feedback: "duplicate"
        }
      };
    }

    const nextFound = new Set(state.foundRegionIds);
    nextFound.add(region.regionId);

    return {
      state: { ...state, foundRegionIds: nextFound },
      result: {
        hit: true,
        regionId: region.regionId,
        feedback: "found"
      }
    };
  }

  useHint(state: GameState): { state: GameState; hintedRegionId?: string } {
    const remaining = state.level.regions.find((r) => !state.foundRegionIds.has(r.regionId));
    if (!remaining) {
      return { state };
    }

    return {
      state: { ...state, hintsUsed: state.hintsUsed + 1 },
      hintedRegionId: remaining.regionId
    };
  }

  pause(state: GameState): GameState {
    return { ...state, paused: true };
  }

  resume(state: GameState): GameState {
    return { ...state, paused: false };
  }

  isCompleted(state: GameState): boolean {
    return state.foundRegionIds.size >= state.level.regions.length;
  }
}
