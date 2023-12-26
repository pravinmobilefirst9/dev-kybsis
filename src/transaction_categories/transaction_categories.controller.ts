import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionCategoriesService } from './transaction_categories.service';
import { CreateTransactionCategoryDto } from './dto/create-transaction_category.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction_category.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('transaction_categories')
export class TransactionCategoriesController {
  constructor(private readonly transactionCategoriesService: TransactionCategoriesService) {}

  @Post("import_plaid_categories")
  // @UseGuards(AuthGuard)
  async importPlaidCaregories(){
    try {
      const result = await this.transactionCategoriesService.importPlaidCategories();
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




  @Post()
  create(@Body() createTransactionCategoryDto: CreateTransactionCategoryDto) {
    return this.transactionCategoriesService.create(createTransactionCategoryDto);
  }

  @Get()
  findAll() {
    return this.transactionCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionCategoryDto: UpdateTransactionCategoryDto) {
    return this.transactionCategoriesService.update(+id, updateTransactionCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionCategoriesService.remove(+id);
  }
}
