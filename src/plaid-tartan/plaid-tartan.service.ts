import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlaidTartanDto } from './dto/create-plaid-tartan.dto';
import { UpdatePlaidTartanDto } from './dto/update-plaid-tartan.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlaidTartanService {
  
  constructor(
    private readonly prisma: PrismaService,
  ){}
  
  async addPlaidItems(createPlaidTartanDto: CreatePlaidTartanDto, user_id : number) {
    try {
      
      const existingPlaidItem = await this.prisma.plaidItem.findFirst({
        where: {
          access_token: createPlaidTartanDto.access_token,
          plaid_item_id: createPlaidTartanDto.plaid_item_id,
          user_id: user_id,
        },
      });

      if (existingPlaidItem) {
        throw new HttpException('Duplicate Plaid item found', HttpStatus.CONFLICT);
      }
      
      console.log({user_id});
      
      
      const user = await this.prisma.user.findUnique({where :{id : user_id }})
      if (!user) {
        throw new HttpException("User Not Found", HttpStatus.NOT_FOUND);
      }
      
      const newPlaidItem = await this.prisma.plaidItem.create({
        data: {
          public_token: createPlaidTartanDto.public_token,
          access_token: createPlaidTartanDto.access_token,
          plaid_item_id: createPlaidTartanDto.plaid_item_id,
          user_id : user_id // Connect the Plaid item to the user
        },
      });
      
      return newPlaidItem;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  
  // create(createPlaidTartanDto: CreatePlaidTartanDto) {
  //   return 'This action adds a new plaidTartan';
  // }

  findAll() {
    return `This action returns all plaidTartan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} plaidTartan`;
  }

  update(id: number, updatePlaidTartanDto: UpdatePlaidTartanDto) {
    return `This action updates a #${id} plaidTartan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plaidTartan`;
  }
}
