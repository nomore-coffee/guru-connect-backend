import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  randomStringMake(count) {
    const letter =
      '0123456789ABCDEFGHIJabcdefghijklmnopqrstuvwxyzKLMNOPQRSTUVWXYZ0123456789abcdefghiABCDEFGHIJKLMNOPQRST0123456789jklmnopqrstuvwxyz';
    let randomString = '';
    for (let i = 0; i < count; i++) {
      const randomStringNumber = Math.floor(
        1 + Math.random() * (letter.length - 1),
      );
      randomString += letter.substring(
        randomStringNumber,
        randomStringNumber + 1,
      );
    }
    let password = randomString;
    return password;
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('createuser')
  async createUser(@Body() body: any, @Req() request) {
    try {
      console.log("JDASKJHSKJSA",body)
      let adminDetails = await this.authService.emailcheck(
        request.payload.email,
      );
      let user_email = await this.authService.emailcheck(body.emailID);
      if (adminDetails.role == 'superadmin' && !user_email) {
        const { name, emailID } = body;
        const temp_password = this.randomStringMake(8);

        const admin_body = {
          organization_ID: adminDetails._id.toString(),
          adminName: name,
          adminEmailID: emailID,
          organizationName: adminDetails.organizationName,
          role: 'admin',
        };

        console.log("adminbody",admin_body)
        let organization_mongoID = adminDetails._id.toString();
        let organizationName = adminDetails.organizationName;
        let superadmin = {
          organization_mongoID,
          organizationName,
          temp_password,
        };

        let create_admin = await this.userService.create_admin(admin_body);
        if (create_admin) {
          let create_admin_cognito =
            await this.authService.createAdminonCognito(
              body,
              superadmin,
              create_admin._id.toString(),
            );
          if (create_admin_cognito) {
            let update_admin = await this.authService.update_user_cognito_ID(
              create_admin_cognito.userSub,
              create_admin._id.toString(),
            );
          }
          return{
            StatusCOde:200,
            message:"Admin Created"
          }
        }
        else{
          return{
            StatusCOde:424,
            message:"error while creating user"
          }
        }
      }
    } catch (error) {
      return{
        StatusCOde:500,
        message:error
      }
    }
  }
}
