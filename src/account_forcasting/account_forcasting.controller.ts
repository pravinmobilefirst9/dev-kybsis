import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Put } from '@nestjs/common';
import { AccountForcastingService } from './account_forcasting.service';
import { CreateAccountForcastingDto } from './dto/create-account_forcasting.dto';
import { UpdateAccountForcastingDto } from './dto/update-account_forcasting.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { InvestmentQueryDto } from './dto/forecast-account-v1.dto';

@Controller('account_forcasting')
export class AccountForcastingController {
  constructor(private readonly accountForcastingService: AccountForcastingService) {}
  @Post("create_forcast/v1")
  @UseGuards(AuthGuard)
  async calculateFutureValue(
    @Body() createAccountForcastingDto: InvestmentQueryDto,
    @Req() request: any,
    ) {
    const {user_id} = request.auth;
    return await this.accountForcastingService.calculateForecasting(createAccountForcastingDto,user_id);
  }

  @Put("create_forcast/v1/:forecastId")
  @UseGuards(AuthGuard)
  async updateFutureValueData(
    @Body() createAccountForcastingDto: InvestmentQueryDto,
    @Req() request: any,
    @Param('forecastId', ParseIntPipe) forecastId : number
    ) {
    const {user_id} = request.auth;
    return await this.accountForcastingService.calculateForecasting(createAccountForcastingDto, user_id, forecastId);
  }

  @Get("fetch_all_forcasting")
  @UseGuards(AuthGuard)
  async findAllForcasting(
    @Req() request: any,
  ) {
    const {user_id} = request.auth;
    return await this.accountForcastingService.findAllAccountForcasting(user_id);
  }

  @Get('fetch_all_forcasting/:id')
  @UseGuards(AuthGuard)
  async findOneAccountForcasting(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,    
    ) {
    const {user_id} = request.auth;
    return await this.accountForcastingService.getForcastingById(user_id, +id);
  }
  
  @Delete('delete_forcasting/:id')
  @UseGuards(AuthGuard)
  async removeAccountForcasting(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,    
    ) {
    const {user_id} = request.auth;
    return await this.accountForcastingService.deleteAccountForcasting(user_id, +id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountForcastingDto: UpdateAccountForcastingDto) {
    return this.accountForcastingService.update(+id, updateAccountForcastingDto);
  }

}
