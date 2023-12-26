import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { Configuration, InstitutionsGetByIdRequest, PlaidApi, PlaidEnvironments, CountryCode, InvestmentsTransactionsGetRequest, TransactionsEnrichRequest} from 'plaid';
import { PlaidItem } from '@prisma/client';


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

    try {
      
      const response = await this.client.transactionsGet({
        access_token : plaid_item.access_token,
        start_date: "2010-04-14",
        end_date: "2024-04-17",
      });

      await this.prisma.plaidInstitutionImportHistory.create({
        data : {
          access_token : plaid_item.access_token,
          ins_id : plaid_item.ins_id,
          imported_at : new Date(),
          plaid_item_id : plaid_item.id,
          user_id : user_id
        }
      })
      return {status : "success", data : response.data, message : "transaction data fetched successfully"};
    } catch (error) {
      return {status : "failure", message : error.message, data : null}
    }

    
  }
  
  async syncTransactions (plaid_item  : PlaidItem, user_id : number){
    try {
      const response = await this.client.transactionsGet({
        access_token : plaid_item.access_token,
        start_date: "2010-04-14",
        end_date: "2024-04-17",
        options : {
          include_original_description : true, 
        }
      });

      await this.prisma.plaidInstitutionImportHistory.create({
        data : {
          access_token : plaid_item.access_token,
          ins_id : plaid_item.ins_id,
          imported_at : new Date(),
          plaid_item_id : plaid_item.id,
          user_id : user_id
        }
      })
      return {status : "success", data : response.data, message : "transaction data fetched successfully"};
    } catch (error) {
      return {status : "failure", message : error.message, data : null}
    }
  }


  async getInstitutionDetails (ins_id : string) {
    try {
      const response = await this.client.institutionsGetById({
        country_codes: [CountryCode.Us],
        institution_id : ins_id
      });
      const institution = response.data.institution;
      return {data : institution , status : "success"}
    } catch (error) {
      return {data : null , status : "failure"}
    }
  }

  async getInvestmentDetails (plaid_item : PlaidItem, user_id : number) {
    try {
      const request : InvestmentsTransactionsGetRequest = {
        access_token: plaid_item.access_token,
        start_date: '2023-01-01',
        end_date: '2023-06-10',
      };
      const response = await this.client.investmentsTransactionsGet(request);
      const investmentdata = response.data;
      return {data : investmentdata , status : "success"}
    } catch (error) {
      return {data : null , status : "failure", message : error.message}
    }
  }

  // Get Plaid Transaction Categories
  async getAllPlaidCategories () {
    try {
        const response = await this.client.categoriesGet({});
        const categories = response.data.categories;
      return {data : categories , status : "success"}
    } catch (error) {
      return {data : null , status : "failure", message : error.message}
    }
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
