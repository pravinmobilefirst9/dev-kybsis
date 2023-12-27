import { Test, TestingModule } from '@nestjs/testing';
import { LiabilitiesController } from './liabilities.controller';
import { LiabilitiesService } from './liabilities.service';

describe('LiabilitiesController', () => {
  let controller: LiabilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiabilitiesController],
      providers: [LiabilitiesService],
    }).compile();

    controller = module.get<LiabilitiesController>(LiabilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
