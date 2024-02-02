import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma.service';


import { log } from 'console';
import { Budget, Collaboration, User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { CollaborationStatus, InvitationStatusUpdateDTO } from './dto/set-invitation-status.dto';
import { CollaboratrTransactions } from './dto/collaborator-transactions.dto';

@Injectable()
export class BudgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,

  ) { }

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


  async fetchBudgetCategories() {
    try {
      const budgetCategories = await this.prisma.budgetCategories.findMany({
        select: {
          id: true,
          category_name: true,
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Budget categories fetched successfully`,
        data: budgetCategories,
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

  async addUserBudgetDetails(createBudgetDto: CreateBudgetDto, userId: number) {
    try {
      const { collaborators, budgetId } = createBudgetDto;
      // Find the category ID based on the category name
      const isCategoryExists = await this.prisma.budgetCategories.findUnique({
        where: {
          id: createBudgetDto.categoryId
        }
      })

      const admin = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

      if (collaborators.includes(admin.email)) {
        throw new HttpException('User creating budget cannot add yourself as a collaborator', HttpStatus.NOT_ACCEPTABLE);
      }

      if (!isCategoryExists) {
        throw new HttpException("Invalid Category", HttpStatus.BAD_REQUEST);
      }

      // Check start date if it is older than today's date
      const today = new Date();

      // Split the date string into day, month, and year components
      const [day, month, year] = createBudgetDto.startDate.split("-");

      // Create a new Date object using the components
      const userRequestedDate = new Date(`${year}-${month}-${day}`);
      if (userRequestedDate < today) {
        throw new HttpException("Start date should not be past date", HttpStatus.BAD_REQUEST);
      }

      // Create or update a new budget record
      let userBudget: Budget = null;
      let dataObj = {
        name: createBudgetDto.name,
        amount: createBudgetDto.amount,
        budgets_category_id: createBudgetDto.categoryId,
        start_date: userRequestedDate,
        duration: createBudgetDto.duration,
      }
      if (!budgetId) {
        userBudget = await this.prisma.budget.create({
          data: {
            ...dataObj,
            user_id: userId
          },
        });
      }
      else {
        const budgetExists = await this.prisma.budget.findUnique({ where: { id: budgetId } })
        if (!budgetExists) {
          throw new HttpException("Invalid budget Id", HttpStatus.NOT_FOUND)
        }
        userBudget = await this.prisma.budget.update({
          data: dataObj,
          where: { id: budgetId }
        })
      }

      // Add collaborators
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      })
      // Get all already existed collaborators if any or if budget is getting updated
      const alreadyExistedCollaborators = await this.prisma.collaboration.findMany({
        where: {
          user_id: userId,
          budget_id: userBudget.id
        },
        select: {
          user: true,
          id: true,
          collaborator_id: true
        }
      })

      // Filter all collaborators which are not included into current collaborators list to remove if updating
      const collaboratorsToRemove = alreadyExistedCollaborators.filter((c) => collaborators.includes(c.user.email) === false);
      // Delete all collaborators which are not included in collaborators array if updating
      collaboratorsToRemove.forEach(async (c) => {
        await this.prisma.collaboration.delete({ where: { id: c.id } });
      })
      // Now add all fresh collaborators whether it is creating new or updating
      collaborators.forEach(async (collaborator) => {
        const existedUser = await this.prisma.user.findFirst({
          where: {
            email: collaborator
          }
        })

        if (!existedUser) {
          await this.userService.sendEmail(
            collaborator,
            'Collaboration Invitation',
            `
                Hello,

                You have been added as a collaborator by ${user.email}.
                
                Thank you for collaborating!
                `,
            0,
          );
        }
        else {
          const isCollaboratorExists = await this.prisma.collaboration.findFirst({
            where: {
              collaborator_id: existedUser.id,
              budget_id: userBudget.id,
              user_id: userId
            }
          })
          if (!isCollaboratorExists) {
            await this.prisma.collaboration.create({
              data: {
                budget_id: userBudget.id,
                collaborator_id: existedUser.id,
                status: 'PENDING',
                user_id: userId
              }
            })
          }
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: `Budget ${budgetId ? "updated" : "created"} successfully`,
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

  async fetchUserBudgets(userId: number) {
    try {
      // Get all user budgets
      const userBudgets = await this.prisma.budget.findMany({
        select: {
          id: true,
          name: true,
          duration: true,
          amount: true,
          User: {
            select: {
              account: {
                select: {
                  id: true,
                  account_id: true,
                  account_name: true,
                  Transaction: true
                }
              }
            }
          },
          BudgetCategory: {
            select: {
              category_ids: true,
              category_name: true,
              id: true
            }
          },
          collaborations: {
            select: {
              id: true,
              status: true,
              collaborator_id: true,
              collaborator: {
                select: {
                  email: true,
                  account: {
                    select: {
                      id: true,
                      account_id: true,
                      account_name: true,
                      Transaction: true
                    },
                  }
                }
              }
            },
          },
          created_at: true
        },
        where: { user_id: userId }
      });

      let resultTransactions = [];

      if (userBudgets.length === 0) {
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: 'Budgets not found',
          data: [],
        }
      }
      // Loop through all budgets and filter out the transactions as per category ids for that budgets
      userBudgets.forEach(async (budget) => {

        // 1) Calculate all admin transactions
        let allUserTransactions: any[] = budget.User.account.map((acc) => {
          return { account: { name: acc.account_name, id: acc.id }, transactions: acc.Transaction }
        })

        allUserTransactions = allUserTransactions ? allUserTransactions.reduce((acc, account) => {
          return [...acc, ...account.transactions];
        }, []) : [];


        // Filter the transactions based on category ids
        allUserTransactions = allUserTransactions.filter((transaction) =>
          budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
          transaction.amount > 0
        );
        // Sum of all transactions
        let userContri = allUserTransactions ? allUserTransactions.reduce(function (sum, transaction) {
          return sum + transaction.amount;
        }, 0) : 0

        // 2) Calculate collaborators contributions
        let allCollaboratorsTransactions: any[] = budget.collaborations ? budget.collaborations.filter((clb) => clb.status === "ACCEPTED") : [];

        // Fetch accounts first
        allCollaboratorsTransactions = allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions.reduce((acc, collaborators) => {
          return [...acc, collaborators.collaborator.account]
        }, []) : []
        // Destructre and combine all transactions of all accounts irrespective of bank
        allCollaboratorsTransactions = allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions[0].reduce((trs, account) => {
          return [...trs, ...account.Transaction]
        }, []) : []

        // Filter the transactions based on category ids
        allCollaboratorsTransactions = allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions.filter((transaction) =>
          budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
          transaction.amount > 0
        ) : [];
        // Sum of all transactions
        let collaboratorContri = allCollaboratorsTransactions.reduce(function (sum, transaction) {
          return sum + transaction.amount;
        }, 0);


        const collaborators = budget.collaborations
          // .filter((clb) => clb.status === "ACCEPTED")
          .map((collaborator) => {
            return {
              collaboration_id: collaborator.id,
              status: collaborator.status,
              collaborator_id: collaborator.collaborator_id,
              collaborator: {
                email: collaborator.collaborator.email,
                amount: collaboratorContri
              }
            }
          })

        let limit = budget.amount;
        let spent = userContri + collaboratorContri
        let remaining = limit - spent

        resultTransactions.push({
          budget_id: budget.id,
          budget_name: budget.name,
          limit,
          spent,
          remaining,
          duration: budget.duration,
          budget_category: { category_id: budget.BudgetCategory.id, category_name: budget.BudgetCategory.category_name },
          collaborators,
          created_at: budget.created_at
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

  async fetchBudgetDetails(user_id: number, budgetId: number) {
    try {
      let userContribution = {
        amount: 0,
        percentage: 0
      }
      let collaboratorsContribution = {
        amount: 0,
        percentage: 0
      }

      let resultObj = {
        limit: 0,
        spent: 0,
        remaining: 0
      }
      const budget = await this.prisma.budget.findUnique({
        where: {
          id: budgetId
        },
        select: {
          id: true,
          name: true,
          duration: true,
          amount: true,
          user_id: true,
          User: {
            select: {
              account: {
                select: {
                  id: true,
                  account_id: true,
                  account_name: true,
                  Transaction: true
                }
              }
            }
          },
          BudgetCategory: {
            select: {
              category_ids: true,
              category_name: true,
              id: true
            }
          },
          collaborations: {
            select: {
              status: true,
              collaborator_id: true,
              collaborator: {
                select: {
                  email: true,
                  account: {
                    select: {
                      id: true,
                      account_id: true,
                      account_name: true,
                      Transaction: true
                    },
                  }
                }
              }
            },
          },
          created_at: true
        },
      })

      if (!budget) {
        throw new HttpException("Budget not found", HttpStatus.NOT_FOUND)
      }

      // Check user wants to access budget details is should be either admin or collaborator
      if (budget.user_id !== user_id) {
        const collaborator = budget.collaborations.find((clb) => clb.collaborator_id === user_id)
        if (!collaborator || (collaborator && collaborator.status !== "ACCEPTED")) {
          throw new HttpException(`You are eligible to access the budget with id : ${budgetId}`,
            HttpStatus.UNAUTHORIZED
          )
        }
      }

      // 1) Calculate all admin transactions
      let allUserTransactions: any[] = budget.User.account.map((acc) => {
        return { account: { name: acc.account_name, id: acc.id }, transactions: acc.Transaction }
      }) || []
      allUserTransactions = allUserTransactions && allUserTransactions.length > 0 ? allUserTransactions.reduce((acc, account) => {
        return [...acc, ...account.transactions];
      }, []) : [];

      // Filter the transactions based on category ids
      allUserTransactions = allUserTransactions.filter((transaction) =>
        budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
        transaction.amount > 0
      ) || [];
      // Sum of all transactions
      userContribution.amount = allUserTransactions && allUserTransactions.length > 0 ? allUserTransactions.reduce(function (sum, transaction) {
        return sum + transaction.amount;
      }, 0) : 0;


      // 2) Calculate collaborators contributions
      let allCollaboratorsTransactions: any[] = budget.collaborations
        .filter((clb) => clb.status === "ACCEPTED") || [];

      // Fetch accounts first
      allCollaboratorsTransactions = allCollaboratorsTransactions && allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions.reduce((acc, collaborators) => {
        return [...acc, collaborators.collaborator.account]
      }, []) : [[]]
      // Destructre and combine all transactions of all accounts irrespective of bank
      allCollaboratorsTransactions = allCollaboratorsTransactions && allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions[0].reduce((trs, account) => {
        return [...trs, ...account.Transaction]
      }, []) : []

      // Filter the transactions based on category ids
      allCollaboratorsTransactions = allCollaboratorsTransactions.filter((transaction) =>
        budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
        transaction.amount > 0
      ) || [];
      // Sum of all transactions
      collaboratorsContribution.amount = allCollaboratorsTransactions && allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions.reduce(function (sum, transaction) {
        return sum + transaction.amount;
      }, 0) : 0;

      // Calculate combined spent amount

      let userContri: number = allUserTransactions && allUserTransactions.length > 0 ? allUserTransactions.reduce(function (sum, transaction) {
        return sum + transaction.amount;
      }, 0) : 0;

      let contrubutersContri: number = allCollaboratorsTransactions && allCollaboratorsTransactions.length > 0 ? allCollaboratorsTransactions.reduce(function (sum, transaction) {
        return sum + transaction.amount;
      }, 0) : 0;

      resultObj.limit = parseFloat(budget.amount.toFixed(2));
      resultObj.spent = parseFloat((contrubutersContri + userContri).toFixed(2));
      resultObj.remaining = parseFloat((resultObj.limit - resultObj.spent).toFixed(2));

      // Calculate percentages for user and collaboration contributions
      userContribution.percentage = Math.ceil((userContribution.amount / resultObj.spent) * 100);
      userContribution.amount = parseFloat(userContribution.amount.toFixed(2))
      collaboratorsContribution.percentage = Math.ceil((collaboratorsContribution.amount / resultObj.spent) * 100);
      collaboratorsContribution.amount = parseFloat(collaboratorsContribution.amount.toFixed(2))
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Budget details fetched successfully',
        data: {
          ...resultObj,
          userContribution,
          collaboratorsContribution
        },
      }

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

  async fetchCollaborativeBudget(user_id: number) {
    try {
      // Fetch the budgets where current user is as a collaborator
      let budgets = await this.prisma.budget.findMany({
        where: {
          collaborations: {
            some: {
              collaborator_id: user_id,
              status: "ACCEPTED"
            }
          }
        },
        select: {
          id: true,
          name: true,
          duration: true,
          amount: true,
          User: {
            select: {
              account: {
                select: {
                  id: true,
                  account_id: true,
                  account_name: true,
                  Transaction: true
                }
              }
            }
          },
          BudgetCategory: {
            select: {
              category_ids: true,
              category_name: true,
              id: true
            }
          },
          collaborations: {
            select: {
              id: true,
              status: true,
              collaborator_id: true,
              collaborator: {
                select: {
                  email: true,
                  account: {
                    select: {
                      id: true,
                      account_id: true,
                      account_name: true,
                      Transaction: true
                    },
                  }
                }
              }
            },
          },
          created_at: true
        },
      });

      let resultArr = []
      // Loop through all budgets and fetch all transactions
      budgets.forEach(async (budget) => {
        // First of all fetch User transactions who has created this budget
        let allUserTransactions: any[] = budget.User.account.map((acc) => {
          return { account: { name: acc.account_name, id: acc.id }, transactions: acc.Transaction }
        })
        allUserTransactions = allUserTransactions.reduce((acc, account) => {
          return [...acc, ...account.transactions];
        }, []);

        // Filter the transactions based on category ids
        allUserTransactions = allUserTransactions.filter((transaction) =>
          budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
          transaction.amount > 0
        );

        // Fetch all the transactions of collaborators
        let allCollaboratorsTransactions: any[] = budget.collaborations.filter((clb) => clb.status === "ACCEPTED")

        allCollaboratorsTransactions = allCollaboratorsTransactions.reduce((acc, collaborators) => {
          return [...acc, collaborators.collaborator.account]
        }, [])

        allCollaboratorsTransactions = allCollaboratorsTransactions[0].reduce((trs, account) => {
          return [...trs, ...account.Transaction]
        }, [])

        // Filter the transactions based on category ids
        allCollaboratorsTransactions = allCollaboratorsTransactions.filter((transaction) =>
          budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
          transaction.amount > 0
        );

        let userContri = allUserTransactions.reduce(function (sum, transaction) {
          return sum + transaction.amount;
        }, 0);

        let contrubutersContri = allCollaboratorsTransactions.reduce(function (sum, transaction) {
          return sum + transaction.amount;
        }, 0);
        // let allTransactions = [...allUserTransactions, ...allCollaboratorsTransactions]

        // Date Wise transactions filter 
        // Filter transactions based on current budget
        const totalSpent = userContri + contrubutersContri

        let limit = budget.amount;
        let spent = totalSpent
        let remaining = limit - spent


        const collaborators = budget.collaborations.filter((clb) => clb.status === "ACCEPTED").map((collaborator) => {
          return {
            status: collaborator.status,
            collaborator_id: collaborator.collaborator_id,
            collaborator: {
              email: collaborator.collaborator.email,
            }
          }
        })

        const yourCollaboration = budget.collaborations.find((clb) => clb.collaborator_id === user_id)

        resultArr.push({
          budget_id: budget.id,
          budget_name: budget.name,
          limit,
          spent,
          remaining,
          collaborators,
          yourCollaboration: {
            id: yourCollaboration.id,
            status: yourCollaboration.status,
            collaborator_id: yourCollaboration.collaborator_id,
            collaborator: {
              email: yourCollaboration.collaborator.email
            }
          }
        })
      })
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Collaborative budgets fetched successfully',
        data: resultArr,
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

  async fetchBudgetCollaborators(user_id: number, budgetId: number) {
    try {
      if (!budgetId) {
        throw new HttpException("Budget Id not found", HttpStatus.BAD_REQUEST)
      }

      const budget = await this.prisma.budget.findUnique({
        where: { id: budgetId }
      })

      if (!budget) {
        throw new HttpException("Budget not found", HttpStatus.NOT_FOUND)
      }
      const collaborators = await this.prisma.collaboration.findMany({
        where: {
          budget_id: budgetId,
          status: "ACCEPTED",
        },
        select: {
          id: true,
          collaborator_id: true,
          collaborator: { select: { email: true } },
          status: true
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Collaborators fetched successfully',
        data: collaborators,
      }
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

  // Incoming invitations
  async fetchYourIncomingPendingBudgetInvitations(user_id: number) {
    try {
      const pendingRequests = await this.prisma.collaboration.findMany({
        where: {
          collaborator_id: user_id,
          status: "PENDING"
        },
        select: {
          id: true,
          collaborator_id: true,
          status: true,
          user: {
            select: {
              email: true,
            }
          },
          budget: {
            select: {
              id: true,
              name: true,
              amount: true,
              duration: true,
            }
          }
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Incoming budget collaboration requests fetched successfully',
        data: pendingRequests,
      }

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

  // Outgoing Invitations
  async fetchYourOutgoingBudgetInvitations(user_id: number, budgetId: number) {
    try {
      const collaborations = await this.prisma.collaboration.findMany({
        where: {
          user_id,
          budget_id: budgetId,
          status: { not: "ACCEPTED" }
        },
        select: {
          id: true,
          collaborator_id: true,
          status: true,
          user: {
            select: {
              email: true,
            }
          },
          collaborator: {
            select: {
              email: true
            }
          },
          budget: {
            select: {
              id: true,
              name: true,
              amount: true,
              duration: true,
            }
          }
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Collaborators fetched successfully',
        data: collaborations,
      }
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

  async updateBudgetCollaborationInvitationStatus(user_id: number, { requestId, status }: InvitationStatusUpdateDTO) {
    try {
      if (status === CollaborationStatus.PENDING) {
        throw new HttpException("Status PENDING is not accpetable", HttpStatus.NOT_ACCEPTABLE);
      }
      const isCollaboratorExists = await this.prisma.collaboration.findUnique({
        select: {
          status: true,
          collaborator_id: true,
          user_id: true,
          budget_id: true
        },
        where: {
          id: requestId,
          collaborator_id: user_id,
        }
      })

      if (!isCollaboratorExists) {
        throw new HttpException(`Invalid request. Collaboration not found`, HttpStatus.BAD_REQUEST)
      }

      if (isCollaboratorExists.status === "ACCEPTED") {
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: `You have already accpted the invitation with budget Id : ${isCollaboratorExists.budget_id}`,
          data: {},
        }
      }
      if (isCollaboratorExists.status === "REJECTED") {
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: `You have already rejected the invitation with budget Id : ${isCollaboratorExists.budget_id}`,
          data: {},
        }
      }

      const budget = await this.prisma.budget.findUnique({
        where: { id: isCollaboratorExists.budget_id }
      })

      if (!budget) {
        throw new HttpException("Budget not found for this request", HttpStatus.NOT_FOUND)
      }

      const collaboration = await this.prisma.collaboration.update({
        where: { id: requestId },
        data: {
          status: status === CollaborationStatus.ACCEPTED ? "ACCEPTED"
            :
            status === CollaborationStatus.REJECTED ? "REJECTED"
              :
              "PENDING"
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Invitation status changed to ${status}`,
        data: {},
      }

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

  async removeCollaborator(user_id: number, collaborationId: number) {
    try {
      const collaborator = await this.prisma.collaboration.findUnique({
        where: { id: collaborationId }
      })

      if (!collaborator) {
        throw new HttpException("Collaboration not found", HttpStatus.NOT_FOUND)
      }

      // if user_id is equals collaborator id it means collaborator is leaving the budget
      // Id user_id equals to collaborator.user_id means admin is removing the collborator
      // Else it is a unauthorised access
      if (!(collaborator.collaborator_id === user_id || collaborator.user_id === user_id)) {
        throw new HttpException("Unauthorised", HttpStatus.UNAUTHORIZED)
      }

      await this.prisma.collaboration.delete({
        where: {
          id: collaborationId
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Collaboration deleted`,
        data: {},
      }
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

  async deleteBudget(user_id: number, budgetId: number) {
    try {
      const budget = await this.prisma.budget.findUnique({
        where: {
          id: budgetId
        }
      })

      if (!budget) {
        throw new HttpException("Budget not found", HttpStatus.NOT_FOUND)
      }

      if (budget.user_id !== user_id) {
        throw new HttpException("Only admin of budget can delete budget", HttpStatus.NOT_ACCEPTABLE);
      }

      // Delete all collaborators first
      const collaborators = await this.prisma.collaboration.findMany({
        where: {
          budget_id: budget.id
        }
      })
      if (collaborators.length > 0) {
        await this.prisma.collaboration.deleteMany({
          where: {
            budget_id: budget.id
          }
        })
      }

      // Delete budget
      await this.prisma.budget.delete({
        where: { id: budget.id }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Budget deleted successfully`,
        data: {},
      }

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

  async fetchCollaboratorTransactions(user_id: number, { budgetId, collaboratorId }: CollaboratrTransactions) {
    try {
      const collaboration = await this.prisma.collaboration.findFirst({
        where: {
          budget_id: budgetId,
          collaborator_id: collaboratorId
        },
        select: {
          id: true,
          collaborator_id: true,
          budget_id: true,
          status: true,
          budget: {
            select: {
              BudgetCategory: {
                select: {
                  category_ids: true
                }
              }
            }
          }
        }
      })


      if (!collaboration) {
        throw new HttpException("Collaborator not found for this budget", HttpStatus.NOT_FOUND);
      }

      if (collaboration.status !== "ACCEPTED") {
        throw new HttpException("Collaborator is not added to the budget", HttpStatus.NOT_FOUND);
      }

      let collaboratorsTransactions: any[] = await this.prisma.account.findMany({
        where: {
          user_id: collaboration.collaborator_id
        },
        select: {
          Transaction: true
        }
      })

      // Combine all the transactions
      collaboratorsTransactions = collaboratorsTransactions.reduce((transactions, trs) => {
        return [...transactions, ...trs.Transaction]
      }, [])

      // Filter out all the transactions
      collaboratorsTransactions = collaboratorsTransactions.filter((transaction) =>
        collaboration.budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
        transaction.amount > 0
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Transactions fetched successfully!`,
        data: collaboratorsTransactions,
      }

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

  async fetchMyTransactions(user_id: number, budgetId: number) {
    try {
      if (!budgetId) {
        throw new HttpException("Budget id not found", HttpStatus.BAD_REQUEST)
      }
      const budget = await this.prisma.budget.findUnique({
        where: {
          id: budgetId,
        },
        select: {
          id: true,
          user_id: true,
          BudgetCategory: {
            select: {
              category_ids: true
            }
          },
          collaborations: true
        }
      })

      if (!budget) {
        throw new HttpException(`Budget not found associated with user id : ${user_id}`, HttpStatus.NOT_FOUND);
      }
      // Check user wants to access budget details is should be either admin or collaborator
      if (budget.user_id !== user_id) {
        const collaborator = budget.collaborations.find((clb) => clb.collaborator_id === user_id)
        if (!collaborator || (collaborator && collaborator.status !== "ACCEPTED")) {
          throw new HttpException(`You are eligible to access the budget with id : ${budgetId}`,
            HttpStatus.UNAUTHORIZED
          )
        }
      }
      const accountsOfCurrentUser = await this.prisma.account.findMany({
        where: {
          user_id
        },
        select: {
          id: true,
          Transaction: true
        }
      })

      // Combine all the transactions
      let transactions = accountsOfCurrentUser.reduce((transactions, trs) => {
        return [...transactions, ...trs.Transaction]
      }, [])

      // Filter out all the transactions
      transactions = transactions.filter((transaction) =>
        budget.BudgetCategory.category_ids.includes(transaction.category_id) === true &&
        transaction.amount > 0
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Transactions fetched successfully!`,
        data: transactions,
      }
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

