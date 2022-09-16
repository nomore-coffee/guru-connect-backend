import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationDocument } from 'src/auth/Schema/organization.schema';
import { Teacher_adminDocument } from './Schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('organizations')
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel('organizations')
    private readonly admin_teacherModel:Model<Teacher_adminDocument>
  ) {}

  async user_exist(body) {
    return await this.orgModel.findOne({});
  }

  async create_admin(body) {
    console.log(body)
    return await this.admin_teacherModel.create(body);
  }

  async update_cognito(
    @Body()
    id: any,
    body: any,
  ) {
    return await this.orgModel.findByIdAndUpdate(
      { _id: id },
      { sub: body.sub },
    );
  }
}
