/**
 * Queue names. Every queue is declared here so producers and processors
 * share one identifier. Add a new entry when a new background workload appears
 * (e.g. MEDIA for transcoding, SUBTITLES for transcription).
 */
export const QUEUES = {
  SYSTEM: 'system',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/** Job names per queue, typed so producers and processors stay in sync. */
export const SYSTEM_JOBS = {
  PING: 'ping',
} as const;

export interface PingJobData {
  requestedAt: string;
}
