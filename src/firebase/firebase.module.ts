import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigModule } from '@nestjs/config';


@Module({
   imports:[ConfigModule],
   providers: [FirebaseService],
})
export class FirebaseModule {}
