import { BadRequestException, Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { authenticationdata, resendVerificationCodeDTO, userSession, verificationCodeDTO } from './DTO/organization.dto';


@ApiTags('Authentication-cognito')
@Controller('auth')
export class AuthController {
    constructor(private readonly AuthService:AuthService){}

    @Post('createOrganization')
    async createorganization(@Body() body:any){
        try{
          console.log(">>>>>>>>>>>>>",body)
            const{organizationName,organizationemailId,organizationID}=body;

            const body_for_signup={
                organizationID:organizationID,
                organizationName:organizationName,
                organizationemailId:organizationemailId,
                role:'superadmin',
                subscribe:'unactive'
            }

            console.log("bodyforsognup",body_for_signup)

            const create_organization_DB=await this.AuthService.create_organization_DB(body_for_signup)
            if(create_organization_DB){
                let create_organization_cognito = await this.AuthService.create_organization_cognito(body,create_organization_DB._id)
                console.log("?>>>>>>",create_organization_cognito)
                console.log("?>>>>>>",create_organization_cognito.userSub)
                if(create_organization_DB){
                  let update_user_cogid_DB= await this.AuthService.update_user_cognito_ID(create_organization_cognito.userSub,create_organization_DB._id)
                }
                return{
                  StatusCode:200,
                  message:"ORGANIZATION CREATED"
                }
            }
            else{
                return{
                    StatusCode:424,
                    message:'error while creating user in db'
                }
            }
        }
        catch(error){
            return{
                StatusCode:500,
                message:error
            }
        }

    }


    @Post('verifyCode')
    async verifyCode(@Body() body: verificationCodeDTO) {
      try {
        await this.AuthService.verifyCode(body);
        return { message: 'Success' };
      } catch (error) {
        throw new BadRequestException(error);
      }
    }

    @Post('resendVerifyCode')
  async resendVerifyCode(@Body() body: resendVerificationCodeDTO) {
    try {
      return await this.AuthService.resendVerifyCode(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

    @Post('authenticating_user')
    async authenticating_user(@Body() body:authenticationdata ){
      try {
        console.log("BODYY>>",body)
        let get_authendication_details= await this.AuthService.emailcheck(body.emailId)
        console.log("authenfication-data",get_authendication_details)
        if(!get_authendication_details){
          return{
            StatusCode:404,
            message:'User not Exists'
          }
        }
        if(get_authendication_details.role='superadmin'){
          return await this.AuthService.authenticateAdmin(body)
          //  return{
          //   StatusCode:200,
          //   message:"LOGED IN"
          //  }
        }
      } catch (error) {
        return{
          StatusCode:401,
          message:'WRONG CREDENTIALS'
        }
      }
    }
  
    @Post('CofirmUserSession')
    async confirmSession(@Body() body: userSession) {
      try {
        return await this.AuthService.ConfirmUserSession(body);
      } catch (error) {
        throw new BadRequestException(error);
      }
    }
}
