import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { InjectModel, Prop } from '@nestjs/mongoose';
import { Vote, VoteDocument } from './schema/vote.schema';
import mongoose, { Model } from 'mongoose';
import { VoteLog, VoteLogDocument } from './schema/vote-log.schema';
import { Candidate, CandidateDocument } from './schema/candidate.schema';
import { UserVoteBodyDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Vote.name)
    private voteModel: Model<VoteDocument>,
    @InjectModel(VoteLog.name)
    private voteLogModel: Model<VoteLogDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async userVote({ id, body }: { body: UserVoteBodyDto; id: string }) {
    await this.voteLogModel.create({
      refVote: new mongoose.Types.ObjectId(id),
      refCandidate: new mongoose.Types.ObjectId(body.candidate), // 对应CandidateId
      userEmail: body.email,
      userIdCard: body.idCard,
    });
  }
}
