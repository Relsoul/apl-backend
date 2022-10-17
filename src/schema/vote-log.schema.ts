import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Candidate } from './candidate.schema';
import { Vote } from './vote.schema';

export type VoteLogDocument = VoteLog & Document;

@Schema({
  timestamps: true,
})
export class VoteLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' })
  refVote: Vote;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' })
  refCandidate: Candidate; // 对应CandidateId

  @Prop()
  userEmail: string;

  @Prop()
  userIdCard: string;
}

export const VoteLogSchema = SchemaFactory.createForClass(VoteLog);
