import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePlaidTartanDto } from './dto/create-plaid-tartan.dto';
import { UpdatePlaidTartanDto } from './dto/update-plaid-tartan.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class PlaidTartanService {
  constructor(
    private readonly prisma: PrismaService,
    private transactionService: TransactionService,
  ) {}

  async addPlaidItems(
    createPlaidTartanDto: CreatePlaidTartanDto,
    user_id: number,
  ) {
    try {
      // If same access token is found in whole database then throw error
      let  existingPlaidItem = await this.prisma.plaidItem.findFirst({
        where: {
          access_token: createPlaidTartanDto.access_token,
        },
      });

      if (existingPlaidItem) {
        throw new HttpException(
          'Duplicate Plaid item found',
          HttpStatus.CONFLICT,
        );
      }

      let isBankExists = await this.prisma.plaidItem.findFirst({
        where: {
          ins_id : createPlaidTartanDto.institution_id,
          user_id 
        },
      });

      // IF the Bank/Institution i.e. ins_id is already exists then update its acceess token or create a new one

      if (isBankExists) {
        // When access token changed account_id's also change
        // Afterwords we need to wipe all data regarding invesments, institution etc.
        await this.prisma.plaidItem.update({
          data: {
            public_token: "none",
            access_token: createPlaidTartanDto.access_token,
            plaid_item_id: createPlaidTartanDto.plaid_item_id,
            ins_id: createPlaidTartanDto.institution_id,
            user_id: user_id,
            ins_name : createPlaidTartanDto.institution_name
          },
          where : {id : isBankExists.id}
        });
      }
      else{
        await this.prisma.plaidItem.create({
          data: {
            public_token: "none",
            access_token: createPlaidTartanDto.access_token,
            plaid_item_id: createPlaidTartanDto.plaid_item_id,
            ins_id: createPlaidTartanDto.institution_id,
            user_id: user_id,
            ins_name : createPlaidTartanDto.institution_name
          },
        });
      }

      // const institution_details = await this.transactionService.getInstitutionDetails(createPlaidTartanDto.institution_id);
      
      return  {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Access token registered successfully!",
        data: {}
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateHistoricalTransactions(userId: number) {
    try {
      const historical_data =
        await this.transactionService.getTransactions(userId);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (historical_data.status === 'failure') {
        throw new HttpException(
          historical_data.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const { accounts, item, transactions } = historical_data.data;

      for (const account of accounts) {
        const currentTime = new Date();
        await this.prisma.account.create({
          data: {
            account_name: account.name,
            account_id: account.account_id,
            institution_name: 'Bank of America',
            official_name: account.official_name || "",
            mask: account.mask,
            type: account.type,
            subtype: account.subtype,
            institution_id: item.institution_id,
            verification_status: 'verified', // Adjust as per your requirements

            // Timestamps
            created_at: currentTime,
            updated_at: currentTime,
            User: { connect: { id: userId } },
            Balance: {
              // Create Balance associated with the account
              create: {
                available_balance: account.balances.available || 0,
                current_balance: account.balances.current || 0,
                iso_currency_code: account.balances.iso_currency_code || 'USD',
                date: new Date(),
              },
            },
            Transaction: {
              // Create Transactions associated with the account
              createMany: {
                skipDuplicates: true,
                data: transactions
                  .filter(
                    (transaction: any) =>
                      transaction.account_id === account.account_id,
                  )
                  .map((transaction: any) => ({
                    plaid_transaction_id: transaction.transaction_id,
                    name: transaction.name,
                    amount: transaction.amount,
                    category_id: transaction.category_id,
                    category_name: transaction.category,
                    date: new Date(transaction.date),
                    pending: transaction.pending,
                  })),
              },
            },
          },
        });
      }
      return {
        message: 'Transactions imported successfully',
        status: 'success',
        data: { accounts, transaction_count: transactions.length },
      };
    } catch (error) {
      return { message: error.message, status: 'failure', data: {} };
    }
  }

  async syncHistoricalTransactions(userId: number) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
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
        const historical_data = await this.transactionService.syncTransactions(
          itemData,
          userId,
        );
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (historical_data.status === 'failure') {
          throw new HttpException(
            historical_data.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const { accounts, item, transactions } = historical_data.data;

        for (const account of accounts) {
          let existingAccount = await this.prisma.account.findFirst({
            where: {
              account_id: account.account_id,
              user_id: userId,
            },
          });

          const currentTime = new Date();
          if (!existingAccount) {
            existingAccount = await this.prisma.account.create({
              data: {
                account_name: account.name,
                account_id: account.account_id,
                institution_name: itemData.ins_name,
                official_name: account.official_name || "--",
                mask: account.mask,
                type: account.type,
                subtype: account.subtype,
                institution_id: item.institution_id,
                verification_status: 'verified', // Adjust as per your requirements

                // Timestamps
                created_at: currentTime,
                updated_at: currentTime,
                User: { connect: { id: userId } },
              },
            });

            await this.prisma.balance.create({
              data: {
                available_balance: account.balances.available || 0,
                current_balance: account.balances.current || 0,
                iso_currency_code: account.balances.iso_currency_code || 'USD',
                date: new Date(),
                account_tbl_id: existingAccount.id,
              },
            });
          } else {
            const existingBalance = await this.prisma.balance.findFirst({
              where: { account_tbl_id: existingAccount.id },
            });
            await this.prisma.balance.update({
              data: {
                available_balance: account.balances.available || 0,
                current_balance: account.balances.current || 0,
                iso_currency_code: account.balances.iso_currency_code || 'USD',
                date: new Date(),
              },
              where: {
                id: existingBalance.id,
              },
            });
          }

          await this.prisma.transaction.createMany({
            skipDuplicates: true,
            data: transactions
              .filter(
                (transaction: any) =>
                  transaction.account_id === account.account_id,
              )
              .map((transaction: any) => ({
                plaid_transaction_id: transaction.transaction_id,
                name: transaction.name,
                amount: transaction.amount,
                category_id: transaction.category_id,
                category_name: transaction.category,
                date: new Date(transaction.date),
                pending: transaction.pending,
                account_id: existingAccount.id
              })),
          });

          resultArray.push({
            account_id: account.account_id,
            // transactions: transactions.length,
            // item_id: item.id,
            transactions_api_response : transactions
          });
        }
      }

      return {
        message: 'Transactions imported successfully',
        status: 'success',
        data: resultArray,
      };
    } catch (error) {
      return { message: error, status: 'failure', data: {} };
    }
  }

  // create(createPlaidTartanDto: CreatePlaidTartanDto) {
  //   return 'This action adds a new plaidTartan';
  // }

  findAll() {
    return `This action returns all plaidTartan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} plaidTartan`;
  }

  update(id: number, updatePlaidTartanDto: UpdatePlaidTartanDto) {
    return `This action updates a #${id} plaidTartan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plaidTartan`;
  }
}
