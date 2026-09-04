import { Module } from '@nestjs/common';
import { SystemProcessor } from './system.processor.js';

@Module({
  providers: [SystemProcessor],
})
export class SystemJobsModule {}
