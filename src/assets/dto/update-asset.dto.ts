import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

class AssetFieldDTO {
    @IsInt({ message: 'Field ID must be an integer' })
    @IsNotEmpty({ message: 'Field ID is required' })
    field_id: number;
    
    @IsOptional()
    @IsString({ message: 'Value must be a string' })
    value: string;  
}


export class UpdateAssetDto {
    @IsInt({message : "Asset id should be number"})
    @IsNotEmpty({message : "Asset id should not be empty"})
    asset_id : number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AssetFieldDTO)
    fieldData: AssetFieldDTO[];
}
