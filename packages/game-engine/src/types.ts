export type LevelId = string;
export type AssetId = string;

export interface ImageAssetRef {
  assetId: AssetId;
  url: string;
  width: number;
  height: number;
  mime: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  sha256?: string;
}

export type RegionShape =
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "bbox"; x: number; y: number; w: number; h: number }
  | { kind: "polygon"; points: Array<{ x: number; y: number }> };

export interface DifferenceRegion {
  regionId: string;
  shape: RegionShape;
  tolerancePx?: number;
  scoreWeight?: number;
}

export interface LevelDetail {
  id: LevelId;
  title: string;
  mode: "classic" | "timed";
  left: ImageAssetRef;
  right: ImageAssetRef;
  regions: DifferenceRegion[];
  timeLimitSec?: number;
  contentVersion: string;
}

export interface ViewportTransform {
  scale: number;
  translateX: number;
  translateY: number;
  containerWidth: number;
  containerHeight: number;
}

export interface TapEvent {
  side: "left" | "right";
  screenX: number;
  screenY: number;
  ts: number;
}

export interface HitResult {
  hit: boolean;
  regionId?: string;
  alreadyFound?: boolean;
  feedback: "found" | "miss" | "duplicate";
}

export interface GameState {
  level: LevelDetail;
  foundRegionIds: Set<string>;
  misses: number;
  hintsUsed: number;
  startedAt: number;
  paused: boolean;
  remainingSec?: number;
}

export interface GameEngine {
  init(level: LevelDetail): GameState;
  applyTap(
    state: GameState,
    e: TapEvent,
    vp: ViewportTransform
  ): { state: GameState; result: HitResult };
  useHint(state: GameState): { state: GameState; hintedRegionId?: string };
  pause(state: GameState): GameState;
  resume(state: GameState): GameState;
  isCompleted(state: GameState): boolean;
}
