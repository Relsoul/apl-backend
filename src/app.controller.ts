import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UsePipes,
  Request,
} from '@nestjs/common';
import { AppService } from './app.service';
import { VlPipe } from './vl.pipe';
import { UserVoteBodyDto, UserVoteParamDto } from './app.dto';
import { buildResult } from './utils/result';
import { DtoValid } from './custom.decorator';
import { AdminService } from './admin/admin.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/vote/:id')
  @UsePipes(VlPipe)
  async userVote(
    @DtoValid({
      paramList: ['params', 'body'],
    })
    body: UserVoteBodyDto,
    @Param()
    param: UserVoteParamDto, // 优先验证param
  ) {
    const res = await this.appService.userVote({ id: param.id, body });
    const voteRes = await this.adminService.getUserVoteDetail({
      voteId: param.id,
    });
    return buildResult(1, `获取成功`, { voteRes });
  }
}
