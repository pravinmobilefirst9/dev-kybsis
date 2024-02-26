import { Module } from '@nestjs/common';
import { EventEmittorsService } from './event-emittors.service';

@Module({
  controllers: [],
  providers: [EventEmittorsService],
})
export class EventEmittorsModule {}
