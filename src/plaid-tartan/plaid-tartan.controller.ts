import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { PlaidTartanService } from './plaid-tartan.service';
import { CreatePlaidTartanDto } from './dto/create-plaid-tartan.dto';
import { UpdatePlaidTartanDto } from './dto/update-plaid-tartan.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('plaid_tartan')
export class PlaidTartanController {
  constructor(private readonly plaidTartanService: PlaidTartanService) {}

  @Post("register_plaid_items")
  @UseGuards(AuthGuard)
  async addPlaidItems(
    @Body() createPlaidTartanDto: CreatePlaidTartanDto, 
    @Req() req : any
  ) {
    try {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.addPlaidItems(createPlaidTartanDto, user_id);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post("update_historical_transaction")
  @UseGuards(AuthGuard)
  async updateHistoricalTransactions(@Req() req : any) {
    try {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.updateHistoricalTransactions(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
 
  @Post("sync_historical_transaction")
  @UseGuards(AuthGuard)
  async syncHistoricalTransactions(@Req() req : any) {
    try {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.syncHistoricalTransactions(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // @Post()
  // create(@Body() createPlaidTartanDto: CreatePlaidTartanDto) {
  //   return this.plaidTartanService.create(createPlaidTartanDto);
  // }

  @Get()
  findAll() {
    return this.plaidTartanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plaidTartanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaidTartanDto: UpdatePlaidTartanDto) {
    return this.plaidTartanService.update(+id, updatePlaidTartanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plaidTartanService.remove(+id);
  }
}
