import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompoundFrequency, CreateAccountForcastingDto, Timing } from './dto/create-account_forcasting.dto';
import { UpdateAccountForcastingDto } from './dto/update-account_forcasting.dto';
import { PrismaService } from 'src/prisma.service';
import { InvestmentDetailsDto } from './dto/forecast-account-v1.dto';

export enum Compound {
  ANNUALLY = 'annually',
  SEMIANNUALLY = 'semiannually',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  SEMIMONTHLY = 'semimonthly',
  BIWEEKLY = 'biweekly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
  CONTINUOUSLY = 'continuously',
}





@Injectable()
export class AccountForcastingService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async calculateForecasting({
      annualInterestRate,
      compoundingFrequency,
      contribution,
      contributionFrequency,
      principal,
      years,
      accountId,
      item_id
  }: InvestmentDetailsDto, user_id : number, forecastId ?: number) {

     // Constants
     const compoundingPerYear = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12,
      biweekly: 26,
      weekly: 52,
      daily: 365,
      continuously: 'continuously'
  };

  const contributionsPerYear = {
      endOfYear: 1,
      endOfMonth: 12,
      startOfYear: 1,
      startOfMonth: 12
  };

  // Calculate compounding periods and contribution periods per year
  const n = compoundingPerYear[compoundingFrequency];
  const m = contributionsPerYear[contributionFrequency];
  const interestRateInDecimal = annualInterestRate / 100
  // Initialize future value of the lump sum and annuity
  let FV_lumpSum = principal;
  let FV_annuity = 0;

  if (compoundingFrequency === 'continuously') {
      FV_lumpSum = principal * Math.exp(interestRateInDecimal * years);
  } else {
      // Calculate future value of the lump sum
      FV_lumpSum *= Math.pow(1 + interestRateInDecimal / n, n * years);
  }

  // Calculate future value of the annuity
  for (let i = 1; i <= years * m; i++) {
      let contributionTime = i / m;
      if (contributionFrequency.includes('end')) {
          contributionTime -= 1 / m;
      }
      
      if (compoundingFrequency === 'continuously') {
          FV_annuity += contribution * Math.exp(interestRateInDecimal * contributionTime);
      } else {
          FV_annuity += contribution * Math.pow(1 + interestRateInDecimal / n, n * contributionTime);
      }
  }

  // Calculate total future value
  const totalFV = FV_lumpSum + FV_annuity;

  // Calculate total contributions
  const totalContributions = principal + contribution * years * m;

  // Calculate total interest earned
  const totalInterest = totalFV - totalContributions;
  
  let resultObj = { 
    additionalContribution : contribution,
    contributionFrequency : contributionFrequency,
    investmentLength : years,
    returnRate : annualInterestRate,
    startingAmount : principal,
    compound : compoundingFrequency,
    accountId,
    endBalance: parseFloat(totalFV.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalContributions: parseFloat((totalContributions - principal).toFixed(2)),
    user_id : user_id,
    ins_id : item_id 
  }

  if (forecastId) {
    const isExists = await this.prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!isExists) {
      throw new HttpException(`Account Forcasting with id ${forecastId} not found`, HttpStatus.NOT_FOUND)
    }
    else {
      await this.prisma.forecast.update({
        data: resultObj,
        where: { id: forecastId }
      })
    }
  }
  else {
    await this.prisma.forecast.create({
    data:  resultObj
    })
  }
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: `Account forcasting ${forecastId ? "updated" : "calculated"} successfully`,
      data: {
        endBalance: parseFloat(totalFV.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        totalContributions: parseFloat((totalContributions - principal).toFixed(2)),
        startingAmount : principal, 
      }
    };
  }

  async findAllAccountForcasting(user_id: number) {
    try {
      const accountForcasting = await this.prisma.forecast.findMany({
        where: {
          user_id
        },
        select : {
          id : true,
          additionalContribution: true,
          contributionFrequency: true,
          investmentLength: true,
          returnRate: true,
          startingAmount: true,
          compound: true,
          accountId: true,
          endBalance: true,
          totalContributions: true,
          totalInterest: true,
          user_id: true,
          Institution : {
            select : {
              id : true,
              ins_id : true,
              ins_name : true,
            }
          },
          createdAt : true
        }
      })
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: `Account forcasting fetched successfully`,
        data: accountForcasting,
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getForcastingById(user_id: number, id: number) {
    try {
      const forcasting = await this.prisma.forecast.findUnique({
        where: {
          id,
          user_id
        }
      })

      if (!forcasting) {
        throw new HttpException(`Account forcasting not found for id : ${id} with user id : ${user_id}`,
          HttpStatus.NOT_FOUND
        )
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Account forcasting fetched successfully`,
        data: forcasting,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteAccountForcasting(user_id: number, id: number) {
    try {
      const forcasting = await this.prisma.forecast.findUnique({
        where: {
          id,
          user_id
        }
      })

      if (!forcasting) {
        throw new HttpException(`Account forcasting not found for id : ${id} with user id : ${user_id}`,
          HttpStatus.NOT_FOUND
        )
      }

      await this.prisma.forecast.delete({
        where: {
          id,
          user_id
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Account forcasting deleted successfully`,
        data: {},
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }





  create(createAccountForcastingDto: CreateAccountForcastingDto) {
    return 'This action adds a new accountForcasting';
  }

  findAll() {
    return `This action returns all accountForcasting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountForcasting`;
  }

  update(id: number, updateAccountForcastingDto: UpdateAccountForcastingDto) {
    return `This action updates a #${id} accountForcasting`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountForcasting`;
  }
}
