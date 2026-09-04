import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { StorageModule } from './infrastructure/storage/storage.module.js';
import { HealthModule } from './modules/health/health.module.js';

/**
 * HTTP application root. Feature modules go under src/modules and are
 * imported here. Background processors live in WorkerModule, not here.
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    HealthModule,
  ],
})
export class AppModule {}
