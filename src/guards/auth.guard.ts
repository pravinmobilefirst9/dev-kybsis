import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaClient : PrismaService
    ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      
      const userExists = await this.prismaClient.user.findUnique({
        where : {
          id : payload.user_id
        }
      })
      
      if (!userExists) {
        throw new HttpException(
          "User does not exists",
          HttpStatus.UNAUTHORIZED
        )
      }

      request['auth'] = payload;
      
    } catch (error) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];    
    return type === 'Bearer' ? token : undefined;
  }
}
