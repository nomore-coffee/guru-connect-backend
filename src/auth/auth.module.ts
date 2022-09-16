import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationSchema } from './Schema/organization.schema';
import { AuthController } from './auth.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'organizations', schema: OrganizationSchema }])],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
