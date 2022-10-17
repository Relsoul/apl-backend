import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Candidate, CandidateDocument } from './candidate.schema';
import { VoteDocument } from './vote.schema';

export type EmailDocument = Email & Document;

@Schema({
  timestamps: true,
})
export class Email {
  /**
   * 用户邮箱
   */
  @Prop()
  userEmail: string;

  /**
   * 对应选举外建
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' })
  refVote: VoteDocument;

  /**
   * 发送状态
   */
  @Prop({
    default: 0,
  }) // 0未发送 1正在发送 2已发送
  status: 0 | 1 | 2;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
