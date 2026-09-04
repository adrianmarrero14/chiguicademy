import { Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { PrismaHealthIndicator } from './prisma.health.js';
import { RedisHealthIndicator } from './redis.health.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { REDIS_CLIENT } from '../../infrastructure/redis/redis.module.js';

describe('HealthController', () => {
  const prisma = { $queryRaw: vi.fn() };
  const redis = { ping: vi.fn() };
  let controller: HealthController;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule.forRoot({ logger: false })],
      controllers: [HealthController],
      providers: [
        PrismaHealthIndicator,
        RedisHealthIndicator,
        { provide: PrismaService, useValue: prisma },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('live reports ok without touching dependencies', async () => {
    const result = await controller.live();
    expect(result.status).toBe('ok');
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
    expect(redis.ping).not.toHaveBeenCalled();
  });

  it('ready reports ok when database and redis answer', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    redis.ping.mockResolvedValue('PONG');

    const result = await controller.ready();

    expect(result.status).toBe('ok');
    expect(result.info).toMatchObject({
      database: { status: 'up' },
      redis: { status: 'up' },
    });
  });

  it('ready fails when the database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
    redis.ping.mockResolvedValue('PONG');

    await expect(controller.ready()).rejects.toMatchObject({
      response: {
        status: 'error',
        error: { database: { status: 'down', message: 'connection refused' } },
      },
    });
  });
});
