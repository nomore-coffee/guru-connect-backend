import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubadminDocument = Subadmin & Document;

const can_teac={
  'TYCS':['Physics','MAths'],
  'FYCS':['Chemistry','English']
}
@Schema({
  timestamps: true,
})
export class Subadmin {
  @Prop({required:true})//College ID
  organizationID: string;
  @Prop({required:true})//SuperAdmin name (i.e Principal)
  subadmin_name: string;
  @Prop({required:true})//SuperAdmin email
  subadmin_emailId: string;
  @Prop({required:true})
  can_teach:{};
  @Prop()
  cognitoId: string;
  @Prop()
  sub: string;
  @Prop({required:true})
  role: string

}

export const SubadminSchema = SchemaFactory.createForClass(Subadmin);
SubadminSchema.index({ emailId: 1 });


// Make constants for all input types for subadmin classes and subjects
// when ever subadmin logins for first time they have to select classes
// with respective to subjects  