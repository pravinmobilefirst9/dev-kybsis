import { Test, TestingModule } from '@nestjs/testing';
import { AccountForcastingController } from './account_forcasting.controller';
import { AccountForcastingService } from './account_forcasting.service';

describe('AccountForcastingController', () => {
  let controller: AccountForcastingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountForcastingController],
      providers: [AccountForcastingService],
    }).compile();

    controller = module.get<AccountForcastingController>(AccountForcastingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
