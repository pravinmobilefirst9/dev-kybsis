import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma.service';

import { TransactionService } from 'src/transaction/transaction.service';
import { PlaidAssetItem, PlaidItem } from '@prisma/client';
import { AssetFormDetails } from './dto/asset-form.dto';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async createAssetReportToken(user_id: number): Promise<any> {
    try {
      const plaidItems = await this.prismaClient.plaidItem.findMany({
        where: {
          user_id,
        },
      });

      if (plaidItems.length === 0) {
        return { status: 'failure', message: 'Access tokens are empty' };
      }
      for (const plaidItem of plaidItems) {
        try {
          const response = await this.transactionService.createAssetsReport(
            plaidItem.access_token,
            user_id,
          );
          const { asset_report_token } = response.data;

          const isExists = await this.prismaClient.plaidAssetItem.findFirst({
            where: {
              asset_report_token: asset_report_token,
            },
          });
          if (!isExists) {
            await this.prismaClient.plaidAssetItem.create({
              data: {
                asset_report_token,
                plaid_item_id: plaidItem.id,
                user_id,
              },
            });
          }
        } catch (error) {
          continue;
        }
      }

      return {
        success: 'success',
        message: 'Plaid asset item added successfully',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async importAssetReports(user_id: number) {
    try {
      let reports = [];
      const plaidAssetItems = await this.prismaClient.plaidAssetItem.findMany({
        where: {
          PlaidItem: { user_id },
        },
        include : {
          PlaidItem : true
        }
      });

      for (const assetItem of plaidAssetItems) {
        try {
          const response = await this.transactionService.getAssetsReport(
            assetItem.asset_report_token,
          );
      
          let data = response.data;
          // Add the data into Asset Account table
          data.report.items.map((reportItem: any) => {
            reportItem.accounts.map(async (account: any) => {
              let isAccountExists =
                await this.prismaClient.assetAccount.findUnique({
                  where: {
                    account_id: account.account_id,
                  },
                });
              let dataToAdd = {
                balance_available: account.balances.available,
                balance_limit: account.balances.limit,
                balance_current: account.balances.current,
                account_id: account.account_id,
                days_available: account.days_available,
                mask: account.mask,
                name: account.name,
                subtype: account.subtype,
                type: account.type,
                user_id: user_id,
                plaid_asset_item_id : assetItem.id
              };

              if (isAccountExists) {
                await this.prismaClient.assetAccount.update({
                  where: { id: isAccountExists.id },
                  data: dataToAdd,
                });
              } else {
                await this.prismaClient.assetAccount.create({
                  data: dataToAdd,
                });
              }
              // Save Historical Balances

              const filterHistoricalBalances = account.historical_balances.map(
                (balance: any) => {
                  return {
                    account_id: account.account_id,
                    balance_amount: balance.current,
                    balance_date: new Date(balance.date),
                  };
                },
              );

              await this.prismaClient.assetHistoricalBalance.createMany({
                skipDuplicates: true,
                data: filterHistoricalBalances,
              });

              // Save Assets Transactions

              const filterAssetsTransactions = account.transactions.map(
                (transaction: any) => {
                  return {
                    account_id: transaction.account_id,
                    transaction_id: transaction.transaction_id,
                    transaction_type: transaction.transaction_type,
                    date: new Date(transaction.date),
                    date_transacted: new Date(transaction.date_transacted),
                    transaction_name: transaction.name,
                    transaction_amount: transaction.amount,
                    transaction_currency: transaction.iso_currency_code || null,
                    check_number: transaction.check_number || null,
                    merchant_name: transaction.merchant_name || null,
                    pending: transaction.pending || false,
                    category_id: transaction.category_id,
                    category: transaction.category || [],
                  };
                },
              );

              await this.prismaClient.assetTransaction.createMany({
                skipDuplicates: true,
                data: filterAssetsTransactions,
              });

              reports.push({
                account,
                filterAssetsTransactions,
                filterHistoricalBalances,
                reportItem,
              });
            });
          });
        } catch (error) {
          continue;
        }
      }

      return reports;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAssetDetails(userId: number) {
    try {
      const userAssetsDetails =
        await this.prismaClient.userAssetsDetails.findMany({
          where: { user_id: userId },
          select: {
            asset_sub_id: true,
          },
        });

      const assetSubIds = userAssetsDetails.map((uad) => uad.asset_sub_id);
      const data = await this.prismaClient.assetType.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          assetSubType: {
            where: {
              id: {
                in: assetSubIds,
              },
            },
            select: {
              id: true,
              asset_id: true,
              name: true,
              description: true,
              UserAssetsDetails: {
                where: {
                  user_id: userId,
                },
                select: {
                  id: true,
                  user_id: true,
                  asset_id: true,
                  asset_sub_id: true,
                  field_id: true,
                  value: true,
                },
              },
            },
          },
        },
      });
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Assets fetched successfully',
        data: data,
      };
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
  async getAssetsLists() {
    try {
      return await this.prismaClient.assetType.findMany({
        select: {
          name: true,
          description: true,
          id: true,
        },
      });
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

  async getAllAssetsSubTypes(asset_id: number) {
    try {
      if (!asset_id) {
        throw new HttpException('Asset id not found', HttpStatus.BAD_REQUEST);
      }

      return await this.prismaClient.assetSubType.findMany({
        where: {
          asset_id,
        },
        select: {
          name: true,
          id: true,
          description: true,
        },
      });
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

  async getFormData(
    { asset_id, asset_subtype_id }: AssetFormDetails,
    user_id: number,
  ) {
    try {
      const user = await this.prismaClient.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      const formData = await this.prismaClient.assetFields.findMany({
        where: {
          asset_sub_id: asset_subtype_id,
        },
        select: {
          label: true,
          name: true,
          options: true,
          type: true,
          id: true,
        },
      });

      const userFormData = await this.prismaClient.userAssetsDetails.findMany({
        where: {
          asset_id: asset_id,
          asset_sub_id: asset_subtype_id,
        },
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: { formData, userFormData },
        message: 'Form fields fetched successfully',
      };
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

  async addUserAssetsDetails(
    { asset_id, asset_sub_id, fieldData }: CreateAssetDto,
    user_id: number,
  ) {
    try {
      const user = await this.prismaClient.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      const userAssetsFieldsArr = fieldData.map((f) => {
        return {
          value: f.value,
          field_id: f.field_id,
          asset_id,
          asset_sub_id,
          user_id,
        };
      });

      await this.prismaClient.userAssetsDetails.createMany({
        data: userAssetsFieldsArr,
      });

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Asset created successfully',
        data: {},
      };
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


  async getPlaidAssets(user_id : number){
    try {
      const plaidAssets = await this.prismaClient.plaidAssetItem.findMany({
        where : {user_id},
        select : {
          id : true,
          PlaidItem : {
            select : {
              id : true,
              ins_name : true,
              ins_id : true,
            }
          },
          AssetAccount : {
            where: {user_id},
            select : {
              id : true,
              balance_available : true,
              balance_current : true,
              name : true,
              account_id : true,
              type : true,
              subtype : true,
              mask : true,
            }
          }
        },
      })
      console.log({plaidAssets});
      

      return plaidAssets
      
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
  create(createAssetDto: CreateAssetDto) {
    return 'This action adds a new asset';
  }

  findAll() {
    return `This action returns all assets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
