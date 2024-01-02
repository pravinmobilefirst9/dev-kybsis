import { IsInt, IsNotEmpty } from "class-validator";

export class AssetsSubTypeDTO {
    @IsInt({message : "Asset id should be number"})
    @IsNotEmpty({message : "Asset id should not be empty"})
    asset_id : number
}