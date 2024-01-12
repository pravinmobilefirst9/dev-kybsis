import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma.service';


import { log } from 'console';

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
    const { duration, name, categoryId, account, amount, startDate, collaborators } = createBudgetDto;
  
    // Find the category ID based on the category name
    
   
    
  
    
    const endDate = this.calculateEndDate(startDate, duration);
    // Create a new budget record
    try{
    const newBudget = await this.prisma.budget.create({
      data: {
        name: createBudgetDto.name,
        amount: createBudgetDto.amount,
        budgets_category_id: categoryId,
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
  
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'New Budget created successfully',
      data: newBudget,
    };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      error.toString(),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }
  
  async updateUserBudgetDetails(updateBudgetDto: UpdateBudgetDto, userId: number) {
    const { id, name, amount, categoryId, account, startDate, duration, setLimit, collaborators } = updateBudgetDto;
  
    // Check if the budget exists and belongs to the user
    const existingBudget = await this.prisma.budget.findFirst({
      where: { id, user_id: userId },
    });
    if (!existingBudget) {
      throw new Error(`Budget with ID '${id}' not found or unauthorized access.`);
    }
  
    // Optionally, find the category and account IDs if they need to be updated
    let categoryRecordId = existingBudget.budgets_category_id;
   
     
  
    
  
    // Calculate the end date if it needs to be updated
    const endDate = startDate && duration ? this.calculateEndDate(startDate, duration) : existingBudget.end_date;
  try{
    // Update the budget record
    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: {
        name: name || existingBudget.name,
        amount: amount || existingBudget.amount,
        budgets_category_id: categoryId,
        start_date: startDate || existingBudget.start_date,
        end_date: endDate,
        set_limit: setLimit || existingBudget.set_limit,
       
      },
    });
  
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Budget updated successfully',
      data: updatedBudget,
    };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      error.toString(),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }
  
  async getBudgetDetails(userId: number) {
   
   
    
    try {
      
      const budgets = await this.prisma.budget.findMany({
        where: { user_id: userId },
        include: {
          BudgetCategory: {
            select: {
              category_name: true, 
            },}
        },
      });
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Budget Details fetched successfully',
        data: budgets,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }




    async getBudgetCategories(userId: number) {
      try {
       
        const budgets = await this.prisma.budgetCategories.findMany({
          select: {
            id: true,
            category_name: true,
          },
        });
       
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: 'budget category fetched successfully',
          data: budgets,
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          error.toString(),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

