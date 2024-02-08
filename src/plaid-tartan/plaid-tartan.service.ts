import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePlaidTartanDto } from './dto/create-plaid-tartan.dto';
import { UpdatePlaidTartanDto } from './dto/update-plaid-tartan.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { ManualAccountDTO } from './dto/manual-account.dto';
import { CreateTransactionDto } from './dto/create-manual-transaction.dto';
import { Transaction } from '@prisma/client';

@Injectable()
export class PlaidTartanService {
  constructor(
    private readonly prisma: PrismaService,
    private transactionService: TransactionService,
  ) { }

  async fetchAllManualAccounts(user_id : number){
    try {
      const accounts = await this.prisma.account.findMany({
        where : {
          user_id,
          manual : true
        },
        select : {
          account_id : true,
          account_name : true,
          Balance : {
            select : {
              available_balance:  true
            }
          },
          institution_name : true,
          type : true
        }
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Accounts fetched successfully",
        data: accounts
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async addPlaidItems(
    createPlaidTartanDto: CreatePlaidTartanDto,
    user_id: number,
  ) {
    try {
      // If same access token is found in whole database then throw error
      let existingPlaidItem = await this.prisma.plaidItem.findFirst({
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
          ins_id: createPlaidTartanDto.institution_id,
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
            ins_name: createPlaidTartanDto.institution_name
          },
          where: { id: isBankExists.id }
        });

        // Delete all accounts if updating access token
        await this.prisma.account.deleteMany({
          where: {
            plaid_item_id: isBankExists.id
          }
        })

      }
      else {
        await this.prisma.plaidItem.create({
          data: {
            public_token: "none",
            access_token: createPlaidTartanDto.access_token,
            plaid_item_id: createPlaidTartanDto.plaid_item_id,
            ins_id: createPlaidTartanDto.institution_id,
            user_id: user_id,
            ins_name: createPlaidTartanDto.institution_name
          },
        });
      }

      await this.syncHistoricalTransactions(user_id)

      return {
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
                plaid_item_id: itemData.id,
                user_id: userId,
                // Timestamps
                created_at: currentTime,
                updated_at: currentTime,
                // User: { connect: { id: userId } },
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
                account_id: existingAccount.id,
                user_id: userId
              })),
          });

          resultArray.push({
            account_id: account.account_id,
            // transactions: transactions.length,
            // item_id: item.id,
            transactions_api_response: transactions
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


  async addManualAccount(
    user_id: number,
    data: ManualAccountDTO,
    id: number | undefined = undefined
  ) {
    try {
      const dataObj = {
        account_id: data['accountId'],
        account_name: data['accountName'],
        institution_name: data['institutionName'],
        institution_id: data['institutionId'],
        type: data['type'],
        manual: true,
        subtype: data['type'],
        user_id,
        created_at: new Date(),
        updated_at: new Date()
      }

      if (id !== undefined) {
        const existedAccount = await this.prisma.account.findUnique({
          where: {
            id,
            user_id
          }
        })

        if (!existedAccount) {
          throw new HttpException('Invalid account id', HttpStatus.BAD_REQUEST);
        }

        await this.prisma.account.update({
          where: { id },
          data: {
            ...dataObj,
            created_at : existedAccount.created_at,
            updated_at : new Date()
          }
        })
      } else {
        await this.prisma.account.create({
          data: dataObj
        });
      }

      return {
        success: true,
        statusCOde: HttpStatus.CREATED,
        message: `Account ${id ? "updated" : "created"} successfully`,
        data: {}
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

async deleteManualAccount(user_id : number, id : number){
  try {
    const deleted = await this.prisma.account.delete({
      where : {
        id,
        user_id,
        manual : true
      }
    })

    if (!deleted) {
      return {
        success: false,
        statusCOde: HttpStatus.OK,
        message: `Manual account with id ${id} associated with current user not found`,
        data: {}
      }
    } 

    return {
      success: true,
      statusCOde: HttpStatus.OK,
      message: `Manual account deleted successfully`,
      data: {}
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

  async addManualTransaction(user_id: number, data : CreateTransactionDto, id : number | undefined = undefined) {
    try {
      let dataObj = {
        account_id : data['account_id'],
        amount : data['amount'],
        date : new Date(data['date']),
        manual : true,
        name : data['name'],
        pending : data['pending'],
        user_id,
        category_id : null,
        category_name : null
      }

      const category = await this.prisma.budgetCategories.findUnique({
        where : {
          id : data['category_id']
        }
      })

      dataObj.category_id = category.category_ids[0];
      dataObj.category_name = [category.category_name];

      if (id) {
        const transactionExists = await this.prisma.transaction.count({
          where : {id, user_id}
        })
        if (transactionExists === 0) {
          throw new HttpException("Transaction you are trying update does not exists", HttpStatus.NOT_FOUND)
        }
        await this.prisma.transaction.update({
          data : dataObj,
          where : {id}
        })
      }
      else{
        await this.prisma.transaction.create({
          data : dataObj,
        })
      }

      return {
        success: true,
        statusCOde: HttpStatus.CREATED,
        message: `Transaction ${id ? "updated" : "created"} successfully`,
        data: {}
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

  async deleteManualTransaction(user_id : number, id : number){
    try {
      const transactionExists = await this.prisma.transaction.count({
        where : {
          id,
          user_id
        }
      })

      if (transactionExists === 0) {
        throw new HttpException("Transaction you are trying update does not exists", HttpStatus.NOT_FOUND)
      }

      await this.prisma.transaction.delete({
        where : {
          id,
          user_id
        }
      })

      return {
        success: true,
        statusCOde: HttpStatus.OK,
        message: `Transaction deleted successfully`,
        data: {}
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
