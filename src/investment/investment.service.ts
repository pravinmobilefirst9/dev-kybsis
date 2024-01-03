import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

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
          const holdingOfAccount = holdings.filter((hld : any) => hld.account_id === account.account_id)                          

          await this.prisma.investmentHolding.createMany({
            skipDuplicates : true,
            data : holdingOfAccount.map((hld : any) => {
              return {
                ...hld,
                institution_price_as_of : hld.institution_price_as_of ? new Date(hld.institution_price_as_of) : null,
                institution_price_datetime : hld.institution_price_datetime ?  new Date(hld.institution_price_datetime) : null
              }
            })
          });
   
          resultArray.push({
            account_id: account.account_id,
            item_id: itemData.id,
            holdingOfAccount
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

  create(createInvestmentDto: CreateInvestmentDto) {
    return 'This action adds a new investment';
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
