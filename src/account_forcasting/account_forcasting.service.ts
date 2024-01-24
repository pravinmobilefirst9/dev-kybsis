import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompoundFrequency, CreateAccountForcastingDto, Timing } from './dto/create-account_forcasting.dto';
import { UpdateAccountForcastingDto } from './dto/update-account_forcasting.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AccountForcastingService {

  constructor(
    private readonly prisma : PrismaService,
  ) {}

  async calculateForecastDetails(
    user_id : number, 
    {
    forcastingId,
    compound,
    contributeAt,
    returnRate,
    startingAmount,
    timePeriod
  } : CreateAccountForcastingDto): Promise<any> {
    try {
    // Calculate end balance, total contribution, and total interest
    let endBalance = this.calculateEndBalance(startingAmount, timePeriod, returnRate, compound);
    let totalContribution = this.calculateTotalContribution(startingAmount, timePeriod, contributeAt);
    let totalInterest = endBalance - startingAmount - totalContribution;

     endBalance = parseFloat(endBalance.toFixed(2))
     totalContribution = parseFloat(totalContribution.toFixed(2))
     totalInterest = parseFloat(totalInterest.toFixed(2))

    const resultObj =  {
      compound,
      contributeAt,
      endBalance,
      returnRate,
      startingAmount,
      startingBalance : startingAmount,
      timePeriod,
      totalContribution,
      totalInterest,
      user_id
    }

    if (forcastingId) {
      const isExists = await this.prisma.forecast.findUnique({
        where :{ id : forcastingId}
      })

      if (!isExists) {
        throw new HttpException(`Account Forcasting with id ${forcastingId} not found`, HttpStatus.NOT_FOUND)
      }
      else{
        await this.prisma.forecast.update({
          data : resultObj,
          where : {id : forcastingId}
        })
      }
    }
    else{
      await this.prisma.forecast.create({
        data : resultObj
      })
    }   
   
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: `Account forcasting ${forcastingId ? "updated" : "created"} successfully`,
      data:  {
        endBalance,
        totalContribution,
        totalInterest,
        startingAmount
      },
    };
          
  } catch (error) {
    if (error instanceof HttpException) {
      throw error
    }
    throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
  }

  }

  private calculateEndBalance(
    startingAmount: number,
    timePeriod: number,
    returnRate: number,
    compound: CompoundFrequency,
  ): number {
    // Perform the calculation based on the compound frequency
    switch (compound) {
      case CompoundFrequency.ANNUALLY:
        return startingAmount * Math.pow(1 + returnRate, timePeriod);
      case CompoundFrequency.SEMIANNUALLY:
        return startingAmount * Math.pow(1 + returnRate / 2, timePeriod * 2);
      case CompoundFrequency.QUARTERLY:
        return startingAmount * Math.pow(1 + returnRate / 4, timePeriod * 4);
      case CompoundFrequency.MONTHLY:
        return startingAmount * Math.pow(1 + returnRate / 12, timePeriod * 12);
      case CompoundFrequency.BIWEEKLY:
        return startingAmount * Math.pow(1 + returnRate / 26, timePeriod * 26);
      case CompoundFrequency.MONTHLY:
        return startingAmount * Math.pow(1 + returnRate / 52, timePeriod * 52);
      case CompoundFrequency.DAILY:
        return startingAmount * Math.pow(1 + returnRate / 365, timePeriod * 365);
      default:
        return startingAmount;
    }
  }

  private calculateTotalContribution(
    startingAmount: number,
    timePeriod: number,
    contributeAt: Timing,
  ): number {
    // Perform the calculation based on the contribution timing
    switch (contributeAt) {
      case Timing.BEGINNING:
        return startingAmount * timePeriod;
      case Timing.END_OF_EACH_MONTH:
        return startingAmount * timePeriod;
      case Timing.END_OF_EACH_YEAR:
        return startingAmount * timePeriod;
      // Add more cases as needed for different contribution timings
      default:
        return startingAmount;
    }
  }

async findAllAccountForcasting(user_id : number){
  try {
    console.log({user_id});
    
    const accountForcasting = await this.prisma.forecast.findMany({
      where : {
        user_id
      },
      select : {
        id : true,
        startingAmount : true,
        compound : true,
        contributeAt : true,
        returnRate : true
      }
    })

    console.log({accountForcasting});
    
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: `Account forcasting fetched successfully`,
      data:  accountForcasting,
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
