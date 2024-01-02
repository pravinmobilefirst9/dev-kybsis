import { IsInt, IsNotEmpty } from "class-validator";

export class AssetFormDetails {
    @IsInt({message : "Asset id should be number"})
    @IsNotEmpty({message : "Asset id should not be empty"})
    asset_id : number

    @IsInt({message : "Asset Subtype id should be number"})
    @IsNotEmpty({message : "Asset Subtype id should not be empty"})
    asset_subtype_id : number
}