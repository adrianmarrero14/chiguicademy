import type { Job } from 'bullmq';
import { SystemProcessor } from './system.processor.js';
import { SYSTEM_JOBS } from '../../infrastructure/queue/queue.constants.js';

describe('SystemProcessor', () => {
  const processor = new SystemProcessor();

  it('answers ping jobs with a pong and latency', async () => {
    const job = {
      name: SYSTEM_JOBS.PING,
      data: { requestedAt: new Date(Date.now() - 50).toISOString() },
    } as Job;

    const result = await processor.process(job);

    expect(result).toMatchObject({ pong: true });
    expect((result as { latencyMs: number }).latencyMs).toBeGreaterThanOrEqual(50);
  });

  it('rejects unknown job names', async () => {
    const job = { name: 'nope', data: {} } as Job;
    await expect(processor.process(job)).rejects.toThrow(/Unknown job/);
  });
});
