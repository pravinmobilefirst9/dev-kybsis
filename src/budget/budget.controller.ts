import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { InvitationStatusUpdateDTO } from './dto/set-invitation-status.dto';
import { CollaboratrTransactions } from './dto/collaborator-transactions.dto';


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

  @Get("fetch_my_budgets")
  @UseGuards(AuthGuard)
  async fetchUserBudgetWithDetails(@Req() req : any){
    const { user_id } = req.auth; 
    return await this.budgetService.fetchUserBudgets(user_id); 
  }

  @Get("fetch_budget_details/:budgetId")
  @UseGuards(AuthGuard)
  async fetchUserBudgetDetails(@Req() req : any, @Param("budgetId", ParseIntPipe) budgetId : number){
    const { user_id } = req.auth; 
    return await this.budgetService.fetchBudgetDetails(user_id, budgetId); 
  }

  @Get("fetch_collaborative_budgets")
  @UseGuards(AuthGuard)
  async fetchCollaborativeBudgetWithDetails(@Req() req : any){
    const { user_id } = req.auth; 
    return await this.budgetService.fetchCollaborativeBudget(user_id); 
  }

  @Get("fetch_budget_categories")
  @UseGuards(AuthGuard)
  async fetchBudgetCategories(){
    return await this.budgetService.fetchBudgetCategories(); 
  }

  @Post('budget_category')
  @UseGuards(AuthGuard) 
  async getBudgetCategories(@Req() req: any) {
      const { user_id } = req.auth; 
      return await this.budgetService.getBudgetCategories(user_id);
  }

  @Get("fetch_budget_collaborators/:budgetId")
  @UseGuards(AuthGuard)
  async fetchBudgetCollaborators(@Req() req : any, @Param("budgetId", ParseIntPipe) budgetId : number ) {
    const { user_id } = req.auth; 
    return await this.budgetService.fetchBudgetCollaborators(user_id, budgetId);
  }

  @Get("fetch_incoming_pending_invitations")
  @UseGuards(AuthGuard)
  async fetchIncomingCollaborativePendingRequests(@Req() req : any){
    const { user_id } = req.auth; 
    return await this.budgetService.fetchYourIncomingPendingBudgetInvitations(user_id);
  }

  @Get("fetch_outgoing_pending_invitations/:budgetId")
  @UseGuards(AuthGuard)
  async fetchOutgoingCollaborativePendingRequests(@Req() req : any, @Param("budgetId", ParseIntPipe) budgetId : number){
    const { user_id } = req.auth; 
    return await this.budgetService.fetchYourOutgoingBudgetInvitations(user_id, budgetId);
  }

  @Post("set_invitation_status_for_budget")
  @UseGuards(AuthGuard)
  async updateInvitationStatusOfUser(@Req() req : any, @Body() payload : InvitationStatusUpdateDTO){
    const { user_id } = req.auth; 
    return await this.budgetService.updateBudgetCollaborationInvitationStatus(user_id, payload);
  }

  @Post("fetch_collaborator_transactions")
  @UseGuards(AuthGuard)
  async fetchTransactionsOfCollaborators(@Req() req : any, @Body() payload : CollaboratrTransactions){
    const { user_id } = req.auth; 
    return await this.budgetService.
    fetchCollaboratorTransactions(user_id, payload);
  }

  @Post("fetch_my_transactions/:budgetId")
  @UseGuards(AuthGuard)
  async fetchMyTransactionsForBudget(@Req() req : any, @Param('budgetId', ParseIntPipe) budgetId : number){
    const { user_id } = req.auth;
    return await this.budgetService.
    fetchMyTransactions(user_id, budgetId);
  }

  @Delete("delete_collaborator/:collaborationId")
  @UseGuards(AuthGuard)
  async deleteCollaboratorFromBudget(@Req() req : any, @Param("collaborationId", ParseIntPipe) collaborationId : number) {
    const { user_id } = req.auth; 
    return await this.budgetService.removeCollaborator(user_id, collaborationId);
  }

  @Delete("delete_budget/:budgetId")
  @UseGuards(AuthGuard)
  async deleteBudget(@Req() req : any, @Param("budgetId", ParseIntPipe) budgetId : number) {
    const { user_id } = req.auth; 
    return await this.budgetService.deleteBudget(user_id, budgetId);
  }
}
