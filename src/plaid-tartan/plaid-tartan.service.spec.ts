import { Test, TestingModule } from '@nestjs/testing';
import { PlaidTartanService } from './plaid-tartan.service';

describe('PlaidTartanService', () => {
  let service: PlaidTartanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaidTartanService],
    }).compile();

    service = module.get<PlaidTartanService>(PlaidTartanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
