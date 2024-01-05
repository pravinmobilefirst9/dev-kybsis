import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports : [
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d', algorithm : "HS512"},

    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
