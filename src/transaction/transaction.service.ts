import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { Configuration, InstitutionsGetByIdRequest, PlaidApi, PlaidEnvironments, CountryCode, InvestmentsTransactionsGetRequest, TransactionsEnrichRequest, AssetReportCreateRequest, AssetReportGetRequest } from 'plaid';
import { PlaidItem } from '@prisma/client';


@Injectable()
export class TransactionService {
  private readonly configuration: Configuration
  private readonly client: PlaidApi
  constructor(
    private readonly prisma: PrismaService,
  ) {
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

  async getTransactions(user_id: number) {
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    if (!user) {
      return {
        status: 'failure',
        data: { message: 'User not found' },
      };
    }

    const plaid_item = await this.prisma.plaidItem.findFirst({ where: { user_id: user.id } });


    if (!plaid_item) {
      return {
        status: 'failure',
        data: { message: 'Access token not found ' },
      };
    }

    try {

      const response = await this.client.transactionsGet({
        access_token: plaid_item.access_token,
        start_date: "2010-04-14",
        end_date: "2024-04-17",
      });

      await this.prisma.plaidInstitutionImportHistory.create({
        data: {
          access_token: plaid_item.access_token,
          ins_id: plaid_item.ins_id,
          imported_at: new Date(),
          plaid_item_id: plaid_item.id,
          user_id: user_id
        }
      })
      return { status: "success", data: response.data, message: "transaction data fetched successfully" };
    } catch (error) {
      return { status: "failure", message: error.message, data: null }
    }


  }

  async syncTransactions(plaid_item: PlaidItem, user_id: number) {
    try {
      const response = await this.client.transactionsGet({
        access_token: plaid_item.access_token,
        start_date: "2010-04-14",
        end_date: "2024-04-17",
        options: {
          include_original_description: true,
        }
      });

      await this.prisma.plaidInstitutionImportHistory.create({
        data: {
          access_token: plaid_item.access_token,
          ins_id: plaid_item.ins_id,
          imported_at: new Date(),
          plaid_item_id: plaid_item.id,
          user_id: user_id
        }
      })
      return { status: "success", data: response.data, message: "transaction data fetched successfully" };
    } catch (error) {
      return { status: "failure", message: error.message, data: null }
    }
  }


  async getInstitutionDetails(ins_id: string) {
    try {
      const response = await this.client.institutionsGetById({
        country_codes: [CountryCode.Us],
        institution_id: ins_id
      });
      const institution = response.data.institution;
      return { data: institution, status: "success" }
    } catch (error) {
      return { data: null, status: "failure" }
    }
  }

  async getInvestmentDetails(plaid_item: PlaidItem, user_id: number) {
    try {
      const request: InvestmentsTransactionsGetRequest = {
        access_token: plaid_item.access_token,
        start_date: '2023-01-01',
        end_date: '2023-06-10',
      };
      const response = await this.client.investmentsTransactionsGet(request);
      const investmentdata = response.data;
      return { data: investmentdata, status: "success" }
    } catch (error) {
      return { data: null, status: "failure", message: error.message }
    }
  }

  // Get Plaid Transaction Categories
  async getAllPlaidCategories() {
    try {
      const response = await this.client.categoriesGet({});
      const categories = response.data.categories;
      return { data: categories, status: "success" }
    } catch (error) {
      return { data: null, status: "failure", message: error.message }
    }
  }

  // Get plaid assets report
  async createAssetsReport(access_token: string) {

    let a = {
      "client_id": "6565a47c274b86001c2d7c1d",
      "secret": "b0700fa90a2b033bd01391350c2408",
      "access_tokens": [
          // "access-sandbox-47f3d91d-82c3-466a-88a9-c48b7d58019d",
          access_token
      ],
      "days_requested": 30,
      "options": {
          "client_report_id": "ENTER_CLIENT_REPORT_ID_HERE",
          "webhook": "https://www.example.com/webhook",
          "user": {
              "client_user_id": "ENTER_USER_ID_HERE",
              "first_name": "ENTER_FIRST_NAME_HERE",
              "middle_name": "ENTER_MIDDLE_NAME_HERE",
              "last_name": "ENTER_LAST_NAME_HERE",
              "ssn": "111-22-1234",
              "phone_number": "1-415-867-5309",
              "email": "ENTER_EMAIL_HERE"
          }
      }
  }

    const daysRequested = 60;
    const options = {
      client_report_id: '123',
      webhook: 'https://www.example.com',
      user: {
        client_user_id: '7f57eb3d2a9j6480121fx361',
        first_name: 'Jane',
        middle_name: 'Leah',
        last_name: 'Doe',
        ssn: '123-45-6789',
        phone_number: '(555) 123-4567',
        email: 'jane.doe@example.com',
      },
    };
    const request: AssetReportCreateRequest = {
      client_id : "6565a47c274b86001c2d7c1d",
      secret : "b0700fa90a2b033bd01391350c2408",
      access_tokens: [access_token],
      days_requested: daysRequested,
      options,
    };
    // accessTokens is an array of Item access tokens.
    // Note that the assets product must be enabled for all Items.
    // All fields on the options object are optional.
    try {
      const response = await this.client.assetReportCreate(a);     
      const asset_report_id = response.data.asset_report_id;
      const asset_report_token = response.data.asset_report_token;

      return { asset_report_id, asset_report_token, status: "success", message: "Asset report created successfully" }
    } catch (error) {
      // handle error    
      return { status: "failure", message: error }
    }
  }

  // Get Assets Report
  async getAssetsReport(assetReportToken: string) {
    const obj = {
      "client_id" : "6565a47c274b86001c2d7c1d",
      "secret" : "b0700fa90a2b033bd01391350c2408",
      "asset_report_token": assetReportToken,
    };
    try {
      console.log(obj);
      console.log(        {
        "client_id": "6565a47c274b86001c2d7c1d",
        "secret": "b0700fa90a2b033bd01391350c2408",
        "asset_report_token": "assets-sandbox-bbb8228d-3d73-46bd-8898-140e38fe6e7b"
    });
      
      
      const response = await this.client.assetReportGet(
        {
          "client_id": "6565a47c274b86001c2d7c1d",
          "secret": "b0700fa90a2b033bd01391350c2408",
          "asset_report_token": "assets-sandbox-0b3189a0-9740-40da-a8a9-532ee309acb6"
      }
      );
      const data = response.data;
      console.log({data});
             
      return { status: "success", message: "Assets report fetched successfully", data }

    } catch (error) {
      throw new HttpException(error + " from get assets", HttpStatus.INTERNAL_SERVER_ERROR);

        // handle error
        // return { status: "failure", message: error.message, data: null }
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
