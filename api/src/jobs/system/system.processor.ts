import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import {
  PingJobData,
  QUEUES,
  SYSTEM_JOBS,
} from '../../infrastructure/queue/queue.constants.js';

/**
 * Processor for the "system" queue. Serves as the reference implementation
 * for future processors (media transcoding, subtitles, dubbing, ...).
 */
@Processor(QUEUES.SYSTEM)
export class SystemProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemProcessor.name);

  async process(job: Job<PingJobData, unknown, string>): Promise<unknown> {
    switch (job.name) {
      case SYSTEM_JOBS.PING:
        return this.ping(job.data);
      default:
        throw new Error(`Unknown job "${job.name}" on queue "${QUEUES.SYSTEM}"`);
    }
  }

  private ping(data: PingJobData): { pong: true; latencyMs: number } {
    const latencyMs = Date.now() - new Date(data.requestedAt).getTime();
    this.logger.log(`pong (latency ${latencyMs} ms)`);
    return { pong: true, latencyMs };
  }
}
