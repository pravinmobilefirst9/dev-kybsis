import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma.service';

import { TransactionService } from 'src/transaction/transaction.service';
import { AssetFormDetails } from './dto/asset-form.dto';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly transactionService: TransactionService,
    private eventEmitter : EventEmitter2,
  ) {}

  async createAssetReportToken(user_id: number): Promise<any> {
    try {
      const plaidItems = await this.prismaClient.plaidItem.findMany({
        where: {
          user_id,
        },
      });
      
      if (plaidItems.length === 0) {
        throw new HttpException("Access token is not generated for this user", HttpStatus.BAD_REQUEST);
      }
      for (const plaidItem of plaidItems) {
        try {
          const isExists = await this.prismaClient.plaidAssetItem.findUnique({
            where: {
              plaid_item_id: plaidItem.id,
            },
          });
          if (!isExists) {
            const response = await this.transactionService.createAssetsReport(
              plaidItem.access_token,
              user_id,
            );
            const { asset_report_token } = response.data;
  
              await this.prismaClient.plaidAssetItem.create({
                data: {
                  asset_report_token,
                  plaid_item_id: plaidItem.id,
                  user_id,
                },
              });
          }
         
          // else{
          //   await this.prismaClient.plaidAssetItem.update({
          //     where : {
          //       plaid_item_id: plaidItem.id,
          //     },
          //     data: {
          //       asset_report_token,
          //       user_id
          //     },
          //   });
          // }
        } catch (error) {
          continue;
        }
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Asset report token generated successfully',
        data: {}
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)    }
  }

  async importAssetReports(user_id: number) {
    try {
      const plaidAssetItems = await this.prismaClient.plaidAssetItem.findMany({
        where: {
          PlaidItem: { user_id },
        },
        include : {
          PlaidItem : true
        }
      });

      const promises = plaidAssetItems.map(async (assetItem) => {
        const response = await this.transactionService.getAssetsReport(
          assetItem.asset_report_token,
        );

        return {data : response.data, assetItem};
      })


      let resultArr = await Promise.all(promises);
      console.log({resultArr});
      
      let total = 0;
      resultArr.map(async ({assetItem, data}) => {
        data.report.items.map((reportItem: any) => {  
          // total all balances of assets
          total += reportItem.accounts.reduce((acc, account) => acc + account.balances.current, 0);  
                  
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

            // const filterHistoricalBalances = account.historical_balances.map(
            //   (balance: any) => {
            //     return {
            //       account_id: account.account_id,
            //       balance_amount: balance.current,
            //       balance_date: new Date(balance.date),
            //     };
            //   },
            // );

            // await this.prismaClient.assetHistoricalBalance.createMany({
            //   skipDuplicates: true,
            //   data: filterHistoricalBalances,
            // });

            // Save Assets Transactions

            // const filterAssetsTransactions = account.transactions.map(
            //   (transaction: any) => {
            //     return {
            //       account_id: transaction.account_id,
            //       transaction_id: transaction.transaction_id,
            //       transaction_type: transaction.transaction_type,
            //       date: new Date(transaction.date),
            //       date_transacted: new Date(transaction.date_transacted),
            //       transaction_name: transaction.name,
            //       transaction_amount: transaction.amount,
            //       transaction_currency: transaction.iso_currency_code || null,
            //       check_number: transaction.check_number || null,
            //       merchant_name: transaction.merchant_name || null,
            //       pending: transaction.pending || false,
            //       category_id: transaction.category_id,
            //       category: transaction.category || [],
            //     };
            //   },
            // );

            // await this.prismaClient.assetTransaction.createMany({
            //   skipDuplicates: true,
            //   data: filterAssetsTransactions,
            // });
          });
        });
      })


      
      const now = new Date();
      const firstDayOfMonth = await this.setToFirstDayOfMonth(new Date(now))

      const totalAssets = await this.prismaClient.totalAssets.findFirst({
        where: {
          userId: user_id,
          monthYear: firstDayOfMonth
        }
      })

      if (totalAssets) {
        await this.prismaClient.totalAssets.updateMany({
          where: { userId: user_id, monthYear: firstDayOfMonth },
          data: { totalPliadAssets: total  }
        })
      }
      else {
        await this.prismaClient.totalAssets.create({
          data: {
            userId: user_id,
            totalPliadAssets: total,
            totalManualAssets : 0,
            monthYear : firstDayOfMonth,
          }
        })
      }


      return  {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Assets data imported successfully",
        data: {}
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)    }
  }

  async setToFirstDayOfMonth(date: Date): Promise<Date> {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth(); // getUTCMonth() returns the month (0-11), in UTC

    // Create a new Date object set to the first day of the given month at 00:00 hours, in UTC
    return new Date(Date.UTC(year, month, 1, 0, 0, 0));
  }
  async getAssetDetails(userId: number) {
    try { 

      const details = await this.prismaClient.userManualAssets.findMany({
        select :{
          id : true,
          asset_subtype_id : true,
          asset_type_id : true,
          AssetType : {
            select : {
              name : true,
            }
          },
          AssetSubType: {
            select : {
              name : true
            }
          },
          asset_fields : {
            orderBy : {
              asset_field : {
                order_id : "asc"
              }
            },
            select : {
              value : true,
              field_id : true,
              asset_field: {
                select : {
                  label : true,
                  id : true,
                  order_id : true
                }
              }
            }
          },
          Institution : {
            select : {
              ins_name : true,
              ins_id : true
            }
          },
          account_id : true
        },
        where : {
          user_id : userId
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Assets fetched successfully',
        data: details,
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
      let assetList : any =  await this.prismaClient.assetType.findMany({
        select: {
          name: true,
          description: true,
          id: true,
          hasSubType : true,
          assetSubType : {
            select : {
              id : true,
              name : true
            },
            where : {
              asset : {
                hasSubType : false
              }
            },
          }
        },
        
      });

      assetList = assetList.map((asset) => {
        if (asset.hasSubType === false) {
          return {
            ...asset,
            assetSubType : asset.assetSubType[0]
          }
        }
        else{
          return {
            ...asset,
            assetSubType : null
          }
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Assets list fetched successfully',
        data: assetList,
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

  async getAllAssetsSubTypes(asset_id: number) {
    try {
      if (!asset_id) {
        throw new HttpException('Asset id not found', HttpStatus.BAD_REQUEST);
      }

      const assetSubTypes = await this.prismaClient.assetSubType.findMany({
        where: {
          asset_id,
        },
        select: {
          name: true,
          id: true,
          description: true,
        },
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Assets list fetched successfully',
        data: assetSubTypes
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

  async getFormData(
    { asset_id, asset_subtype_id, asset_type_id}: AssetFormDetails,
    user_id: number,
  ) {
    try {
      const user = await this.prismaClient.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      // Get user manual asset
      let userManualAsset = null
      
      if (asset_id) {
        userManualAsset = await this.prismaClient.userManualAssets.findUnique({
          where : {
            id : asset_id
          },
          select: {
            id : true,
            asset_type_id : true,
            asset_subtype_id : true,
            asset_fields : {
              orderBy : {
                asset_field : {order_id : "asc"}
              },
              select : {
                field_id : true,
                value : true,
                asset_field : {
                  select : {
                    order_id : true
                  }
                }
              }
            }
          },

        })

        if (!userManualAsset) {
          throw new HttpException("Invalid Asset ID", HttpStatus.NOT_FOUND)
        }
      }

      // Find Assets fields by asset_type_id and asset_subtype_id
      const formData = await this.prismaClient.assetFields.findMany({
        where: {
          asset_sub_id: userManualAsset ? userManualAsset.asset_subtype_id : asset_subtype_id,
          asset_type_id : userManualAsset ? userManualAsset.asset_type_id : asset_type_id
        },
        orderBy: {
          order_id : "asc"
        },
        select: {
          label: true,
          options: true,
          type: true,
          id: true,
          name : true,
          mandatory : true,
          order_id : true,
        },
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: { formData, userManualAsset },
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
    { asset_type_id, asset_sub_id, fieldData, account_id, item_id}: CreateAssetDto,
    user_id: number,
  ) {
    try {
      const user = await this.prismaClient.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      const rawFields = await this.prismaClient.assetFields.findMany({
        where : {
          asset_sub_id,
          asset_type_id
        }
      })

      let wrongIds = []
      const rawIds = rawFields.map(f => f.id)
      fieldData.map((f) => {
        if (!rawIds.includes(f.field_id)) {
          wrongIds.push(f.field_id)
        }})

        
      if (wrongIds.length > 0) {
        return {
          success: true,
          statusCode: HttpStatus.CREATED,
          message: 'Invalid Fields',
          data: {
            invalid_field_ids : wrongIds
          },
        }
      }
      // Create parent Asset
      const newAsset = await this.prismaClient.userManualAssets.create({
        data : {
          asset_type_id,
          asset_subtype_id : asset_sub_id,
          user_id,
          account_id,
          ins_id : item_id
        }
      })


      // add fields data of assets
      const userAssetsFieldsArr = fieldData.map((f) => {
          return {
            value: f.value,
            field_id: f.field_id,
            asset_id : newAsset.id,
          };

      });



      await this.prismaClient.userAssetsDetails.createMany({
        data : userAssetsFieldsArr
      })

      this.eventEmitter.emit("manualAssets.updated", user_id);


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

  async updateUserAssetDetails(    
    { asset_id, fieldData }: UpdateAssetDto,
    user_id: number
    ){
      try {
        const userManualAsset = await this.prismaClient.userManualAssets.findUnique({
          where : {
            id : asset_id,
            user_id
          },
          select : {
            asset_fields : true,
            asset_type_id : true,
            asset_subtype_id : true,
            id : true
          }
        })
        
        if (!userManualAsset) {
          throw new HttpException("Asset not found with id : " + asset_id, HttpStatus.NOT_FOUND);
        }

        const rawFields = await this.prismaClient.assetFields.findMany({
          where : {
            asset_sub_id : userManualAsset.asset_subtype_id,
            asset_type_id : userManualAsset.asset_type_id
          }
        })
  
        let wrongIds = []
        const rawIds = rawFields.map(f => f.id)
        fieldData.map((f) => {
          if (!rawIds.includes(f.field_id)) {
            wrongIds.push(f.field_id)
          }})
  
          
        if (wrongIds.length > 0) {
          return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Invalid Fields',
            data: {
              invalid_field_ids : wrongIds
            },
          }
        }        
        
        fieldData.map(async (f) => {
          const fieldExists = await this.prismaClient.userAssetsDetails.findFirst({
            where : {
              asset_id : asset_id,
              field_id : f.field_id,
            }
          })

          if (fieldExists) {
            await this.prismaClient.userAssetsDetails.update({
              data : {
                value : f.value.trim()
              },
              where : {
                id : fieldExists.id
              }
            })
          }
          else {
            const isFieldAppropriate = await this.prismaClient.assetFields.findFirst({
              where : {
                asset_type_id : userManualAsset.asset_type_id,
                asset_sub_id : userManualAsset.asset_subtype_id
              }
            })
            if (isFieldAppropriate) {
              await this.prismaClient.userAssetsDetails.create({
                data : {
                  asset_id,
                  field_id : f.field_id,
                  value : f.value,
                }
              })
            }
          }
        })   

        this.eventEmitter.emit("manualAssets.updated", user_id);

        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: 'Asset updated successfully',
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

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Plaid assets fetched successfully',
        data: plaidAssets,
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

  async deleteManualAsset(user_id : number, asset_id : number){
    try {
      const userAsset = await this.prismaClient.userManualAssets.findUnique({
        where : {
          id : asset_id,
          user_id
        }
      })

      if (!userAsset) {
        throw new HttpException("Invalid Asset ID", HttpStatus.BAD_REQUEST);
      }

      // First delete all user asset fields (child)
      await this.prismaClient.userAssetsDetails.deleteMany({
        where : {
          asset_id
        }
      })

      // Delete parent asset (Parent)
      await this.prismaClient.userManualAssets.delete({
        where : {
          id : asset_id,
          user_id
        }
      })
      this.eventEmitter.emit("manualAssets.updated", user_id);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Asset deleted successfully!',
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


  // -----------------------------------------------CRONS -------------------------------------------------------------------------

   // Cron for liabilities
  // CRON expression for this approach (to run at 23:30 on the 28th to 31st)
  @Cron("0 1 28-31 * *")
  async handleAssetsCron() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if tomorrow's month is different from today's month
    if (today.getMonth() === tomorrow.getMonth()) {
      return;
    }
    const users = await this.prismaClient.user.findMany({
      where: {
        user_role: {
          in: ["BASIC", "PREMIUM"]
        }
      }
    });
    let processedRequests = 0;

    for (const user of users) {
      if (processedRequests >= 1000) {
        // If the client's rate limit is reached, pause processing for a minute
        await this.delay(60000); // 60,000 milliseconds = 1 minute
        processedRequests = 0; // Reset counter after the pause
      }
      try {
        await this.importAssetReports(user.id);
        processedRequests++;
        await this.delay(5000); // Delay to respect the 15 requests/minute/item limit
      } catch (error) {
        console.error(`Error fetching liabilities for user ${user.id}:`, error);
      }
    }
  }

  // Utility function to introduce delays
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
