import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createOrganizationDTO {
  @ApiProperty({required:true})
  @IsNotEmpty()
  organizationemailId:string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  organizationName: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  organizationID:string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  role: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  subscribe: string;
}

export class userSession {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  organizationemailId: string;
}

export class verificationCodeDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  verificationCode: string;
}
export class authenticationdata {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;
}
export class resendVerificationCodeDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
}
