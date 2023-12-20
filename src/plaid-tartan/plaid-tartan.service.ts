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
    const historical_data = await this.transactionService.getTransactions(userId)
    const user = await this.prisma.user.findUnique({where : {id : userId}})
    if (historical_data.status === "failure") {
      throw new HttpException(historical_data.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const {accounts, transactions, item} = historical_data.data

    console.log({accounts, transactions, item});
    // Mehul
    // for (const accountData of accounts) {
    //   const createdAccount = await this.prisma.account.create({
    //     data: {
    //       account_id: accountData.account_id,
    //       mask: accountData.mask,
    //       account_name: accountData.name,
    //       official_name: accountData.official_name,
    //       subtype: accountData.subtype,
    //       type: accountData.type,
    //     //   balances: {
    //     //     create: {
    //     //       available: accountData.balances.available,
    //     //       current: accountData.balances.current,
    //     //       iso_currency_code: accountData.balances.iso_currency_code,
    //     //       limit: accountData.balances.limit,
    //     //       unofficial_currency_code: accountData.balances.unofficial_currency_code,
    //     //     },
    //     //   },
    //     //   transactions: {
    //     //     create: accountData.transactions.map(transactionData => ({
    //     //       amount: transactionData.amount,
    //     //       date: new Date(transactionData.date),
    //     //       name: transactionData.name,
    //     //       // ... other transaction properties
    //     //     })),
    //     //   },
    //     // },
    //     // include: {
    //     //   balances: true,
    //     //   transactions: true,
    //     },
    //   })
    //   console.log('Created account:', createdAccount);
    // }
    // Pravin
    for (const account of accounts) {
      const createdAccount = await this.prisma.account.create({
        data: {
          // Account fields
          account_name: account.name,
          account_id: account.account_id,
          institution_name: account.official_name,
          official_name: account.official_name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          institution_id: item.institution_id,
          verification_status: 'verified', // Add verification status or use actual data

          // User ID - make sure you have the user ID available
          User: {
            connect: { id: userId},
          },

          // Create balance
          // Balance: {
          //   create: {
          //     available_balance: account.balances.available,
          //     current_balance: account.balances.current,
          //     iso_currency_code: account.balances.iso_currency_code,
          //     date: new Date(),
          //   },
          // },

          // // Create transactions related to the account
          // Transaction: {
          //   create: transactions
          //     .filter((t: any) => t.account_id === account.account_id)
          //     .map((t: any) => ({
          //       account_id: account.account_id,
          //       plaid_transaction_id: t.transaction_id,
          //       name: t.name,
          //       amount: t.amount,
          //       category_id: t.category_id,
          //       category_name: t.category,
          //       date: new Date(t.date),
          //       pending: t.pending,
          //     })),
          // },
        },
      });

      console.log('Created Account:', createdAccount);
    }

    // Rohan
    // for (const account of historical_data.data.accounts) {

    //   const transactionArray  : Transaction[] = [];
    //   const transactions : any[] = historical_data.data.transactions.filter((t : any, i : number) => t.account_id === account.account_id);

    //   transactions.map((t : any) => {
    //       const newTransaction : any = {
    //             account_id : account.account_id,
    //             amount : t.amount,
    //             category_id : t.category_id,
    //             date : new Date(),
    //             plaid_transaction_id : t.transaction_id,
    //             name : t.name,
    //             category_name : t.category,
    //             pending : t.pending,
                
    //         }
        

    //       transactionArray.push(newTransaction)
    //   })

    //   console.log({transactionArray});
      

    //     await this.prisma.account.create({
    //       data : {
    //          institution_name : "Bank of America",
    //          account_name : account.name,
    //          type : account.type,
    //          mask : account.mask,
    //          subtype : account.subtype,
    //          official_name : account.official_name,
    //          account_id : account.account_id,
    //         //  Balance : {
    //         //   create : {
    //         //         available_balance : account.balances.available,
    //         //         current_balance : account.balances.current,
    //         //         iso_currency_code : account.iso_currency_code,
    //         //         date : new Date(),
    //         //   }
    //         //  },
    //         //  Transaction : {
    //         //   createMany : {data : transactionArray}
    //         //  },
    //          institution_id : historical_data.data.item.institution_id,
    //          user_id : userId,
    //          verification_status : "false"
    //       }
    //     })
    // }

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
