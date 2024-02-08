import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus, ParseIntPipe, Put } from '@nestjs/common';
import { PlaidTartanService } from './plaid-tartan.service';
import { CreatePlaidTartanDto } from './dto/create-plaid-tartan.dto';
import { UpdatePlaidTartanDto } from './dto/update-plaid-tartan.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ManualAccountDTO } from './dto/manual-account.dto';
import { CreateTransactionDto } from './dto/create-manual-transaction.dto';

@Controller('plaid_tartan')
export class PlaidTartanController {
  constructor(private readonly plaidTartanService: PlaidTartanService) {}

  @Get('fetch_manual_accounts')
  @UseGuards(AuthGuard)
  async fetchAllManualAccounts(@Req() request : any){
    const {user_id} = request.auth;     
    return await this.plaidTartanService.fetchAllManualAccounts(user_id);
  }


  @Post("register_plaid_items")
  @UseGuards(AuthGuard)
  async addPlaidItems(
    @Body() createPlaidTartanDto: CreatePlaidTartanDto, 
    @Req() req : any
  ) {
      const {user_id} = req.auth     
      return await this.plaidTartanService.addPlaidItems(createPlaidTartanDto, user_id);
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

   
  @Post("add_manual_account_info")
  @UseGuards(AuthGuard)
  async AddManualAccountInfo(@Req() req : any, @Body() payload : ManualAccountDTO) {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.addManualAccount(user_id, payload);
      return result;
  }

  @Put("add_manual_account_info/:id")
  @UseGuards(AuthGuard)
  async UpdateManualAccountInfo(
    @Req() req : any, 
    @Param('id', ParseIntPipe) id : number,
    @Body() payload : ManualAccountDTO) {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.addManualAccount(user_id, payload,id);
      return result;
  }

  @Delete("delete_manual_account/:id")
  @UseGuards(AuthGuard)
  async deleteManualAccount(
    @Req() req : any,
    @Param('id', ParseIntPipe) id : number,
    ) {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.deleteManualAccount(user_id, id);
      return result;
  }

  @Post("add_manual_transaction")
  @UseGuards(AuthGuard)
  async addManualTransaction(
    @Req() req : any,
    @Body() data : CreateTransactionDto,
    @Param('id', ParseIntPipe) id : number,
  ){
    const {user_id} = req.auth     
    const result = await this.plaidTartanService.addManualTransaction(user_id, data, );
    return result;
  }

  @Put("add_manual_transaction/:id")
  @UseGuards(AuthGuard)
  async updateManualTransaction(
    @Req() req : any,
    @Body() data : CreateTransactionDto,
    @Param('id', ParseIntPipe) id : number,
  ){
    const {user_id} = req.auth     
    const result = await this.plaidTartanService.addManualTransaction(user_id, data, id);
    return result;
  }

  @Delete("delete_manual_transaction/:id")
  @UseGuards(AuthGuard)
  async deleteManualTransaction(
    @Req() req : any,
    @Param('id', ParseIntPipe) id : number,
    ) {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.deleteManualTransaction(user_id, id);
      return result;
  }
  
  
}
