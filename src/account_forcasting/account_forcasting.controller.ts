import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AccountForcastingService } from './account_forcasting.service';
import { CreateAccountForcastingDto } from './dto/create-account_forcasting.dto';
import { UpdateAccountForcastingDto } from './dto/update-account_forcasting.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('account_forcasting')
export class AccountForcastingController {
  constructor(private readonly accountForcastingService: AccountForcastingService) {}

  @Post("create_forcast")
  @UseGuards(AuthGuard)
  create(
    @Body() createAccountForcastingDto: CreateAccountForcastingDto,
    @Req() request: any,
    ) {
    const {user_id} = request.auth;
    return this.accountForcastingService.calculateForecastDetails(user_id, createAccountForcastingDto);
  }

  @Get("fetch_all_forcasting")
  @UseGuards(AuthGuard)
  findAllForcasting(
    @Req() request: any,
  ) {
    const {user_id} = request.auth;
    return this.accountForcastingService.findAllAccountForcasting(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountForcastingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountForcastingDto: UpdateAccountForcastingDto) {
    return this.accountForcastingService.update(+id, updateAccountForcastingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountForcastingService.remove(+id);
  }
}
