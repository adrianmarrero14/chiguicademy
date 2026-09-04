import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { StorageModule } from './infrastructure/storage/storage.module.js';
import { SystemJobsModule } from './jobs/system/system.module.js';

/**
 * Worker process root: queue processors (src/jobs) and scheduled tasks.
 * No HTTP controllers here.
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    ScheduleModule.forRoot(),
    SystemJobsModule,
  ],
})
export class WorkerModule {}
