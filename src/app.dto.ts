import { Injectable } from '@nestjs/common';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { AdminService } from './admin/admin.service';
import { AppService } from './app.service';
import {
  HasCandidate,
  HasUserVoteByIdCard,
  IsBetweenVoteHours,
  IsVoteAlreadyExist,
} from './utils/customvalidator';

@Injectable()
export class UserVoteParamDto {
  adminService: AdminService;
  appService: AppService;
  constructor(that) {
    this.adminService = that.adminService;
    this.appService = that.appService;
  }

  @IsBetweenVoteHours(
    {},
    {
      message: '选举时间未开始或已结束',
    },
  )
  @IsVoteAlreadyExist(
    {},
    {
      message: '选举 $value 不存在',
    },
  )
  @IsMongoId()
  @IsString()
  id: string;
}

@Injectable()
export class UserVoteBodyDto {
  adminService: AdminService;
  appService: AppService;
  constructor(that) {
    this.adminService = that.adminService;
    this.appService = that.appService;
  }

  @HasUserVoteByIdCard(
    {},
    {
      message: '用户已经投票',
    },
  )
  @Matches(/^((\s?[A-Za-z])|([A-Za-z]{2}))\d{6}((\([0-9aA]\))|([0-9aA]))$/)
  @IsNotEmpty()
  @IsString()
  idCard: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @HasCandidate(
    {},
    {
      message: '未找到选举人',
    },
  )
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  candidate: string;
}
