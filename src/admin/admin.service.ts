import { Inject, Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vote, VoteDocument } from '../schema/vote.schema';
import { VoteLog, VoteLogDocument } from '../schema/vote-log.schema';
import { Candidate, CandidateDocument } from '../schema/candidate.schema';
import { updateVoteDto } from './admin.dto';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { Email, EmailDocument } from '../schema/email.schema';
import { MailSlurp } from 'mailslurp-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    @Inject('ConfigService')
    private configService: ConfigService,
    @InjectModel(Vote.name)
    private voteModel: Model<VoteDocument>,
    @InjectModel(Email.name)
    private emailModel: Model<EmailDocument>,
    @InjectModel(VoteLog.name)
    private voteLogModel: Model<VoteLogDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
  ) {}

  /**
   * 根据voteId和idCard获取投票的用户
   */
  async getVoteUserByVoteIdAndUserCard({ voteId, userCard }) {
    return this.voteLogModel
      .findOne({
        refVote: new mongoose.Types.ObjectId(voteId),
        userIdCard: userCard,
      })
      .exec();
  }

  /**
   * 获取创建的选举
   */
  async listVote() {
    return this.voteModel.find().sort({ updatedAt: -1 }).exec();
  }

  /**
   * 获取选举人投票详情
   */
  async listCandidateDetail({ voteId, candidateId, page = 1 }) {
    const limit = 10;
    const query = {
      refVote: new mongoose.Types.ObjectId(voteId),
      refCandidate: new mongoose.Types.ObjectId(candidateId),
    };
    const countRes = await this.voteLogModel.find(query).count();
    const queryRes = await this.voteLogModel
      .find(query)
      .populate('refCandidate refVote')
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ updatedAt: -1 })
      .exec();
    return {
      countRes,
      queryRes,
    };
  }

  /**
   * 获取用户投票的详情
   * @param voteId
   */
  async getUserVoteDetail({ voteId }) {
    return this.voteLogModel.aggregate([
      { $match: { refVote: new mongoose.Types.ObjectId(voteId) } },
      { $group: { _id: '$refCandidate', total: { $sum: 1 } } },
      {
        $lookup: {
          from: 'candidates', // 数据库中关联的集合名
          localField: '_id', // author文档中关联的字段
          foreignField: '_id', // book文档中关联的字段
          as: 'candidate', // 返回数据的字段名
        },
      },
      {
        $unwind: {
          path: '$candidate',
        },
      },
    ]);
  }

  /**
   * 获取选举详情
   * @param id
   */
  async listVoteDetail({ id }) {
    return this.voteModel
      .findOne({ _id: new mongoose.Types.ObjectId(id) })
      .sort({ updatedAt: -1 })
      .populate('refCandidate')
      .exec();
  }

  /**
   * 根据候选者名称查找候选者
   * @param nick
   */
  async findCandidateByNick(nick: string) {
    return this.candidateModel.findOne({ nick });
  }

  /**
   * 创建候选者
   * @param body
   */
  async createCandidate(body: Candidate) {
    return this.candidateModel.create(body);
  }

  /**
   * 创建投票
   * @param body
   */
  async updateVote(body: updateVoteDto) {
    const refCandidate = [];
    for (const i of body.candidate) {
      const find = await this.findCandidateByNick(i);
      if (find) {
        refCandidate.push(find.id);
      } else {
        const create = await this.createCandidate({ nick: i });
        refCandidate.push(create.id);
      }
    }
    delete body.candidate;
    const updateDoc = {
      ...body,
      refCandidate,
    };
    return await this.voteModel.create(updateDoc);
  }

  async findEndTimeVoteAndUsers() {
    const voteRes = await this.voteModel
      .find({
        endTime: { $lte: dayjs() },
      })
      .exec();
    const createEmailList = [];
    // 获取当前用户
    for (const i of voteRes) {
      const userRes = await this.voteLogModel
        .find({
          refVote: i._id,
        })
        .exec();

      for (const user of userRes) {
        const query = {
          userEmail: user.userEmail,
          refVote: i._id,
        };
        const createEmail = await this.emailModel.findOneAndUpdate(
          query,
          {
            ...query,
          },
          {
            upsert: true,
            new: true,
          },
        );
        createEmailList.push(createEmail);
      }
    }

    return createEmailList;

    console.log('voteRes', voteRes);
  }

  async getEmailUser() {
    const res = await this.emailModel.findOneAndUpdate(
      {
        status: 0,
      },
      {
        $set: { status: 1 },
      },
      {
        new: true,
      },
    );
    return res;
  }

  @Cron('0/60 * * * * *')
  async fillCloseVoteUserEmail() {
    console.log('每60秒运行 填充email');

    const res = await this.findEndTimeVoteAndUsers();
    console.log('res', res);
  }

  async getVoteResult({ voteId }) {
    const res = await this.getUserVoteDetail({ voteId });
    const voteDetail = await this.listVoteDetail({ id: voteId });
    const obj = {
      max: [],
      detail: res,
      voteDetail: voteDetail,
      titleTxt: '',
      bodyTxt: '',
    };
    const _arr = res.map((n) => {
      return n.total;
    });
    const maxNumber = Math.max(..._arr);
    const maxIndexArr = [];
    for (const i of res) {
      if (i.total === maxNumber) {
        maxIndexArr.push(i);
      }
    }
    obj.max = maxIndexArr;

    const titleTxt = `${voteDetail.title}最终选举结果`;
    let bodyTxt = maxIndexArr.length > 1 ? '获得并列第一:' : '获得第一:';
    for (const i of obj.max) {
      bodyTxt += `${i.candidate.nick} 票数:${i.total}\r\n`;
    }
    bodyTxt += `详情如下:${JSON.stringify(voteDetail)}`;
    obj.titleTxt = titleTxt;
    obj.bodyTxt = bodyTxt;

    return obj;
  }

  @Cron('0/60 * * * * *')
  async sendEmailCloseVoteUserEmail() {
    console.log('每60秒运行 发送email');

    const res = await this.getEmailUser();
    if (!res) {
      return;
    }
    const result = await this.getVoteResult({ voteId: res.refVote });

    const mailslurp = new MailSlurp({
      apiKey: this.configService.get('emailApiKey'),
    });
    const inbox = await mailslurp.createInbox();
    const options = {
      to: [res.userEmail],
      subject: result.titleTxt,
      body: result.bodyTxt,
    };
    try {
      const sent = await mailslurp.sendEmail(inbox.id, options);
    } catch (e) {
      // 发送出错
      console.error(`发送出错:${res.userEmail}`, e);
      //
      await this.emailModel.updateOne(
        {
          _id: res._id,
        },
        {
          status: 0,
        },
      );
      return false;
    }
    await this.emailModel.updateOne(
      {
        _id: res._id,
      },
      {
        status: 2,
      },
    );

    console.log('res', result);
  }
}
