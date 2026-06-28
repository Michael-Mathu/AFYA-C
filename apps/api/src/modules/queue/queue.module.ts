import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueEntry } from './entities/queue-entry.entity';
import { QueueStatus } from './entities/queue-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QueueEntry,
      QueueStatus,
    ]),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}