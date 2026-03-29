export const endpoints = {
  listLevels: "/v1/levels",
  levelDetail: (levelId: string): string => `/v1/levels/${levelId}`,
  createGameSession: "/v1/game-sessions",
  reportSessionEvents: (sessionId: string): string => `/v1/game-sessions/${sessionId}/events`,
  createUploadPresign: "/v1/uploads/presign",
  createUgcDraft: "/v1/ugc/levels",
  createDiffJob: "/v1/diff-jobs",
  getDiffJob: (jobId: string): string => `/v1/diff-jobs/${jobId}`
} as const;

export interface PresignUploadResponse {
  putUrl: string;
  objectKey: string;
  expiresAt: string;
}

export interface DiffJobStatusResponse {
  jobId: string;
  status: "pending" | "running" | "failed" | "completed";
  candidateRegions?: Array<{
    regionId: string;
    confidence: number;
    area: number;
  }>;
  message?: string;
}
