import { IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class AssetFormDetails {
    @IsOptional()
    @IsInt({message : "Asset id should be number"})
    asset_id : number

    @IsInt({message : "Asset type id should be number"})
    @IsNotEmpty({message : "Asset type id should not be empty"})
    asset_type_id : number

    @IsInt({message : "Asset Subtype id should be number"})
    @IsNotEmpty({message : "Asset Subtype id should not be empty"})
    asset_subtype_id : number
}