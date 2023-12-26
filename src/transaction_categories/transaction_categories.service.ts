import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionCategoryDto } from './dto/create-transaction_category.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction_category.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class TransactionCategoriesService {

  constructor(
    private readonly prismaClient: PrismaService,
    private readonly transactionService: TransactionService,
  ) { }

  s
  async importPlaidCategories() {
    try {
      const categories = await this.transactionService.getAllPlaidCategories();
      await this.prismaClient.transactionCategory.createMany({
        skipDuplicates: true,
        data: categories.data
      })
      return {
        message: 'Categories imported successfully!',
        status: 'success',
        total: categories.data.length,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  create(createTransactionCategoryDto: CreateTransactionCategoryDto) {
    return 'This action adds a new transactionCategory';
  }

  findAll() {
    return `This action returns all transactionCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionCategory`;
  }

  update(id: number, updateTransactionCategoryDto: UpdateTransactionCategoryDto) {
    return `This action updates a #${id} transactionCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionCategory`;
  }
}
