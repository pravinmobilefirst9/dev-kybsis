import { Test, TestingModule } from '@nestjs/testing';
import { PlaidTartanController } from './plaid-tartan.controller';
import { PlaidTartanService } from './plaid-tartan.service';

describe('PlaidTartanController', () => {
  let controller: PlaidTartanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaidTartanController],
      providers: [PlaidTartanService],
    }).compile();

    controller = module.get<PlaidTartanController>(PlaidTartanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
