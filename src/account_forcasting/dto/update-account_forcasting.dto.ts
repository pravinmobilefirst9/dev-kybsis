import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountForcastingDto } from './create-account_forcasting.dto';

export class UpdateAccountForcastingDto extends PartialType(CreateAccountForcastingDto) {}
