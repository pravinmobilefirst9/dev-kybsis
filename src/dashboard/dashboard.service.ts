import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma.service';
import { userWidgets } from '@prisma/client';
import { AddWidget } from './dto/edit-widget.dto';
import { InvestmentService } from 'src/investment/investment.service';
import { AssetsService } from 'src/assets/assets.service';

@Injectable()
export class DashboardService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly investmentService: InvestmentService,
    private readonly assetService: AssetsService,
  ) { }

  async updateUserData (user_id : number, serviceName : string) : Promise<boolean> {
    try {
      let output = false;
      switch (serviceName) {
          case "BUDGET":
            output = await this.calculateBudgetTotalForWidgets(user_id);
            break;
          case "HOUSEHOLD":
            output = await this.calculateHouseHoldBudgetTotalForWidgets(user_id);
            break;
          case "INCOME":
            output = await this.calculateTotalIncomeAndExpense(user_id)
            break
          case "EXPENSE":
            output = await this.calculateTotalIncomeAndExpense(user_id)
            break
          case "MANUAL INVESTMENT":
            output = await this.calculateUserManaulInvestment(user_id)            
            break
          case "PLAID INVESTMENT":
            output = await this.calculateUserPlaidInvestment(user_id)            
            break
          case "TOTAL INVESTMENT":
            output = await this.calculateUserTotalInvestment(user_id)            
            break
          case "PLAID ASSETS":
            output = await this.calculateUserTotalInvestment(user_id)            
            break
          case "MANUAL ASSETS":
            output = await this.calculateUserManualAssets(user_id)            
            break
        default:
          break;
      }

      return output;
    } catch (error) {
      return false;
    }
  }


  async fetchWidgets(user_id : number, active : string){
    try {
      if (!active) {
        throw new HttpException("active Query Parameter cannot be empty", HttpStatus.NOT_ACCEPTABLE);
        
      }
      const activeArr = ["true", "false"]

      if (active && !activeArr.includes(active.toLowerCase())) {
        throw new HttpException("active Query Parameter must be either true or false", HttpStatus.NOT_ACCEPTABLE);
      }

      const user = await this.prisma.user.findUnique({where : {id : user_id}});
      const allWidgets = await this.prisma.widgets.findMany({
        select : {
          id : true,
          name : true,
          default : true,
          role : true,
        }
      });
      if (active && active === "false") {

        const userWidgets = await this.prisma.userWidgets.findMany({
          where : {
            active : true,
            user_id
          }
        })

        let widgetsToShow = allWidgets.map((w) => {
          return {
            ...w,
            selected : userWidgets.some((userWidg) => userWidg.widget_id === w.id)
          }
        })

        return {
          success : true,
          statusCode: HttpStatus.OK,
          message: `Widgets fetched successfully`,
          data: widgetsToShow,
        }
      }
      let resultObj = null;
      switch (user.user_role) {
        case "BASIC":
          // If user is basic then show only basic widgets.
          const basicWidgets = allWidgets.filter((w) => w.role === "BASIC");
          basicWidgets.forEach(async (widget) => {
            await this.updateUserData(user_id, widget.name.toUpperCase());
          })
          resultObj = await this.prisma.userWidgets.findMany({
            where : {
              user_id
            },
            select : {
              id : true,
              active : true,
              Widget : {
                select : {
                  id : true,
                  name : true,
                  role : true
                }
              },
              value : true
            }
          })     
          break;

        case "PREMIUM":
          let userWidgets : any = await this.prisma.userWidgets.findMany({
            where : {user_id, active : true},}
          );

          if (userWidgets.length === 0 && !user.widgetsAlreadyAdded) {
            const defaultWidgets = allWidgets.filter((w) => w.default === true);
            defaultWidgets.forEach(async (widget) => {
              await this.prisma.userWidgets.create({
                data : {
                  active : true,
                  value : 0,
                  widget_id : widget.id,
                  user_id : user_id
                }
              })
            })

            await this.prisma.user.update({
              data : {widgetsAlreadyAdded : true},
              where : {id : user.id}
            })
          }
          
          userWidgets = await this.prisma.userWidgets.findMany({
            where : {user_id, active : true},
            select : {
              Widget : {
                select : {
                  id : true,
                  name : true,
                  role : true
                }
              },
            }
          },
          );
          userWidgets.forEach(async (w) => {
            await this.updateUserData(user_id, w.Widget.name.toUpperCase());
          })

          resultObj = await this.prisma.userWidgets.findMany({
            where : {
              user_id,
              active : true 
            },
            select : {
              id : true,
              active : true,
              Widget : {
                select : {
                  id : true,
                  name : true,
                  role : true
                }
              },
              value : true
            }
          })  
          break;
      
        default:
          break;
      }
      
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: `Widgets fetched successfully`,
        data: resultObj
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

  async addUserWidget(user_id : number, {widgetId} : AddWidget){
    try {
      const widget = await this.prisma.widgets.findUnique({
        where : {id  :widgetId}
      })

      if (!widget) {
        throw new HttpException("Invalid widget Id", HttpStatus.BAD_REQUEST)
      }

      const isWidgetAlreadyExists = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : widgetId,
          user_id
        }
      })
      if (isWidgetAlreadyExists) {
        await this.prisma.userWidgets.updateMany({
          where : {
            widget_id : widgetId,
            user_id
          },
          data : {
            active : true
          }
        })
      }
      else{
        await this.prisma.userWidgets.create({
         data : {
           active : true,
           value : 0,
           user_id,
           widget_id : widget.id
         }
        })
      }

       return {
          success : true,
          statusCode : HttpStatus.OK,
          message : "Widget added successfully",
          data : {}
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

  async removeUserWidget(user_id : number, {widgetId} : AddWidget ){
    try {
      const userWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : widgetId,
          user_id
        }
      })

      if (!userWidget) {
        throw new HttpException("Widget not found", HttpStatus.NOT_FOUND);
      }

      await this.prisma.userWidgets.updateMany({
        data : {
          active : false
        },
        where : {
          user_id,
          widget_id : userWidget.widget_id
        }
      })

        return {
          success : true,
          statusCode : HttpStatus.OK,
          message : "Widget removed successfully",
          data : {}
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


  async calculateHouseHoldBudgetTotalForWidgets(user_id : number) : Promise<boolean>{
    try {
      const collaborativeBudgets = await this.prisma.budget.findMany({
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
          amount: true
        }
      })

      
      let collaborativeBudgetTotal = collaborativeBudgets.reduce((sum, budget) => {
        return sum + budget.amount
      }, 0)

      const budgetWidget = await this.prisma.widgets.findFirst({
        where: {
          name: "Household"
        }
      })
      if (!budgetWidget) {
        return false;
      }
      if (budgetWidget) {
        const userBudgetWidget = await this.prisma.userWidgets.findFirst({
          where: {
            widget_id: budgetWidget.id,
            user_id: user_id
          }
        })

        if (userBudgetWidget) {
          await this.prisma.userWidgets.update({
            where: { id: userBudgetWidget.id },
            data: {
              value: collaborativeBudgetTotal
            }
          })
        }
        else {
          await this.prisma.userWidgets.create({
            data: {
              value: collaborativeBudgetTotal,
              user_id,
              widget_id: budgetWidget.id,
              active: false
            }
          })
        }

      }
    } catch (error) {
      return false;
    }
  }

  async calculateBudgetTotalForWidgets(user_id: number) : Promise<boolean> {
    try {
      const yourBudgets = await this.prisma.budget.findMany({
        where: {
          user_id: user_id
        },
        select: {
          id: true,
          amount: true,
        }
      })



      let userBudgetTotal = yourBudgets.reduce((sum, budget) => {
        return sum + budget.amount
      }, 0)


      const budgetWidget = await this.prisma.widgets.findFirst({
        where: {
          name: "Budget"
        }
      })
      if (budgetWidget) {
        const userBudgetWidget = await this.prisma.userWidgets.findFirst({
          where: {
            widget_id: budgetWidget.id,
            user_id: user_id
          }
        })

        if (userBudgetWidget) {
          await this.prisma.userWidgets.update({
            where: { id: userBudgetWidget.id },
            data: {
              value: userBudgetTotal
            }
          })
        }
        else {
          await this.prisma.userWidgets.create({
            data: {
              value: userBudgetTotal,
              user_id,
              widget_id: budgetWidget.id,
              active: false
            }
          })
        }

      }
      return true
    } catch (error) {
      return false 
    }
  }

  async calculateTotalIncomeAndExpense(user_id: number) : Promise<boolean> {
    try {
      const totalUserAccounts = await this.prisma.account.findMany({
        where: {
          user_id
        },
        select: {
          id: true,
          account_name: true,
          account_id: true,
          Transaction: true
        }
      })

      // 1) Calculate all admin transactions
      let allUserTransactions: any[] = totalUserAccounts.map((acc) => {
        return { account: { name: acc.account_name, id: acc.id }, transactions: acc.Transaction }
      })

      allUserTransactions = allUserTransactions ? allUserTransactions.reduce((acc, account) => {
        return [...acc, ...account.transactions];
      }, []) : [];

      // Initialize variables to track income and expenses
      let income = 0;
      let expenses = 0;

      // Loop through transactions and categorize by positive and negative values
      allUserTransactions.forEach((transaction) => {
        if (transaction.amount > 0) {
          income += transaction.amount;
        } else {
          expenses += Math.abs(transaction.amount);
        }
      });

      const incomeWidget = await this.prisma.widgets.findFirst({where : {
        name : "Income"
      }})

      const userIncomeWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id  :incomeWidget.id,
          user_id : user_id
        }
      })

      if (userIncomeWidget) {
        await this.prisma.userWidgets.update({
          data :{
            value : income
          },
          where : {
            id : userIncomeWidget.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.create({
          data :{
            value : income,
            active: true,
            user_id,
            widget_id: incomeWidget.id
          }
        })
      }


      
      const expenseWidget = await this.prisma.widgets.findFirst({where : {
        name : "Expense"
      }})

      const userExpenseWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id  :incomeWidget.id,
          user_id : user_id
        }
      })

      if (userExpenseWidget) {
        await this.prisma.userWidgets.update({
          data :{
            value : expenses
          },
          where : {
            id : userExpenseWidget.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.create({
          data :{
            value : expenses,
            active: true,
            user_id,
            widget_id: expenseWidget.id
          }
        })
      }

      return true
    } catch (error) {
      return false
    }
  }

  async calculateUserManaulInvestment(user_id : number) : Promise<boolean> {
    try {
      const manualInvestmentWidget = await this.prisma.widgets.findFirst({
        where : {
          name : "Manual Investment"
        }
      });

      if (!manualInvestmentWidget) {
        return false;
      }

      const userManualInvestment = await this.investmentService.fetchInvestmentManualData(user_id);

      if (!userManualInvestment) {
        return false;
      }

      const userWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : manualInvestmentWidget.id,
          user_id
        }
      })

      if (!userWidget) {
        await this.prisma.userWidgets.create({
          data : {
            active : true,
            value : userManualInvestment['data']['pie_chart_data']['total_investment'] || 0,
            user_id,
            widget_id : manualInvestmentWidget.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.updateMany({
          data : {
            value : userManualInvestment['data']['pie_chart_data']['total_investment'] || 0
          },
          where : {
            user_id,
            widget_id : manualInvestmentWidget.id
          }
        })
      }
    } catch (error) {
      return false
    }
  }

  async calculateUserPlaidInvestment(user_id : number) : Promise<boolean> {
    try {
      const plaidInvestmentWidget = await this.prisma.widgets.findFirst({
        where : {
          name : "Plaid Investment"
        }
      });

      if (!plaidInvestmentWidget) {
        return false;
      }

      const userPlaidInvestment = await this.investmentService.fetchPlaidInvestmentHomePageData(user_id);

      if (!userPlaidInvestment) {
        return false;
      }

      const userWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : plaidInvestmentWidget.id,
          user_id
        }
      })

      if (!userWidget) {
        await this.prisma.userWidgets.create({
          data : {
            active : true,
            value : userPlaidInvestment['data']['total_investment'] || 0,
            user_id,
            widget_id : plaidInvestmentWidget.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.updateMany({
          data : {
            value : userPlaidInvestment['data']['total_investment'] || 0
          },
          where : {
            user_id,
            widget_id : plaidInvestmentWidget.id
          }
        })
      }
    } catch (error) {
      return false
    }
  }

  async calculateUserTotalInvestment(user_id : number) : Promise<boolean> {
    try {
      const totalInvestmentWidget = await this.prisma.widgets.findFirst({
        where : {
          name : "Total Investment"
        }
      });

      if (!totalInvestmentWidget) {
        return false;
      }

      const userTotalInvestment = await this.investmentService.fetchAllInvestmentData(user_id);

      if (!userTotalInvestment) {
        return false;
      }

      const userWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : totalInvestmentWidget.id,
          user_id
        }
      })      

      if (!userWidget) {
        await this.prisma.userWidgets.create({
          data : {
            active : true,
            value : userTotalInvestment['data']['total_investment'] || 0,
            user_id,
            widget_id : totalInvestmentWidget.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.updateMany({
          data : {
            value : userTotalInvestment['data']['total_investment'] || 0
          },
          where : {
            user_id,
            widget_id : totalInvestmentWidget.id
          }
        })
      }
    } catch (error) {
      return false
    }
  }


  async calculateUserPlaidAssets(user_id : number) : Promise<boolean> {
    try {
      const plaidAssetWidget = await this.prisma.widgets.findFirst({
        where : {
          name : "Plaid Assets"
        }
      });

      if (!plaidAssetWidget) {
        return false;
      }

      const userPlaidAssets = await this.assetService.getPlaidAssets(user_id);

      if (!userPlaidAssets) {
        return false;
      }

      const userWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : plaidAssetWidget.id,
          user_id
        }
      })  
      
      let plaidAccounts = userPlaidAssets.data.reduce((arr, asset) => {
        return [...arr, ...asset.AssetAccount]
      }, [])

      let totalBalance = plaidAccounts.reduce((sum, account) => {
        return sum += parseFloat(account.balance_current)
      }, 0)
      if (!userWidget) {
        await this.prisma.userWidgets.create({
          data : {
            active : true,
            value : totalBalance,
            user_id,
            widget_id : plaidAssetWidget.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.updateMany({
          data : {
            value : totalBalance
          },
          where : {
            user_id,
            widget_id : plaidAssetWidget.id
          }
        })
      }
    } catch (error) {
      return false
    }
  }

  async calculateUserManualAssets(user_id : number) : Promise<boolean> {
    try {
      const userManualAsset = await this.prisma.widgets.findFirst({
        where : {
          name : "Manual Assets"
        }
      });

      if (!userManualAsset) {
        return false;
      }

      const manualAssets = await this.prisma.userManualAssets.findMany({
        where : {
          user_id
        },
        select: {
          id : true
        }
      })

      let manualAssetIds = manualAssets.map((asset) => asset.id)
      
      let allFormFields = await this.prisma.userAssetsDetails.findMany({
        where : {
          asset_id : {in : manualAssetIds},
          asset_field : {
            name : "value"
          }
        },
        select: {
          value : true
        }
      })

      let total = allFormFields.reduce((sum, value) => {
        return sum += parseInt(value.value);
      }, 0)      

      const userWidget = await this.prisma.userWidgets.findFirst({
        where : {
          widget_id : userManualAsset.id,
          user_id
        }
      })  
      

      if (!userWidget) {
        await this.prisma.userWidgets.create({
          data : {
            active : true,
            value : total,
            user_id,
            widget_id : userManualAsset.id
          }
        })
      }
      else{
        await this.prisma.userWidgets.updateMany({
          data : {
            value : total
          },
          where : {
            user_id,
            widget_id : userManualAsset.id
          }
        })
      }
    } catch (error) {
      return false
    }
  }



  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
