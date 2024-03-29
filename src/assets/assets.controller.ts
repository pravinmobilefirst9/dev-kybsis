import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus, ParseIntPipe, Put } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AssetsSubTypeDTO } from './dto/asset-type.dto';
import { AssetFormDetails } from './dto/asset-form.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }


  @Post("create_asset_report_token")
  @UseGuards(AuthGuard)
  async createAssetReportToken(
    @Req() request: any,
  ) {
    try {
      const { user_id } = request.auth
      const result = await this.assetsService.createAssetReportToken(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post("import_asset_reports")
  @UseGuards(AuthGuard)
  async importAssets(
    @Req() request: any,
  ) {
    try {     
      const { user_id } = request.auth
      const result = await this.assetsService.importAssetReports(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('get_assets_details')
  @UseGuards(AuthGuard)
  async getAssetDetails(@Req() req: any) {
    const { user_id } = req.auth
    return await this.assetsService.getAssetDetails(user_id);
  }

  @Get("assets_list")
  @UseGuards(AuthGuard)
  async getAssetsList() {
    return await this.assetsService.getAssetsLists();
  }

  @Post("asset_sub_types")
  @UseGuards(AuthGuard)
  async getAssetsSubTypes(
    @Body() data: AssetsSubTypeDTO
  ) {

    return await this.assetsService.getAllAssetsSubTypes(data.asset_id);
  }

  @Post("get_asset_form")
  @UseGuards(AuthGuard)
  async getAssetForm(
    @Req() request: any,
    @Body() data: AssetFormDetails
  ) {
    const { user_id } = request.auth
    return await this.assetsService.getFormData(data, user_id);
  }

  @Post("create_asset")
  @UseGuards(AuthGuard)
  async addAsset(
    @Req() request: any,
    @Body() data: CreateAssetDto
  ) {
    const { user_id } = request.auth;
    return await this.assetsService.addUserAssetsDetails(data, user_id)
  }

  @Put("update_asset")
  @UseGuards(AuthGuard)
  async updateAsset(
    @Req() request: any,
    @Body() data: UpdateAssetDto
  ) {
    const { user_id } = request.auth;
    return await this.assetsService.updateUserAssetDetails(data, user_id)
  }

  @Post("get_plaid_assets")
  @UseGuards(AuthGuard)
  async getPlaidAssets( @Req() request: any,
  ){
    const { user_id } = request.auth;
    return await this.assetsService.getPlaidAssets(user_id)
  }

  @Delete("delete_asset/:asset_id")
  @UseGuards(AuthGuard)
  async deleteUserAsset(@Req() request : any, @Param('asset_id', ParseIntPipe) asset_id : number ){
    const { user_id } = request.auth;
    return await this.assetsService.deleteManualAsset(user_id, asset_id)
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
