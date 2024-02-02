import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  registerDecorator, ValidationOptions, ValidationArguments 
} from 'class-validator';

export enum Duration {
  Monthly = 'Monthly',
  Annually = 'Annually',
}

export class CreateBudgetDto {
  @IsOptional()
  @IsNumber({}, { message: 'budget Id must be a number.' })
  readonly budgetId: number;

  @IsEnum(Duration, { message: 'Invalid duration. Must be Monthly or Annually.' })
  readonly duration: Duration;

  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name should not be empty.' })
  readonly name: string;

  @IsNumber({}, { message: 'Set limit must be a number.' })
  @IsNotEmpty({ message: 'Category should not be empty.' })
  readonly categoryId: number;

  @IsNumber({}, { message: 'Amount must be a number.' })
  readonly amount: number;

  @IsNotEmpty({ message: 'Date should not be empty' })
  @IsDateFormat({message : "Enter date into dd-mm-yyyy format"})
  readonly startDate: string;

  @IsOptional()
  @IsEmail({}, { each: true, message: 'Invalid email address in collaborators.' })
  readonly collaborators?: string[];
}



export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Date format regex pattern
          const dateRegex = /^(0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4}$/;

          return dateRegex.test(value);
        },
      },
    });
  };
}
