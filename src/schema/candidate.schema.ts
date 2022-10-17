import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({
  timestamps: true,
})
export class Candidate {
  /**
   * 选举人名
   */
  @Prop({ unique: true })
  nick: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
