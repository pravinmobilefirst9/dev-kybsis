import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaidTartanDto } from './create-plaid-tartan.dto';

export class UpdatePlaidTartanDto extends PartialType(CreatePlaidTartanDto) {}
