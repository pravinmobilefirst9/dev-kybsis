import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

class AssetFieldDTO {
    @IsInt({ message: 'Field ID must be an integer' })
    @IsNotEmpty({ message: 'Field ID is required' })
    field_id: number;
  
    @IsString({ message: 'Value must be a string' })
    @IsNotEmpty({ message: 'Value is required' })
    value: string;  
}


export class CreateAssetDto {
    @IsInt({message : "Asset type id should be number"})
    @IsNotEmpty({message : "Asset type id should not be empty"})
    asset_type_id : number

    @IsInt({message : "Account id should be number"})
    @IsNotEmpty({message : "Account id should not be empty"})
    account_id : number

    @IsNotEmpty({ message: 'Item Id is required and must be a number greater than 0.' })
    @IsNumber({}, { message: 'Item Id must be a number.' })
    @IsPositive({ message: 'Item Id must be a positive number.' })
    item_id: number;
    
    @IsInt({message : "Asset Subtype id should be number"})
    @IsNotEmpty({message : "Asset Subtype id should not be empty"})
    asset_sub_id : number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AssetFieldDTO)
    fieldData: AssetFieldDTO[];
}
