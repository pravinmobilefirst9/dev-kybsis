import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from 'src/guards/auth.guard';


@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}
  @Post('create-budget')
  @UseGuards(AuthGuard)
  async addBudget(
    @Req() request: any,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    const { user_id } = request.auth;
    return await this.budgetService.addUserBudgetDetails(createBudgetDto, user_id);
  }

  @Patch('update-budget')
  @UseGuards(AuthGuard)
  async updateBudget(
    @Req() request: any,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    const { user_id } = request.auth;
    return await this.budgetService.updateUserBudgetDetails(updateBudgetDto, user_id);
  }

  @Get("fetch_user_budgets")
  @UseGuards(AuthGuard)
  async fetchAllUserBudgetWithDetails(@Req() req : any){
    const { user_id } = req.auth; 
    return await this.budgetService.fetchUserBudgets(user_id); 
  }


  @Post('budget_details')
  @UseGuards(AuthGuard) 
  async getBudgetDetail(@Req() req: any) {
      const { user_id } = req.auth; 
      return await this.budgetService.getBudgetDetails(user_id);
  }

  @Post('budget_category')
  @UseGuards(AuthGuard) 
  async getBudgetCategories(@Req() req: any) {
      const { user_id } = req.auth; 
      return await this.budgetService.getBudgetCategories(user_id);
  }
}
