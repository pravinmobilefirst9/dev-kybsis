import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive } from "class-validator";

export class AddWidget {
    // @IsBoolean({ message: 'Value must be a valid boolean.' })
    // @IsOptional({ message: 'Value must be provided as a query parameter.' })
    // readonly value: boolean;


    @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'Value must be a valid number.' })
    @IsInt({ message: 'Value must be an integer.' })
    @IsPositive({ message: 'Value must be a positive number.' })
    readonly widgetId: number;
  
}