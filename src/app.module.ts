import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { config } from 'dotenv';
import { UserModule } from './user/user.module';
config();

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URL),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
