import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { Cron, CronExpression } from '@nestjs/schedule';

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
        try {
          const { accounts } = (await this.transactionService.getLiabilities(item.access_token)).data;
          return accounts;
        } catch (error) {
          return
        }
      });

      // Wait for all promises to resolve
      let resultArr = await Promise.all(promises);

      if (resultArr.length === 0) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: "Liabilities not found",
          data: []
        }
      }

      let total = 0;
      let totalData = []
      resultArr = resultArr.filter((acc) => acc !== undefined);
      resultArr.map(async (accounts) => {
        // Make a total of all account balances
        total += accounts.reduce((acc, account) => acc + account.balances.current, 0);

        // Update or add all liabilities account balance
        // for (const account of accounts) {
        //   await this.prismaClient.liabilities.upsert({
        //     where: { accountId: account.account_id },
        //     update: {
        //       current: account.balances.current,
        //       available: account.balances.available,
        //     },
        //     create: {
        //       accountId: account.account_id,
        //       accountType: account.type,
        //       subtype: account.subtype,
        //       current: account.balances.current,
        //       available: account.balances.available,
        //       isoCurrency: account.balances.iso_currency_code,
        //       limit: account.balances.limit,
        //       userId: user_id
        //     },
        //   });
        // }
      })

      // Create a date of first day of month to have consistency
      const now = new Date();
      const firstDayOfMonth = await this.setToFirstDayOfMonth(new Date(now))
      const totalLiability = await this.prismaClient.totalLiabilities.findFirst({
        where: {
          userId: user_id,
          monthYear: firstDayOfMonth
        }
      })

      if (totalLiability) {
        await this.prismaClient.totalLiabilities.updateMany({
          where: { userId: user_id, monthYear: firstDayOfMonth },
          data: { totalAmount: total }
        })
      }
      else {
        await this.prismaClient.totalLiabilities.create({
          data: {
            userId: user_id,
            totalAmount: total,
            monthYear: firstDayOfMonth,
          }
        })
      }



      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "Liabilities imported successfully",
        data: totalData
      }

    } catch (error) {
      console.error({error})
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async setToFirstDayOfMonth(date: Date): Promise<Date> {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth(); // getUTCMonth() returns the month (0-11), in UTC

    // Create a new Date object set to the first day of the given month at 00:00 hours, in UTC
    return new Date(Date.UTC(year, month, 1, 0, 0, 0));
  }

  // Cron for liabilities
  // CRON expression for this approach (to run at 23:30 on the 28th to 31st)
  @Cron("0 1 28-31 * *")
  async handleLiabilitiesCron() {
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
        await this.importLiabilities(user.id);
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
