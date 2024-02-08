import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class LiabilitiesService {

  constructor(
    private readonly prismaClient: PrismaService,
    private readonly transactionService: TransactionService,
  ) { }

  async importLiabilities(user_id: number) {
    try {
      const plaidItems = await this.prismaClient.plaidItem.findMany({
        where: {
          user_id
        }
      })
      if (!plaidItems) {
        throw new HttpException("Access tokens not found", HttpStatus.NOT_FOUND);
      }
      // Map each plaid item to an array of promises
      const promises = plaidItems.map(async (item) => {
        const { liabilities } = await this.transactionService.getLiabilities(item.access_token);
        return liabilities;
      });

      // Wait for all promises to resolve
      const resultArr = await Promise.all(promises);

      if (resultArr.length === 0) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: "Liabilities not found",
          data: []
        }
      }

      let totalData = []
      resultArr.map((liability) => {
        let liabilityTypes = Object.keys(liability)
        liabilityTypes.map((type) => {
          switch (type) {
            case 'credit':
              let creditData = liability['credit']
              creditData.map((crd) => {
                totalData.push(
                  {
                    user_id,
                    last_payment_date: new Date(crd.last_payment_date),
                    account_id: crd.account_id,
                    last_payment_amount: crd.last_payment_amount,
                    type: type,
                  },
                )
              })
              break;
            case 'mortgage':
              let mortageData = liability['mortgage']
              mortageData.map((mrg) => {
                totalData.push({
                  user_id,
                  last_payment_date: new Date(mrg.last_payment_date),
                  account_id: mrg.account_id,
                  last_payment_amount: mrg.last_payment_amount,
                  type: type,
                  account_number: mrg.account_number
                })
              })
              break;
            case 'student':
              let stduentData = liability['student']
              stduentData.map((std) => {
                totalData.push({
                  user_id,
                  last_payment_date: new Date(std.last_payment_date),
                  account_id: std.account_id,
                  last_payment_amount: std.last_payment_amount,
                  type: type,
                  account_number: std.account_number
                })
              })
              break;

            default:
              break;
          }
        })
      })

      await this.prismaClient.liabilities.createMany({
        skipDuplicates : true,
        data : totalData
      })

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Liabilities imported successfully",
        data: totalData
      }

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  create(createLiabilityDto: CreateLiabilityDto) {
    return 'This action adds a new liability';
  }

  findAll() {
    return `This action returns all liabilities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liability`;
  }

  update(id: number, updateLiabilityDto: UpdateLiabilityDto) {
    return `This action updates a #${id} liability`;
  }

  remove(id: number) {
    return `This action removes a #${id} liability`;
  }
}
