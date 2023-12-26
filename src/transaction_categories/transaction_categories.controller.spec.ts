import { Test, TestingModule } from '@nestjs/testing';
import { TransactionCategoriesController } from './transaction_categories.controller';
import { TransactionCategoriesService } from './transaction_categories.service';

describe('TransactionCategoriesController', () => {
  let controller: TransactionCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionCategoriesController],
      providers: [TransactionCategoriesService],
    }).compile();

    controller = module.get<TransactionCategoriesController>(TransactionCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
