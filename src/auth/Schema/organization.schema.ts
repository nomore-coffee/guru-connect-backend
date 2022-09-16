import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({
  timestamps: true,
})
export class Organization {
  @Prop({required:true})//College ID
  organizationID: string;
  @Prop({required:true})//College Name
  organizationName: string;
  @Prop({required:true})//College Email
  organizationemailId: string;
  @Prop()
  cognitoId: string;
  @Prop({required:true})
  role: string
  @Prop({required:true})
  subscribe:string
}


export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.index({ organizationemailId: 1 }, { unique: true } );
