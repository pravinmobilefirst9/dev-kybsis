import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AuthGuard } from 'src/guards/auth.guard';

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
