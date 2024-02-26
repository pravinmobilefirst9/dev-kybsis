import { Test, TestingModule } from '@nestjs/testing';
import { EventEmittorsService } from './event-emittors.service';

describe('EventEmittorsService', () => {
  let service: EventEmittorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmittorsService],
    }).compile();

    service = module.get<EventEmittorsService>(EventEmittorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
