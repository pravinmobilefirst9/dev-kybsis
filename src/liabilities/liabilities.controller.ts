import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpException, HttpStatus } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';

@Controller('liabilities')
export class LiabilitiesController {
  constructor(private readonly liabilitiesService: LiabilitiesService) {}


  @Post("import_liabilities")
  // @UseGuards(AuthGuard)
  async importLiabilities(
    @Req() request : any
  )
  {
    try {
      // const {user_id} = req.auth     
      const result = await this.liabilitiesService.importLiabilities();
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Post()
  create(@Body() createLiabilityDto: CreateLiabilityDto) {
    return this.liabilitiesService.create(createLiabilityDto);
  }

  @Get()
  findAll() {
    return this.liabilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liabilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiabilityDto: UpdateLiabilityDto) {
    return this.liabilitiesService.update(+id, updateLiabilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liabilitiesService.remove(+id);
  }
}
