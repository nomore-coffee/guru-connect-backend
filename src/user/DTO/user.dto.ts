import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createAdminDTO {
  @ApiProperty({required:true})
  @IsNotEmpty()
  adminEmailID:string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  adminName: string;
}