import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import plaid from 'plaid';


@Injectable()
export class TransactionService {
  private readonly configuration: Configuration
  private readonly client: PlaidApi
  constructor(
    private readonly prisma: PrismaService, 
    ){
      this.configuration = new Configuration({
        basePath: PlaidEnvironments[process.env.PLAID_ENV],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET_ID,
            'Plaid-Version': '2020-09-14',
          },
        },
      });

     this.client = new PlaidApi(this.configuration);
    }

  async getTransactions (user_id  : number){
    const user = await this.prisma.user.findUnique({where : {id : user_id}});

    if (!user) {
      return {
        status: 'failure',
        data: { message: 'User not found' },
      };
    }

    const plaid_item = await this.prisma.plaidItem.findFirst({where : {user_id : user.id}});


   

    if (!plaid_item) {
      return {
        status: 'failure',
        data: { message: 'Access token not found ' },
      };
    }

      const response = await this.client.transactionsGet({
      access_token : plaid_item.access_token,
      start_date: "2010-04-14",
      end_date: "2024-04-17",
    });


    // response.data.accounts.forEach(account => {
    //   const newAccount = await this.prisma.account.create();

    //   const newBalance = await this.prisma.balance.create(
    //     {
    //       data : {
    //         account_id : newAccount.id
    //       }
    //     }
    //   );

    // });

    return response.data;
    
  }







  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
