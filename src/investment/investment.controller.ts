import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateManualInvestmentDto } from './dto/create-investment.dto';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}



  @Post("sync_investment_details")
  @UseGuards(AuthGuard)
  async syncInvestmentDetails(@Req() req : any){
    try {
      const {user_id} = req.auth     
      const result = await this.investmentService.syncInvestmentDetails(user_id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  @Post("sync_investment_holding_details")
  @UseGuards(AuthGuard)
  async syncInvestmentHoldingDetails(@Req() req : any){
      const {user_id} = req.auth     
      const result = await this.investmentService.syncInvestmentHoldingDetails(user_id);
      return result;
  }

  @Get("get_plaid_investment_data")
  @UseGuards(AuthGuard)
  async getInvestementHomePageData(@Req() req : any){
    const {user_id} = req.auth     
    const result = await this.investmentService.fetchPlaidInvestmentHomePageData(user_id);
    return result;
  }  

  @Get("get_all_investment_data")
  @UseGuards(AuthGuard)
  async getInvestementAllData(@Req() req : any){
    const {user_id} = req.auth     
    const result = await this.investmentService.fetchAllInvestmentData(user_id);
    return result;
  }  

  @Get("get_manual_investment_data")
  @UseGuards(AuthGuard)
  async getManualInvestementHomePageData(@Req() req : any){
    const {user_id} = req.auth     
    const result = await this.investmentService.fetchInvestmentManualData(user_id);
    return result;
  }  

  @Get("investment_categories")
  @UseGuards(AuthGuard)
  async getAllInvestmentCategories(){
    return await this.investmentService.fetchAllInvestmentCategories()
  }


  @Post("add_user_investment")
  @UseGuards(AuthGuard)
  async addUserInvestment(@Req() req : any, @Body() data : CreateManualInvestmentDto){
    const {user_id} = req.auth     
    const result = await this.investmentService.addUserInvestment(data, user_id);
    return result;
  }




  @Get()
  findAll() {
    return this.investmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvestmentDto: UpdateInvestmentDto) {
    return this.investmentService.update(+id, updateInvestmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentService.remove(+id);
  }
}
