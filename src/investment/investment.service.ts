import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateManualInvestmentDto } from './dto/create-investment.dto';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InvestmentService {
  constructor(
    private readonly prisma: PrismaService,
    private transactionService: TransactionService,
    private eventEmitter : EventEmitter2,

  ) { }

  async manualInvestmentUpdated(user_id: number) {
    const allManualInvestments = await this.prisma.manualInvestments.findMany({
      where: {
        user_id
      },
      select: {
        id: true,
        investmentCategory: {
          select: {
            id: true,
            name: true,
            fields: true
          }
        },
        account_id: true,
        Institution: {
          select: {
            ins_id: true,
            ins_name: true
          }
        },
        data: true,
        created_at: true
      }
    })

    const { total_investment } = await this.totalOfManualInvestment(allManualInvestments);

    // Create a date of first day of month to have consistency
    const now = new Date();
    const firstDayOfMonth = await this.setToFirstDayOfMonth(new Date(now))
    const investmentTotal = await this.prisma.totalInvestments.findFirst({
      where: {
        userId: user_id,
        monthYear: firstDayOfMonth
      }
    })

    if (investmentTotal) {
      await this.prisma.totalInvestments.updateMany({
        where: { userId: user_id, monthYear: firstDayOfMonth },
        data: { totalManualInvestment: total_investment }
      })
    }
    else {
      await this.prisma.totalInvestments.create({
        data: {
          userId: user_id,
          totalPlaidInvestment: 0,
          totalManualInvestment: total_investment,
          monthYear: firstDayOfMonth,
        }
      })
    }
  }
  async syncInvestmentDetails(user_id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!existingUser) {
      return {
        status: 'failure',
        data: { message: 'User not found' },
      };
    }

    const plaid_items = await this.prisma.plaidItem.findMany({
      where: { user_id: existingUser.id },
    });

    if (!plaid_items || plaid_items.length === 0) {
      return {
        status: 'failure',
        data: { message: 'Access token not found ' },
      };
    }

    let resultArray = [];
    for (const itemData of plaid_items) {
      const investmentData = await this.transactionService.getInvestmentDetails(
        itemData,
        user_id,
      );

      if (investmentData.status === 'failure') {
        throw new HttpException(
          investmentData.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const { accounts, item, investment_transactions, securities } =
        investmentData.data;

      for (const account of accounts) {
        let existingAccount = await this.prisma.investmentAccounts.findFirst({
          where: {
            account_id: account.account_id,
            user_id: user_id,
          },
        });

        const currentTime = new Date();
        const dataObj = {
          plaidItem: { connect: { id: itemData.id } },
          account_name: account.name,
          account_id: account.account_id,
          official_name: account.official_name || '--',
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          verification_status: 'verified', // Adjust as per your requirements
          // Timestamps
          created_at: currentTime,
          updated_at: currentTime,
          User: { connect: { id: user_id } },
          available_balance: account.balances.available || 0,
          current_balance: account.balances.current || 0,
          iso_currency_code: account.balances.iso_currency_code || 'USD',
        }
        if (!existingAccount) {
          // If account is not exists the create new one with balance
          existingAccount = await this.prisma.investmentAccounts.create({
            data: dataObj,
          });
        } else {
          existingAccount = await this.prisma.investmentAccounts.update({
            data: dataObj,
            where : {id : existingAccount.id}
          });
        }

        // Save the investment transactions
        // await this.prisma.investmentTransactions.createMany({
        //   skipDuplicates: true,
        //   data: investment_transactions
        //     .filter(
        //       (transaction: any) =>
        //         transaction.account_id === account.account_id,
        //     )
        //     .map((transaction: any) => ({
        //       account_id: existingAccount.id,
        //       cancel_transaction_id: transaction.cancel_transaction_id,
        //       amount: transaction.amount,
        //       date_of_transaction: new Date(transaction.date),
        //       fees: transaction.fees,
        //       investment_transaction_id: transaction.investment_transaction_id,
        //       iso_currency_code: transaction.iso_currency_code,
        //       name: transaction.name,
        //       price: transaction.price,
        //       quantity: transaction.quantity,
        //       security_id: transaction.security_id,
        //       subtype: transaction.subtype,
        //       type: transaction.type,
        //       unofficial_currency_code: transaction.unofficial_currency_code,
        //       platform: transaction.platform,
        //     })),
        // });

        resultArray.push({
          account_id: account.account_id,
          transactions: investment_transactions.length,
          item_id: item.id,
        });
      }

      // Save the investment Securities
      await this.prisma.investmentSecurity.createMany({
        skipDuplicates: true,
        data: securities
          .map((security: any) => ({
            security_id: security.security_id,
            close_price: security.close_price,
            close_price_as_of: new Date(security.close_price_as_of),
            cusip: security.cusip,
            institution_id: security.institution_id,
            institution_security_id: security.institution_security_id,
            is_cash_equivalent: security.is_cash_equivalent,
            isin: security.isin,
            iso_currency_code: security.iso_currency_code,
            market_identifier_code: security.market_identifier_code,
            name: security.name,
            option_contract: security.option_contract,
            proxy_security_id: security.proxy_security_id,
            sedol: security.sedol,
            ticker_symbol: security.ticker_symbol,
            type: security.type,
            unofficial_currency_code: security.unofficial_currency_code,
            update_datetime: new Date(security.update_datetime),
          })),
      });
    }

    return {
      message: 'Investment details, securities, accounts are sync successfully',
      success: true,
      statusCode: HttpStatus.OK,
      data: {},
    };
  }

  async syncInvestmentHoldingDetails(user_id: number) {
    try {
      // Get access tokens of that users
      const plaid_items = await this.prisma.plaidItem.findMany({
        where: { user_id },
      });

      if (!plaid_items || plaid_items.length === 0) {
        return {
          status: 'failure',
          data: { message: 'Access token not found ' },
        };
      }
      let resultArray = [];
      let holdingsArr = []

      // Create a promise to fetch all the data
      const promises = plaid_items.map(async (itemData) => {
        try {
          const investmentholdingData = await this.transactionService.getInvestmentHoldings(
            itemData.access_token
          );
          const { holdings, securities, accounts } = investmentholdingData.data
          
          let invHoldings = holdings ? holdings : []
          let invSecurities = securities ? securities : []
          let invAccounts = accounts ? accounts : []
          return {holdings : invHoldings, securities : invSecurities, accounts : invAccounts, itemData }
        } catch (error) {
          console.error("Investment Fetching error :",{error})
        }
      })

      let resultArr = await Promise.all(promises);
      let investmentSecurityCount = 0;
      
      resultArr = resultArr.filter((result) => result !== undefined)
      
      resultArr.map(async (data) => {
        let holdings = data['holdings'] ? data['holdings'] : []
        let accounts = data['accounts'] ? data['accounts'] : []
        let securities = data['securities'] ? data['securities'] :  []
        let itemData = data['itemData'] ? data['itemData'] : null

        resultArray.push({accounts, holdings, securities})
        accounts = accounts.filter((acc) => acc !== undefined)
        holdings = holdings.filter((acc) => acc !== undefined)
        securities = securities.filter((acc) => acc !== undefined)
        
        // Save the investment Securities
        holdingsArr = [...holdingsArr, ...holdings]
        if (investmentSecurityCount === 0) {
          await this.prisma.investmentSecurity.createMany({
            skipDuplicates: true,
            data: securities
              .map((security: any) => ({
                security_id: security.security_id,
                close_price: security.close_price,
                close_price_as_of: new Date(security.close_price_as_of),
                cusip: security.cusip,
                institution_id: security.institution_id,
                institution_security_id: security.institution_security_id,
                is_cash_equivalent: security.is_cash_equivalent,
                isin: security.isin,
                iso_currency_code: security.iso_currency_code,
                market_identifier_code: security.market_identifier_code,
                name: security.name,
                option_contract: security.option_contract,
                proxy_security_id: security.proxy_security_id,
                sedol: security.sedol,
                ticker_symbol: security.ticker_symbol,
                type: security.type,
                unofficial_currency_code: security.unofficial_currency_code,
                update_datetime: new Date(security.update_datetime),
              })),
          });
          investmentSecurityCount++;
        }


        for (const account of accounts) {
          let existingAccount = await this.prisma.investmentAccounts.findFirst({
            where: {
              account_id: account.account_id,
              user_id: user_id,
            },
          });

          const currentTime = new Date();

          const dataObj = {
            plaidItem: { connect: { id: itemData.id } },
            account_name: account?.name,
            account_id: account?.account_id,
            official_name: account?.official_name || '--',
            mask: account?.mask,
            type: account?.type,
            subtype: account?.subtype,
            verification_status: 'verified', // Adjust as per your requirements
            created_at: currentTime,
            updated_at: currentTime,
            User: { connect: { id: user_id } },
            available_balance: account?.balances?.available || 0,
            current_balance: account?.balances?.current || 0,
            iso_currency_code: account?.balances?.iso_currency_code || 'USD',
          }
          if (!existingAccount) {
            // If account is not exists the create new one with balance
            existingAccount = await this.prisma.investmentAccounts.create({
              data: dataObj,
            });
          } else {
            existingAccount = await this.prisma.investmentAccounts.update({
              data: dataObj,
              where : {id : existingAccount.id}
            });
          }

          // Save security holdings
          const holdingsOfAccount = holdings.filter((hld: any) => hld.account_id === account.account_id)
          for (const holding of holdingsOfAccount) {
            const isHoldingExists = await this.prisma.investmentHolding.findFirst({
              where: {
                account_id: holding.account_id,
                security_id: holding.security_id
              }
            });

            const security = await this.prisma.investmentSecurity.findUnique({
              where : {
                security_id : holding.security_id
              }
            })
              
            if (isHoldingExists) {               
              await this.prisma.investmentHolding.update({
                data: {
                  cost_basis: holding.cost_basis,
                  institution_price: holding.institution_price,
                  institution_value: holding.institution_value,
                  quantity: holding.quantity,
                  institution_price_as_of: holding.institution_price_as_of ? new Date(holding.institution_price_as_of) : null,
                  institution_price_datetime: holding.institution_price_datetime ? new Date(holding.institution_price_datetime) : null,
                },
                where: { id: isHoldingExists.id }
              })
            }
            else {
              await this.prisma.investmentHolding.create({
                data: {
                  cost_basis: holding.cost_basis,
                  institution_price: holding.institution_price,
                  institution_value: holding.institution_value,
                  iso_currency_code: holding.iso_currency_code,
                  quantity: holding.quantity,
                  unofficial_currency_code: holding.unofficial_currency_code,
                  institution_price_as_of: holding.institution_price_as_of ? new Date(holding.institution_price_as_of) : null,
                  institution_price_datetime: holding.institution_price_datetime ? new Date(holding.institution_price_datetime) : null,
                  investment_account : {connect : {account_id : existingAccount.account_id}},
                  investment_security : {connect : {security_id : security.security_id}}
                }
              })
            }
          }          
        }
      })

    // Calculate total investment, profit, and loss
    let totalInvestment = 0;
    
    holdingsArr.map((holding) => {
      const market_value = holding.institution_value || 0;
      totalInvestment += market_value
    });    

    // Create a date of first day of month to have consistency
    const now = new Date();
    const firstDayOfMonth = await this.setToFirstDayOfMonth(new Date(now))
    const investmentTotal = await this.prisma.totalInvestments.findFirst({
      where: {
        userId: user_id,
        monthYear: firstDayOfMonth
      }
    })

    if (investmentTotal) {
      await this.prisma.totalInvestments.updateMany({
        where: { userId: user_id, monthYear: firstDayOfMonth },
        data: { totalPlaidInvestment : totalInvestment }
      })
    }
    else {
      await this.prisma.totalInvestments.create({
        data: {
          userId: user_id,
          totalPlaidInvestment: totalInvestment,
          totalManualInvestment : 0,
          monthYear: firstDayOfMonth,
        }
      })
    }

      return {
        message: 'Investment holdings are sync successfully',
        success: true,
        statusCode: HttpStatus.OK,
        data: resultArray,
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async setToFirstDayOfMonth(date: Date): Promise<Date> {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth(); // getUTCMonth() returns the month (0-11), in UTC

    // Create a new Date object set to the first day of the given month at 00:00 hours, in UTC
    return new Date(Date.UTC(year, month, 1, 0, 0, 0));
  }



  async fetchPlaidInvestmentHomePageData(user_id: number) {
    try {
      /*
        holding : No of shares purchased by user
        securities : Global shares available to all users with their current market value
        Notes : 
          1) holdings can contain duplicate security values when user has purchased same security
              from multiple accounts.

          If an institution changes, it doesn't necessarily mean that the security ID
           will remain the same. Security IDs are generally unique to the specific institution's 
           implementation of the Plaid API. If an institution changes or if you're working
           with data from different institutions, 
          you may encounter different security IDs for the same financial instrument.
      */
      // Fetch all investment data of user with its holdings
      let investmentData: any = await this.prisma.investmentAccounts.findMany({
        where: { user_id },
        select: {
          account_id: true,
          id: true,
          investmentHolding: { include: { investment_security: true } },
          account_name: true,
          plaidItem: true,
          created_at : true
        },
      })

      investmentData = investmentData.filter((acc: any) => acc.investmentHolding.length > 0)

      if (investmentData.length === 0) {
        throw new HttpException("Investment data not found", HttpStatus.NOT_FOUND)
      }
      // Calculate total investment, profit, and loss
      let totalInvestment = 0;
      let totalProfit = 0;
      let totalLoss = 0;
      
      investmentData.map((account) => {
        account.investmentHolding.map((holding) => {
          // value = current investment market value * no of quantity held by user
          const value = holding.institution_value || 0;
          // cost basis = user has spend money for 1 share
          const costBasis = holding.cost_basis || 0;
          // quantity = no of shares holding by users
          const quantity = holding.quantity;
          // current investment value - user cost basis * quantity
          const profitLoss = (value) - (costBasis * quantity);
          
          totalInvestment += costBasis * quantity;
          if (profitLoss > 0) {
            totalProfit += profitLoss;
          } else {
            totalLoss += Math.abs(profitLoss);
          }
        });
      });

      // Calculate profit and loss percentages
      let totalValue = totalInvestment + totalProfit - totalLoss;
      let profitPercentage = (totalProfit / totalValue) * 100;
      let lossPercentage = (totalLoss / totalValue) * 100;
      let totalHoldings = []
      let totalSecurities = []
      let resultSecurityData = []
      // Format pie chart data

      totalInvestment = parseFloat(totalInvestment.toFixed(2));
      profitPercentage = Math.ceil(profitPercentage)
      lossPercentage = Math.ceil(lossPercentage)

      const pieChartData = {
        total_investment : totalInvestment,
        profitPercentage,
        lossPercentage
      }
     

      investmentData.map((account) => {
        totalHoldings = [...totalHoldings, ...account.investmentHolding]
      });

      // total securities held by users
      totalHoldings.map((hld) => !totalSecurities.includes(hld.security_id) && totalSecurities.push(hld.security_id))

      // Calulate profit loss total investment and their percentage for each security held by user
      totalSecurities.map((security) => {
        const allHoldings = totalHoldings.filter((hld) => hld.security_id === security);

        let totalInvestment = 0
        let totalProfit = 0;
        let totalLoss = 0;
        let value = 0
        let quantity = 0;
        let costBasis = 0
        let market_value = 0
        let total_quantity = 0
        let portfolio_value = 0
        allHoldings.forEach((holding) => {
          value = holding.institution_value || 0;
          market_value = holding.institution_price
          costBasis = holding.cost_basis || 0;
          quantity = holding.quantity;
          const profitLoss = (value) - (costBasis * quantity);
          total_quantity += quantity
          totalInvestment += (costBasis * quantity);
          if (profitLoss > 0) {
            totalProfit += profitLoss;
          } else {
            totalLoss += Math.abs(profitLoss);
          }
        });
        
        // Convert all values to 2 decimal : ex. 2.34
        totalInvestment = parseFloat(totalInvestment.toFixed(2))
        market_value = parseFloat(market_value.toFixed(2))
        portfolio_value = parseFloat((market_value * total_quantity).toFixed(2))
        totalProfit = parseFloat(totalProfit.toFixed(2))
        totalLoss = parseFloat(totalLoss.toFixed(2))
        total_quantity = parseFloat(total_quantity.toFixed(2))
        let growth_percentage = 25
        const obj = {
          security_id: security,
          name: allHoldings[0].investment_security.name,
          totalInvestment,
          market_value,
          total_quantity,
          totalProfit,
          totalLoss : -totalLoss,
          growth_percentage,
          portfolio_value,
        }

        resultSecurityData.push(obj)

      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Plaid investment data fetched succssfully",
        data: {
          total_investment: parseFloat(totalInvestment.toFixed(3)),
          profit_percentage: parseFloat(profitPercentage.toFixed(3)),
          profit_amount: parseFloat(totalProfit.toFixed(3)),
          loss_percentage: parseFloat(lossPercentage.toFixed(3)),
          loss_amount: parseFloat(totalLoss.toFixed(3)),
          pie_chart_data: pieChartData,
          resultSecurityData,
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async fetchAllInvestmentData(user_id : number){
    try {
      const plaidData = await this.fetchPlaidInvestmentHomePageData(user_id)
      const manualInvestmentData = await this.fetchInvestmentManualData(user_id)
      

      let resultObj = {
        total_investment : plaidData.data.total_investment + manualInvestmentData.data.pie_chart_data.total_investment,
        profitPercentage : plaidData.data.pie_chart_data.profitPercentage + manualInvestmentData.data.pie_chart_data.profitPercentage,
        lossPercentage : plaidData.data.pie_chart_data.lossPercentage + manualInvestmentData.data.pie_chart_data.lossPercentage,
        allInvestments :  [...plaidData.data.resultSecurityData, ...manualInvestmentData.data.allInvestmentResult]
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: "All investment data fetched succssfully",
        data : resultObj
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async totalOfManualInvestment(investments : any[]) {
      // Calculate total investment, profit, and loss
      let total_investment = 0;
      let totalProfit = 0;
      let totalLoss = 0;
      let investmentsResult = []
      let value : any = 0;
      investments.map((investment) => {
        switch (investment.investmentCategory.name) {
          case "Annuity":
            value = investment.data.find((data) => data['name'] === "ending_account_value")['value'];
            total_investment += parseFloat(value);
            investmentsResult.push({
              ...investment,
              portfolio_value : parseFloat(value.toFixed(2))
            })
            break;
        
          case "Cash & Money Market":
            value = investment.data.find((data) => data['name'] === "market_value")['value'];
            total_investment += parseFloat(value);
            investmentsResult.push({
              ...investment,
              portfolio_value : parseFloat(value.toFixed(2))
            })
            break;

          case "Equity/ETF":
            let market_price = parseFloat(investment.data.find((data) => data['name'] === "market_price_(per_share)")['value'])
            let total_quantity = parseFloat(investment.data.find((data) => data['name'] === "quantity")['value'])
            total_investment += market_price * total_quantity;
            let userPurchasePrice = parseFloat(investment.data.find((data) => data['name'] === "purchase_price_(per_share)")['value']);
            let profitLoss = (market_price * total_quantity) - (userPurchasePrice * total_quantity)
            let cost_basis = userPurchasePrice * total_quantity;
            let name = investment.investmentCategory.name

            market_price = parseFloat(market_price.toFixed(2))
            userPurchasePrice = parseFloat(userPurchasePrice.toFixed(2))
            total_quantity = parseFloat(total_quantity.toFixed(2))
            profitLoss = parseFloat(profitLoss.toFixed(2))
            let portfolio_value = market_price * total_quantity

            let profitLossObj = {
              totalProfit : 0,
              totalLoss : 0
            }
            let profitLossPercentage = Math.ceil((Math.abs(profitLoss) / cost_basis) * 100)
            let growth_percentage = 25

            if (profitLoss > 0) {
              totalProfit += profitLoss;
              profitLossObj.totalProfit = profitLoss;
            } else {
              totalLoss += Math.abs(profitLoss);   
              profitLossObj.totalLoss = profitLoss;       
            }

            investmentsResult.push({
              ...investment,
              growth_percentage,
              market_price,
              totalInvestment : parseFloat(cost_basis.toFixed(2)),
              total_quantity,
              name,
              ...profitLossObj,
              portfolio_value : parseFloat(portfolio_value.toFixed(2)),
              profitLossPercentage,
              created_at : investment.created_at
            })
            break;
          
          case "Hedge Fund" || "Private Equity":
            value = investment.data.find((data) => data['name'] === "value")['value'];
            total_investment += parseFloat(value);
            investmentsResult.push({
              ...investment,
              portfolio_value : parseFloat(value.toFixed(2))
            })
          break;

          case "Life Insurance":
            value = investment.data.find((data) => data['name'] === "cash_value")['value'];
            total_investment += parseFloat(value.toFixed(2));
            investmentsResult.push({
              ...investment,
              portfolio_value : parseFloat(value)
            })
          break;

          case "Mutual Fund" || "Fixed Income" :
            value = parseFloat(investment.data.find((data) => data['name'] === "market_value")['value'])
            total_investment += value;
            investmentsResult.push({
              ...investment,
              portfolio_value : parseFloat(value.toFixed(2))
            })
          break

          default:
            break;
        }
      })

      let totalValue = total_investment + totalProfit - totalLoss;
      let profitPercentage = Math.ceil((totalProfit / totalValue) * 100) || 0;
      let lossPercentage = Math.ceil((totalLoss / totalValue) * 100) || 0; 

      return {
        total_investment,
        profitPercentage,
        lossPercentage,
        totalProfit,
        totalLoss,
        investmentsResult
      }
  }
  async fetchInvestmentManualData(user_id : number){
    try {
      const allManualInvestments = await this.prisma.manualInvestments.findMany({
        where : {
          user_id
        },
        select : {
          id : true,
          investmentCategory : {
            select : {
              id : true,
              name : true,
              fields : true
            }
          },
          account_id : true,
          Institution : {
            select : {
              ins_id : true,
              ins_name : true
            }
          },
          data : true,
          created_at : true
        }
      })
      
      const {lossPercentage, profitPercentage, totalLoss, totalProfit, total_investment, investmentsResult} = await this.totalOfManualInvestment(allManualInvestments);

      const pieChartData = {
        total_investment,
        profitPercentage,
        lossPercentage,
        totalProfit,
        totalLoss
      }

      // allManualInvestments.map((investment) => {

      //   const data = investment.data;
        

      //   let market_value = investment.current_price || 0;
      //   let userPurchasePrice = investment.purchase_price;
      //   let total_quantity = investment.quantity;
      //   let profitLoss = (market_value * total_quantity) - (userPurchasePrice * total_quantity)
      //   let totalInvestment = (userPurchasePrice * total_quantity);
      //   let name = investment.name

      //   market_value = parseFloat(market_value.toFixed(2))
      //   userPurchasePrice = parseFloat(userPurchasePrice.toFixed(2))
      //   total_quantity = parseFloat(total_quantity.toFixed(2))
      //   profitLoss = parseFloat(profitLoss.toFixed(2))
      //   let growth_percentage = 25
        
      //   let portfolio_value = market_value * total_quantity
        
      //   let profitLossPercentage = Math.ceil((Math.abs(profitLoss) / totalInvestment) * 100)
      //   totalInvestment = parseFloat(totalInvestment.toFixed(2))

      //   let profitLossObj = {
      //     totalProfit : 0,
      //     totalLoss : 0
      //   }
      //   if (profitLoss > 0) {
      //     profitLossObj.totalProfit = profitLoss;
      //   }else{
      //     profitLossObj.totalLoss = profitLoss
      //   }

      //   investmentsResult.push({
      //     growth_percentage,
      //     market_value,
      //     totalInvestment,
      //     total_quantity,
      //     name,
      //     ...profitLossObj,
      //     portfolio_value,
      //     profitLossPercentage,
      //     created_at : investment.created_at
      //   })

      // })


      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Manual investment data fetched succssfully",
        data: {
          pie_chart_data: pieChartData,
          allInvestmentResult :investmentsResult

        }
      };    
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async fetchAllInvestmentCategories() {
    try {
      const investmentCategories = await this.prisma.investmentCategories.findMany({
        select: {
          name: true,
          id: true, 
          fields : true
        }
      });
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Investment categories fetched successfully',
        data: investmentCategories,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async addUserInvestment(data: CreateManualInvestmentDto, user_id: number, investmentId ?: number) {
    try {

      const investmentCategory = await this.prisma.investmentCategories.findUnique({
        where : {
          id : data.categoryId
        }
      })

      if (!investmentCategory) {
        throw new HttpException("Invalid category Id", HttpStatus.BAD_REQUEST);
      }

      let formFields : any = data.formFields;
      let categoryId : number = data.categoryId

      if (investmentId) {
        const isExists = await this.prisma.manualInvestments.findUnique({
          where : {
            id : investmentId,
            user_id,
            category_id : data.categoryId
          }
        })
        if (!isExists) {
          throw new HttpException("Invalid investment id or category id", HttpStatus.NOT_FOUND)
        }
        await this.prisma.manualInvestments.update({
          where : {
            id : investmentId,
            user_id
          },
          data : {
            data : formFields,
            account_id : data['accountId']
          }
        })
      }
      else{
        await this.prisma.manualInvestments.create({
          data : {
            data : formFields,
            category_id : categoryId,
            user_id,
            account_id : data['accountId'],
            ins_id : data['item_id']
          }
        })
      }

      // Emit event 
      await this.manualInvestmentUpdated(user_id)
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Investment added successfully!',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async deleteManualInvestment(user_id : number, id : number){
    try {

      const toBeDelete = await this.prisma.manualInvestments.delete({
        where : {
          id, 
          user_id
        }
      })

      if (!toBeDelete) {
        throw new HttpException("Invalid investment id", HttpStatus.BAD_REQUEST)
      }
      
      await this.manualInvestmentUpdated(user_id)

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Investment deleted successfully!',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getManualInvestmentCategoryFormData(user_id : number, investmentId ?: number){
    try {
      let userInvetmentData = null
      
      if (investmentId) {
        userInvetmentData = await this.prisma.manualInvestments.findUnique({
          where : {
            id : investmentId,
            user_id
          },
          select : {
            id: true,
            investmentCategory : {
              select : {
                id : true,
                name : true
              }
            },
            data : true
          }
        })

        
      if (!userInvetmentData) {
        throw new HttpException("Invalid investment id", HttpStatus.BAD_REQUEST);
      }
      }
      else{
        userInvetmentData = await this.prisma.manualInvestments.findMany({
          where : {
            user_id
          },
          select : {
            id : true,
            investmentCategory: {
              select : {
                id : true,
                fields : true,
              }
            },
            data : true
          }
        })
      }


      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Investment form details fetched successfully!',
        data: userInvetmentData,
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  // CRON expression for this approach (to run at 2 AM on the 28th to 31st)
  @Cron("0 2 28-31 * *")
  async handleInvestmentCron() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if tomorrow's month is different from today's month
    if (today.getMonth() === tomorrow.getMonth()) {
      return;
    }
    const users = await this.prisma.user.findMany({
      where: {
        user_role: {
          in: ["BASIC", "PREMIUM"]
        }
      }
    });
    let processedRequests = 0;

    for (const user of users) {
      if (processedRequests >= 2000 ) {
        // If the client's rate limit is reached, pause processing for a minute
        await this.delay(60000); // 60,000 milliseconds = 1 minute
        processedRequests = 0; // Reset counter after the pause
      }
      try {
        await this.syncInvestmentHoldingDetails(user.id);
        processedRequests++;
        await this.delay(5000); // Delay to respect the 15 requests/minute/item limit
      } catch (error) {
        console.error(`Error fetching Investment Holdings for user ${user.id}:`, error);
      }
    }
  }

  // Utility function to introduce delays
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  findAll() {
    return `This action returns all investment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} investment`;
  }

  update(id: number, updateInvestmentDto: UpdateInvestmentDto) {
    return `This action updates a #${id} investment`;
  }

  remove(id: number) {
    return `This action removes a #${id} investment`;
  }
}
