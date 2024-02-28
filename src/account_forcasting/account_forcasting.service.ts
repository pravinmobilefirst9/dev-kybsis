import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompoundFrequency, CreateAccountForcastingDto, Timing } from './dto/create-account_forcasting.dto';
import { UpdateAccountForcastingDto } from './dto/update-account_forcasting.dto';
import { PrismaService } from 'src/prisma.service';
import { InvestmentQueryDto } from './dto/forecast-account-v1.dto';

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
    additionalContribution,
    contributionFrequency,
    investmentLength,
    returnRate,
    startingAmount,
    compound,
    accountIds,
    contributionTiming,
    item_id
  }: InvestmentQueryDto, user_id : number, forecastId ?: number) {

    let periodsPerYear = 0;
  switch (compound) {
    case Compound.ANNUALLY:
      periodsPerYear = 1;
      break;
    case Compound.SEMIANNUALLY:
      periodsPerYear = 2;
      break;
    case Compound.QUARTERLY:
      periodsPerYear = 4;
      break;
    case Compound.MONTHLY:
      periodsPerYear = 12;
      break;
    case Compound.SEMIMONTHLY:
      periodsPerYear = 24;
      break;
    case Compound.BIWEEKLY:
      periodsPerYear = 26;
      break;
    case Compound.WEEKLY:
      periodsPerYear = 52;
      break;
    case Compound.DAILY:
      periodsPerYear = 365;
      break;
    case Compound.CONTINUOUSLY:
      periodsPerYear = 1; // Continuous compounding
      break;
    default:
      throw new Error('Invalid compound frequency');
  }

  const totalPeriods = investmentLength * periodsPerYear;

  // Calculate total contributions based on contribution period
  let totalContributions = 0;
  if (contributionFrequency === 'monthly') {
    totalContributions = additionalContribution * investmentLength * periodsPerYear;
  } else if (contributionFrequency === 'annually') {
    totalContributions = additionalContribution * investmentLength;
  }

  // Calculate future value using compound interest formula
  const monthlyInterestRate = returnRate / 100 / periodsPerYear;
  let futureValue = startingAmount * Math.pow(1 + monthlyInterestRate, totalPeriods) +
                      (additionalContribution * ((Math.pow(1 + monthlyInterestRate, totalPeriods) - 1) / monthlyInterestRate));          

  let resultObj = { 
    additionalContribution,
    contributionFrequency,
    investmentLength,
    returnRate,
    startingAmount,
    compound,
    accountIds,
    contributionTiming,
    endBalance: parseFloat(futureValue.toFixed(2)),
    totalContributions,
    totalInterest: parseFloat((futureValue - startingAmount - totalContributions).toFixed(2)),
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
        endBalance: parseFloat(futureValue.toFixed(2)),
        startingAmount,
        totalContributions,
        totalInterest: parseFloat((futureValue - startingAmount - totalContributions).toFixed(2)),
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
          additionalContribution: true,
          contributionFrequency: true,
          investmentLength: true,
          returnRate: true,
          startingAmount: true,
          compound: true,
          accountIds: true,
          contributionTiming: true,
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
          }
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
