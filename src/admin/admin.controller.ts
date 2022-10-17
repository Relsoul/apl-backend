import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { VlPipe } from '../vl.pipe';
import {
  ParamResultDto,
  QueryVoteCountArgsDto,
  QueryVoteCountDto,
  updateVoteDto,
} from './admin.dto';
import { buildResult } from '../utils/result';
import { AppService } from '../app.service';
import { AdminService } from './admin.service';
import * as dayjs from 'dayjs';
import { AuthGuard } from '../auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/vote')
  @UsePipes(VlPipe)
  async listVote() {
    const res = await this.adminService.listVote();
    return buildResult(1, `获取成功`, { res });
  }

  @Get('/vote/:id/')
  @UsePipes(VlPipe)
  async listVoteDetail(@Param() id: ParamResultDto) {
    const res = await this.adminService.listVoteDetail({ id });
    return buildResult(1, `获取成功`, { res });
  }

  @Get('/vote/:id/result')
  @UseGuards(AuthGuard)
  @UsePipes(VlPipe)
  async getVoteResult(@Param() param: ParamResultDto) {
    const id = param.id;
    const res = await this.adminService.listVoteDetail({ id });
    const hasEnd = dayjs().isAfter(dayjs(res.endTime));
    if (!hasEnd) {
      return buildResult(0, `当前选举未结束，请结束后再进行浏览`);
    }
    const voteResult = await this.adminService.getVoteResult({ voteId: id });
    return buildResult(1, `获取成功`, { res: voteResult });
  }

  @Get('/vote/:id/count/:candidateId?')
  @UseGuards(AuthGuard)
  @UsePipes(VlPipe)
  async listVoteCountDetail(
    @Param() param: QueryVoteCountDto,
    @Query() query: QueryVoteCountArgsDto,
  ) {
    let res;
    if (!param.candidateId) {
      res = await this.adminService.getUserVoteDetail({
        voteId: param.id,
      });
      return buildResult(1, `获取成功`, {
        res,
      });
    } else {
      const { countRes, queryRes } =
        await this.adminService.listCandidateDetail({
          candidateId: param.candidateId,
          voteId: param.id,
          page: Number(query.page),
        });
      return buildResult(1, `获取成功`, {
        res: {
          total: countRes,
          list: queryRes,
        },
      });
    }
  }

  @Post('/vote')
  @UseGuards(AuthGuard)
  @UsePipes(VlPipe)
  async createVote(@Body() body: updateVoteDto) {
    const startTime = dayjs(body.startTime);
    const endTime = dayjs(body.endTime);
    // 判断结束时间是否在开始时间之前
    const isBefore = endTime.isBefore(startTime);
    if (isBefore) {
      return buildResult(0, `结束时间不能小于开始时间`, {});
    }

    const res = await this.adminService.updateVote(body);
    return buildResult(1, `更新成功`, { res });
  }
}
