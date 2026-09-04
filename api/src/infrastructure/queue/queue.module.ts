import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import { QUEUES } from './queue.constants.js';

const queues = Object.values(QUEUES).map((name) => ({ name }));

/**
 * BullMQ root connection plus registration of every known queue.
 * Import this module wherever a `@InjectQueue(QUEUES.X)` producer lives,
 * and in the worker root so `@Processor(QUEUES.X)` classes get wired.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        connection: {
          host: config.get('REDIS_HOST', { infer: true }),
          port: config.get('REDIS_PORT', { infer: true }),
          password: config.get('REDIS_PASSWORD', { infer: true }),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
    }),
    BullModule.registerQueue(...queues),
  ],
  exports: [BullModule],
})
export class QueueModule {}
