import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class AssetsService {

  constructor(
    private readonly prismaClient: PrismaService,
    private readonly transactionService: TransactionService,
  ) { }


  async importAssetReports() {
    try {
      const access_token = "access-sandbox-47f3d91d-82c3-466a-88a9-c48b7d58019d"
      // const createAssetsReport = await this.transactionService.createAssetsReport(access_token);

      // if (createAssetsReport.status === "failure") {
      //   throw new HttpException(createAssetsReport.message + " from create", HttpStatus.INTERNAL_SERVER_ERROR);
      // }      

      // const { asset_report_token, asset_report_id  } = createAssetsReport;
      const response = await this.transactionService.getAssetsReport("asset_report_token");
      console.log({response});
      
      return response.data
    } catch (error) {
      throw new HttpException(error.message + " from get assets", HttpStatus.INTERNAL_SERVER_ERROR);
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
