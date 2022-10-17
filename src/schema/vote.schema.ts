import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Candidate, CandidateDocument } from './candidate.schema';

export type VoteDocument = Vote & Document;

@Schema({
  timestamps: true,
})
export class Vote {
  /**
   * 选举名称
   */
  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  startTime: Date;

  @Prop({ type: mongoose.Schema.Types.Date })
  endTime: Date;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Candidate' })
  refCandidate: CandidateDocument[]; // 对应CandidateId
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
