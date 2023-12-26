import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionCategoryDto } from './create-transaction_category.dto';

export class UpdateTransactionCategoryDto extends PartialType(CreateTransactionCategoryDto) {}
