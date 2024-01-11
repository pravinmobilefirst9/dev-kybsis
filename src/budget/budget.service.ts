import { Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBudgetDto: CreateBudgetDto) {
    return 'This action adds a new budget';
  }

  findAll() {
    return `This action returns all budget`;
  }

  findOne(id: number) {
    return `This action returns a #${id} budget`;
  }

  update(id: number, updateBudgetDto: CreateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
private calculateEndDate(startDate: Date, duration: 'Monthly' | 'Annually'): Date {
    const endDate = new Date(startDate);
    if (duration === 'Monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else { // 'Annually'
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }
  async addUserBudgetDetails(createBudgetDto: CreateBudgetDto, userId: number) {
    const { duration, name, category, account, amount, startDate, collaborators } = createBudgetDto;
  
    // Find the category ID based on the category name
    const categoryRecord = await this.prisma.budgetCategories.findFirst({
      where: { category_name: createBudgetDto.category },
    });
    if (!categoryRecord) {
      throw new Error(`Category with name '${category}' not found.`);
    }
  
    // Find the account ID based on the account name
    // const accountRecord = await this.prisma.institutionAccount.findUnique({
    //   where: {id: account },
    // });
    // if (!accountRecord) {
    //   throw new Error(`Account with name '${account}' not found.`);
    // }
    const endDate = this.calculateEndDate(startDate, duration);
    // Create a new budget record
    const newBudget = await this.prisma.budget.create({
      data: {
        name: createBudgetDto.name,
        amount: createBudgetDto.amount,
        budgets_category_id: categoryRecord.id,
        account_id: 123,
        start_date: createBudgetDto.startDate,
        end_date: endDate,
        set_limit: createBudgetDto.setLimit, // Assuming this is provided in CreateBudgetDto
        duration: createBudgetDto.duration,  // Assuming this is provided in CreateBudgetDto
        user_id:userId
        // ... other fields
      },
    });
    
  
    // Add logic for collaborators if needed
    // ...
  
    return newBudget;
  }
  
  
  
}
