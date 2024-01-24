import { Test, TestingModule } from '@nestjs/testing';
import { AccountForcastingService } from './account_forcasting.service';

describe('AccountForcastingService', () => {
  let service: AccountForcastingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountForcastingService],
    }).compile();

    service = module.get<AccountForcastingService>(AccountForcastingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
