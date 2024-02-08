import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AddWidget } from './dto/edit-widget.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("fetch_widgets")
  @UseGuards(AuthGuard)
  async fetchWidgets(@Req() request : any ,@Query('active') active: string){
    const {user_id} = request.auth;
    return await this.dashboardService.fetchWidgets(user_id, active)
  }

  @Post("add_widget")
  @UseGuards(AuthGuard)
  async addUserWidget(@Body() payload : AddWidget, @Req() request : any){
    const {user_id} = request.auth;
    return await this.dashboardService.addUserWidget(user_id, payload);
  }

  @Delete("remove_widget")
  @UseGuards(AuthGuard)
  async removeWidget(@Body() payload : AddWidget, @Req() request : any){
    const {user_id} = request.auth;
    return await this.dashboardService.removeUserWidget(user_id, payload);
  }

  @Post()
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(+id);
  }
}
