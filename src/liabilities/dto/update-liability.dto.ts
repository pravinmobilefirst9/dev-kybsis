import { PartialType } from '@nestjs/mapped-types';
import { CreateLiabilityDto } from './create-liability.dto';

export class UpdateLiabilityDto extends PartialType(CreateLiabilityDto) {}
