import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma.service';


import { log } from 'console';
import { Budget, Collaboration, User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class BudgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService : UsersService,
    
    ) {}

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
  try{
    let foundedCollaborators : User[] = []

    let isBudgetAlreadyCreated = await this.prisma.budget.findFirst({
      where : {
        user_id : userId,
        budgets_category_id : createBudgetDto.categoryId,

      }
    })
    // Find the category ID based on the category name
    const isCategoryExists = await this.prisma.budgetCategories.findUnique({
      where : {
        id : createBudgetDto.categoryId
      }
    })

    if (!isCategoryExists) {
      throw new HttpException("Invalid Category", HttpStatus.BAD_REQUEST);
    }

    // Check start date if it is older than today's date
    const today = new Date();
    const userRequestedDate = new Date(createBudgetDto.startDate);
    if (userRequestedDate < today) {
      throw new HttpException("Start date should not be past date", HttpStatus.BAD_REQUEST);
    }

   // Create a new budget record
    let userBudget : Budget = null;
    let dataObj = {
      name: createBudgetDto.name,
      amount: createBudgetDto.amount,
      budgets_category_id: createBudgetDto.categoryId,
      start_date: new Date(createBudgetDto.startDate),
      duration: createBudgetDto.duration,
    }
  if (!isBudgetAlreadyCreated) {
    userBudget = await this.prisma.budget.create({
      data: {
        ...dataObj,
        user_id:userId
      },
    });
  }
  else{
    userBudget = await this.prisma.budget.update({
      data : dataObj,
      where : {id : isBudgetAlreadyCreated.id}
    })
  }

    

  //   if (collaborators.length > 0) {
  //     const nonExistentEmails = await this.prisma.user.findMany({
  //       where: {
  //         email: {
  //           notIn: collaborators,
  //         },
  //       },
  //     });

  //     if (nonExistentEmails.length > 0) {
  //       throw new HttpException({
  //         message : 'Emails do not exist',
  //         data : nonExistentEmails
  //       }, HttpStatus.NOT_FOUND);
  //     } 
      
  //     foundedCollaborators = await this.prisma.user.findMany({
  //       where : {
  //         email : {
  //           in : collaborators
  //         }
  //       }
  //     })
  // }


    // // Add collaborator
    // if (foundedCollaborators.length > 0) {
      
    // const user = await this.prisma.user.findUnique({
    //   where : {
    //     id : userId
    //   }
    // })
    //    foundedCollaborators.forEach(async (collaborator) => {
    //     await this.prisma.collaboration.create({
    //       data : {
    //         budget_id : userBudget.id,
    //         collaborator_id : collaborator.id,
    //         status : 'PENDING',
    //         user_id : userId
    //       }
    //     })

    //     await this.userService.sendEmail(
    //       collaborator,
    //       'Collaboration Invitation',
    //       `
    //       Hello,

    //       You have been added as a collaborator by ${user.email}.
          
    //       Thank you for collaborating!
    //       `,
    //       123,
    //     );
    //    })
    // }
     
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: `Budget ${isBudgetAlreadyCreated ? "updated" : "created"} successfully`,
      data: userBudget,
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
    const { id, name, amount, categoryId, startDate, duration, collaborators } = updateBudgetDto;
  
    // Check if the budget exists and belongs to the user
    const existingBudget = await this.prisma.budget.findFirst({
      where: { id, user_id: userId },
    });
    if (!existingBudget) {
      throw new Error(`Budget with ID '${id}' not found or unauthorized access.`);
    }
  
  try{
    // Update the budget record
    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: {
        name: name || existingBudget.name,
        amount: amount || existingBudget.amount,
        budgets_category_id: categoryId || existingBudget.budgets_category_id,
        start_date: startDate || existingBudget.start_date,      
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

  async fetchUserBudgets(userId: number){
    try {
      // Fetch all user accounts of different banks
      let allAccounts : any = await this.prisma.account.findMany({where : {user_id : userId}})

      // Check if accounts found or not
      if (allAccounts.length === 0) {
        throw new HttpException("No account found for this user", HttpStatus.NOT_FOUND);
      }

      allAccounts = allAccounts.map((acc) => acc.id);

      const allTransactions = await this.prisma.transaction.findMany({
        where : {
          account_id : {
            in : allAccounts
          }
        }
      })

      // Get all user budgets
      const userBudgets = await this.prisma.budget.findMany({
        select : {
          id : true,
          name : true,
          duration : true,
          amount : true,
          BudgetCategory : {
            select : {
              category_ids : true,
              category_name : true,
              id : true
            }
          }
        },
        where : {user_id : userId}
      });

      let resultTransactions = [];

      // Loop through all budgets and filter out the transactions as per category ids for that budgets
      userBudgets.forEach(async (budget) => {
        // Filter transactions based on current budget
        const transactions = allTransactions.filter((transaction) => 
          budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
          transaction.amount > 0
        );

        let limit = budget.amount;
        let spent =  transactions.reduce(function (sum, transaction) {
          return sum + transaction.amount;
        }, 0);
        let remaining = limit - spent

        resultTransactions.push({
          budget_name : budget.name,
          limit,
          spent,
          remaining
        })
      })     
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Budget fetched successfully',
        data: resultTransactions,
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

