import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
// import { OrganizationSchema } from 'src/auth/Schema/organization.schema';
import { Teacher_adminSchema } from './Schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'organizations', schema: Teacher_adminSchema }])],
    providers: [UserService,AuthService],
  controllers: [UserController]
})
export class UserModule {}
