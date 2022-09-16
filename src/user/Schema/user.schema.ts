import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Teacher_adminDocument = Teacher_admin & Document;

@Schema({
  timestamps: true,
})
export class Teacher_admin {
  @Prop({required:true})//College ID
  organization_ID: string;
  @Prop({required:true})//College Name
  adminName: string;
  @Prop({required:true})//College Email
  adminEmailID: string;
  @Prop({required:true})
  organizationName:string;
  @Prop()
  cognitoId: string;
  @Prop({required:true})
  role: string

}


export const Teacher_adminSchema = SchemaFactory.createForClass(Teacher_admin);
Teacher_adminSchema.index({ organizationemailId: 1 }, { unique: true } );
