import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus, ParseIntPipe, Put, Query } from '@nestjs/common';
import { PlaidTartanService } from './plaid-tartan.service';
import { CreatePlaidTartanDto } from './dto/create-plaid-tartan.dto';
import { UpdatePlaidTartanDto } from './dto/update-plaid-tartan.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ManualAccountDTO } from './dto/manual-account.dto';
import { CreateTransactionDto } from './dto/create-manual-transaction.dto';
import { AddBankDTO } from './dto/add-manual-bank.dto';
import { FetchUserBanks } from './dto/fetch-user-banks.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('plaid_tartan')
export class PlaidTartanController {
  constructor(private readonly plaidTartanService: PlaidTartanService, 
    ) {}

  @Get('fetch_manual_accounts/:item_id')
  @UseGuards(AuthGuard)
  async fetchAllManualAccounts(
    @Req() request : any,
    @Param('item_id', ParseIntPipe) item_id : number
    ){
    const {user_id} = request.auth;     
    return await this.plaidTartanService.fetchAllManualAccounts(user_id, item_id);
  }

  @Get('fetch_all_accounts/:ins_id')
  @UseGuards(AuthGuard)
  async fetchAllAccountsByInstitutionId(
    @Req() request : any,
    @Param('ins_id') ins_id : string
    ){
    const {user_id} = request.auth;     
    return await this.plaidTartanService.fetchAllAccountsByInstitutionId(user_id, ins_id);
  }

  @Get('fetch_manual_accounts/:item_id/:id')
  @UseGuards(AuthGuard)
  async fetchAllManualAccountById(
    @Req() request : any,
    @Param('item_id', ParseIntPipe) item_id : number,
    @Param('id') id : number ){
    const {user_id} = request.auth;     
    return await this.plaidTartanService.fetchAllManualAccounts(user_id, item_id, id);
  }


  @Post("register_plaid_items")
  @UseGuards(AuthGuard)
  async addPlaidItems(
    @Body() createPlaidTartanDto: CreatePlaidTartanDto, 
    @Req() req : any
  ) {
      const {user_id} = req.auth     
      const result =  await this.plaidTartanService.addPlaidItems(createPlaidTartanDto, user_id);
      return result
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

   
  @Post("add_manual_account")
  @UseGuards(AuthGuard)
  async AddManualAccountInfo(@Req() req : any, @Body() payload : ManualAccountDTO) {
      const {user_id} = req.auth     
      const result = await this.plaidTartanService.addManualAccount(user_id, payload);
      return result;
  }

  @Put("add_manual_account/:id")
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
  ){
    const {user_id} = req.auth     
    const result = await this.plaidTartanService.addManualTransaction(user_id, data);
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

  @Get("fetch_transactions/:account_id")
  @UseGuards(AuthGuard)
  async fetchTransactionsOfAccount(
    @Req() req : any,
    @Param('account_id') account_id : number,
  ){
    const {user_id} = req.auth     
    const result = await this.plaidTartanService.fetchTransactions(user_id,account_id);
    return result;
  }

  @Get("fetch_transactions/:account_id/:tId")
  @UseGuards(AuthGuard)
  async fetchTransactionOfAccount(
    @Req() req : any,
    @Param('account_id') account_id : number,
    @Param('tId') tId : number,
  ){
    const {user_id} = req.auth;    
    const result = await this.plaidTartanService.fetchTransactions(user_id,account_id, tId);
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

  @Get("get_institutions")
  async getInstitutions(
    @Req() req : any,
    @Query('cursor') cursor : string,
    @Query('pageSize') pageSize : string,
    @Query('keyword') keyword : string,
    ){
    return await this.plaidTartanService.getAllInstitutions(cursor, pageSize, keyword);
  }
  
  // Manual Banks
  @Post("fetch_user_manual_banks")
  @UseGuards(AuthGuard)
  async fetchUserManualBanks(@Req() req : any, @Body() payload : FetchUserBanks){
    const {user_id} = req.auth     
      const result = await this.plaidTartanService.fetchAllUserBanks(user_id, payload);
      return result;
  }

  @Get("fetch_all_user_banks")
  @UseGuards(AuthGuard)
  async fetchUserAllBanks(@Req() req : any){
    const {user_id} = req.auth     
      const result = await this.plaidTartanService.fetchAllUserBanks(user_id, {manual : undefined});
      return result;
  }

  @Post("add_manual_bank")
  @UseGuards(AuthGuard)
  async addManualBank(
    @Req() req : any, 
    @Body() payload : AddBankDTO
  ){
    const {user_id} = req.auth     
    return await this.plaidTartanService.addUserManualBank(user_id, payload)
  }

  @Delete("delete_manual_bank/:item_id")
  @UseGuards(AuthGuard)
  async deleteManualBank(
    @Req() req : any, 
    @Param("item_id", ParseIntPipe) item_id : number
  ){
    const {user_id} = req.auth     
    return await this.plaidTartanService.deleteManualBank(user_id, item_id)
  }
}
