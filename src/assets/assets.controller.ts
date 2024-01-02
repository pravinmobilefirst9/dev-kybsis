import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AssetsSubTypeDTO } from './dto/asset-type.dto';
import { AssetFormDetails } from './dto/asset-form.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}


  @Post("create_asset_report_token")
  @UseGuards(AuthGuard)
  async createAssetReportToken(
    @Req() request : any,
  )
  {
    try {     
      const {user_id} = request.auth     
      const result = await this.assetsService.createAssetReportToken(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post("import_asset_reports")
  @UseGuards(AuthGuard)
  async importAssets(
    @Req() request : any,
  )
  {
    try {  
      const {user_id} = request.auth     
      const result = await this.assetsService.importAssetReports(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/get_assets_details')
  @UseGuards(AuthGuard)
  async getAssetDetails(){
    return await this.assetsService.getAssetDetails();
  }

  @Get("assets_list")
  @UseGuards(AuthGuard)
  async getAssetsList(){
    return await this.assetsService.getAssetsLists();
  }

  @Post("asset_sub_types")
  @UseGuards(AuthGuard)
  async getAssetsSubTypes(
    @Body() data : AssetsSubTypeDTO
  ){
   
    return await this.assetsService.getAllAssetsSubTypes(data.asset_id);
  }

  @Post("get_asset_form")
  @UseGuards(AuthGuard)
  async getAssetForm(
    @Req() request : any,
    @Body() data : AssetFormDetails
  ){
    const {user_id} = request.auth    
    return await this.assetsService.getFormData(data, user_id); 
  }

  
  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(+id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }
}
