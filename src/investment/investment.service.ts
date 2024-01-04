import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateManualInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentService {
  constructor(
    private readonly prisma: PrismaService,
    private transactionService: TransactionService,
  ) { }
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
        if (!existingAccount) {
          // If account is not exists the create new one with balance
          existingAccount = await this.prisma.investmentAccounts.create({
            data: {
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
            },
          });

          await this.prisma.investmentBalance.create({
            data: {
              available_balance: account.balances.available || 0,
              current_balance: account.balances.current || 0,
              iso_currency_code: account.balances.iso_currency_code || 'USD',
              account_id: existingAccount.id,
            },
          });
        } else {
          // If account exuists then balanceshould be existed
          // So update its current balance
          const existingBalance = await this.prisma.investmentBalance.findFirst(
            {
              where: { account_id: existingAccount.id },
            },
          );
          await this.prisma.investmentBalance.update({
            data: {
              available_balance: account.balances.available || 0,
              current_balance: account.balances.current || 0,
              iso_currency_code: account.balances.iso_currency_code || 'USD',
            },
            where: {
              id: existingBalance.id,
            },
          });
        }

        // Save the investment transactions
        await this.prisma.investmentTransactions.createMany({
          skipDuplicates: true,
          data: investment_transactions
            .filter(
              (transaction: any) =>
                transaction.account_id === account.account_id,
            )
            .map((transaction: any) => ({
              account_id: existingAccount.id,
              cancel_transaction_id: transaction.cancel_transaction_id,
              amount: transaction.amount,
              date_of_transaction: new Date(transaction.date),
              fees: transaction.fees,
              investment_transaction_id: transaction.investment_transaction_id,
              iso_currency_code: transaction.iso_currency_code,
              name: transaction.name,
              price: transaction.price,
              quantity: transaction.quantity,
              security_id: transaction.security_id,
              subtype: transaction.subtype,
              type: transaction.type,
              unofficial_currency_code: transaction.unofficial_currency_code,
              platform: transaction.platform,
            })),
        });

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
      status: 'success',
      data: resultArray,
    };
  }

  async syncInvestmentHoldingDetails(user_id: number) {
    try {
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


      for (const itemData of plaid_items) {
        const investmentholdingData = await this.transactionService.getInvestmentHoldings(
          itemData.access_token
        );

        if (investmentholdingData.status === 'failure') {
          continue
        }

        const { holdings, securities, accounts } = investmentholdingData.data

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

        for (const account of accounts) {
          let existingAccount = await this.prisma.investmentAccounts.findFirst({
            where: {
              account_id: account.account_id,
              user_id: user_id,
            },
          });
  
          const currentTime = new Date();
          if (!existingAccount) {
            // If account is not exists the create new one with balance
            existingAccount = await this.prisma.investmentAccounts.create({
              data: {
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
              },
            });
  
            await this.prisma.investmentBalance.create({
              data: {
                available_balance: account.balances.available || 0,
                current_balance: account.balances.current || 0,
                iso_currency_code: account.balances.iso_currency_code || 'USD',
                account_id: existingAccount.id,
              },
            });
          } else {
            // If account exuists then balance should be existed
            // So update its current balance
            const existingBalance = await this.prisma.investmentBalance.findFirst(
              {
                where: { account_id: existingAccount.id },
              },
            );
            await this.prisma.investmentBalance.update({
              data: {
                available_balance: account.balances.available || 0,
                current_balance: account.balances.current || 0,
                iso_currency_code: account.balances.iso_currency_code || 'USD',
              },
              where: {
                id: existingBalance.id,
              },
            });
          }

          // Save security holdings
          const holdingsOfAccount = holdings.filter((hld : any) => hld.account_id === account.account_id)                          

          for (const holding of holdingsOfAccount) {
            const isHoldingExists = await this.prisma.investmentHolding.findFirst({
              where : {
                account_id : holding.account_id,
                security_id : holding.security_id
              }
            });
            if (isHoldingExists) {
              await this.prisma.investmentHolding.update({
                data : {
                  ...holding,
                  institution_price_as_of : holding.institution_price_as_of ? new Date(holding.institution_price_as_of) : null,
                  institution_price_datetime : holding.institution_price_datetime ?  new Date(holding.institution_price_datetime) : null
                  
                },
                where : {id : isHoldingExists.id}
              })
            }
            else{
              await this.prisma.investmentHolding.create({
                data : {
                  ...holding,
                  institution_price_as_of : holding.institution_price_as_of ? new Date(holding.institution_price_as_of) : null,
                  institution_price_datetime : holding.institution_price_datetime ?  new Date(holding.institution_price_datetime) : null
                },
              })
            }
          }

          resultArray.push({
            account_id: account.account_id,
            item_id: itemData.id,
            holdings : holdingsOfAccount
          });
        }
      }

      return resultArray;

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async fetchInvestmentHomePageData (user_id  : number){
    try {

      let investmentData : any = await this.prisma.investmentAccounts.findMany({
        where : {user_id},
        select : {
          account_id : true,
          id : true,
          investmentHolding : {include : {investment_security : true}},
          account_name : true
        }, 
    })

    investmentData = investmentData.filter((acc : any) => acc.investmentHolding.length > 0)
    
    // Calculate total investment, profit, and loss
    let totalInvestment = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    
    investmentData.forEach((account) => {
      account.investmentHolding.forEach((holding) => {
        const value = holding.institution_value || 0;
        const costBasis = holding.cost_basis || 0;
        const quantity = holding.quantity;
        const profitLoss = (value)- (costBasis * quantity);
    
        totalInvestment += costBasis * quantity;
        if (profitLoss > 0) {
          totalProfit += profitLoss;
        } else {
          totalLoss += Math.abs(profitLoss);
        }
      });
    });
    
    // Calculate profit and loss percentages
    const totalValue = totalInvestment + totalProfit - totalLoss;
    const profitPercentage = (totalProfit / totalValue) * 100;
    const lossPercentage = (totalLoss / totalValue) * 100;
    let totalHoldings = []
    let totalSecurities = []
    let resultSecurityData = []
    // Format pie chart data
    const pieChartData = investmentData.map((account) => {
      totalHoldings = [...totalHoldings, ...account.investmentHolding]
      return {accountName: account.account_name,
      value: parseFloat(account.investmentHolding.reduce(
        (acc, holding) => acc + (holding.institution_value || 0),
        0
      ).toFixed(3)),}
    }); 
    
    totalHoldings.map((hld) => !totalSecurities.includes(hld.security_id) && totalSecurities.push(hld.security_id))
    
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
      allHoldings.forEach((holding) => {
        value = holding.institution_value || 0;
        market_value = holding.institution_price
        costBasis = holding.cost_basis || 0;
        quantity = holding.quantity;
        const profitLoss = (value)- (costBasis * quantity);
        total_quantity += quantity
        totalInvestment += (costBasis * quantity);
        if (profitLoss > 0) {
          totalProfit += profitLoss;
        } else {
          totalLoss += Math.abs(profitLoss);
        }
      });

      totalInvestment = parseFloat(totalInvestment.toFixed(2))
      market_value = parseFloat(market_value.toFixed(2))
      totalProfit = parseFloat(totalProfit.toFixed(2))
      totalLoss = parseFloat(totalLoss.toFixed(2))
      total_quantity = parseFloat(total_quantity.toFixed(2))
      const obj = { 
        security_id : security,
        name : allHoldings[0].investment_security.name,
        totalInvestment,
        market_value,
        total_quantity,
        totalProfit,
        totalLoss,
      }

      resultSecurityData.push(obj)

    })

   return {
      total_investment: parseFloat(totalInvestment.toFixed(3)),
      profit_percentage: parseFloat(profitPercentage.toFixed(3)),
      profit_amount: parseFloat(totalProfit.toFixed(3)),
      loss_percentage: parseFloat(lossPercentage.toFixed(3)),
      loss_amount: parseFloat(totalLoss.toFixed(3)),
      pie_chart_data: pieChartData,
      resultSecurityData
    };
              

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async fetchAllInvestmentCategories () {
    try {
      const investmentCategories = await this.prisma.investmentCategories.findMany({
        select : {
          name : true,
          id : true
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
  async addUserInvestment(data : CreateManualInvestmentDto, user_id : number){
    try {
      const isCategoryExists = await this.prisma.investmentCategories.findUnique({
        where: {
          id :data.categoryId
        }
      })

      if (!isCategoryExists) {
        throw new HttpException(
          "Invalid category, Category not found",
          HttpStatus.BAD_REQUEST
        )
      }
      const newInvestment = await this.prisma.manualInvestments.create({
        data : {
          amount : data.amount,
          currency : data.currency,
          name : data.name,
          price : data.price,
          quantity : data.quantity,
          category_id : data.categoryId,
          user_id
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Investment added successfully!',
        data: newInvestment,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
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
