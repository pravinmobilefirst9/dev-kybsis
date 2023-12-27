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

  async importLiabilities(){
    try {
      const access_token = "access-sandbox-757ef68d-9504-45f8-803d-f0a34571e257"
      const liabilities = await this.transactionService.getLiabilities(access_token);
      return liabilities
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
