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
    private transactionService : TransactionService
  ){}
  
  async addPlaidItems(createPlaidTartanDto: CreatePlaidTartanDto, user_id : number) {
    try {
      
      const existingPlaidItem = await this.prisma.plaidItem.findFirst({
        where: {
          access_token: createPlaidTartanDto.access_token,
          plaid_item_id: createPlaidTartanDto.plaid_item_id,
          user_id: user_id,
        },
      });

      if (existingPlaidItem) {
        throw new HttpException('Duplicate Plaid item found', HttpStatus.CONFLICT);
      }
      
      console.log({user_id});
      
      
      const user = await this.prisma.user.findUnique({where :{id : user_id }})
      if (!user) {
        throw new HttpException("User Not Found", HttpStatus.NOT_FOUND);
      }
      
      const newPlaidItem = await this.prisma.plaidItem.create({
        data: {
          public_token: createPlaidTartanDto.public_token,
          access_token: createPlaidTartanDto.access_token,
          plaid_item_id: createPlaidTartanDto.plaid_item_id,
          user_id : user_id // Connect the Plaid item to the user
        },
      });
      
      return newPlaidItem;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateHistoricalTransactions(userId : number){
    try {
      const historical_data = await this.transactionService.getTransactions(userId)
    const user = await this.prisma.user.findUnique({where : {id : userId}})
    if (historical_data.status === "failure") {
      throw new HttpException(historical_data.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const {accounts, item, transactions} = historical_data.data

    for (const account of accounts) {
      const currentTime = new Date();
      await this.prisma.account.create({
        data: {
          account_name: account.name,
          account_id: account.account_id,
          institution_name: "Bank of America",
          official_name: account.official_name || "Bank of America",
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          institution_id: item.institution_id,
          verification_status: 'verified', // Adjust as per your requirements

          // Timestamps
          created_at: currentTime,
          updated_at: currentTime,
          User : {connect : {id : userId}},
          Balance: { // Create Balance associated with the account
            create: {
              available_balance: account.balances.available || 0,
              current_balance: account.balances.current || 0,
              iso_currency_code: account.balances.iso_currency_code || 'USD',
              date: new Date(),
            },
          },
          Transaction: { // Create Transactions associated with the account
            createMany: {
              data: transactions
                .filter((transaction: any) => transaction.account_id === account.account_id)
                .map((transaction: any) => (({
                  plaid_transaction_id: transaction.transaction_id,
                  name: transaction.name,
                  amount: transaction.amount,
                  category_id: transaction.category_id,
                  category_name: transaction.category,
                  date: new Date(transaction.date),
                  pending: transaction.pending
                }))),
            },
          },
        },
      });
    }
      return {message : "Transactions imported successfully", status : "success", data : {accounts, transaction_count  : transactions.length}};
    } catch (error) {
      return {message : "Failed to import transactions", status : "failure", data : {}};
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
