import { Injectable } from '@nestjs/common';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  HasCandidate,
  HasCandidateConstraint,
  IsVoteAlreadyExist,
} from '../utils/customvalidator';
import { AdminService } from './admin.service';
import { AppService } from '../app.service';
import { Type } from 'class-transformer';

@Injectable()
export class updateVoteDto {
  /**
   * 选举人
   */
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayNotEmpty()
  @IsArray()
  candidate: string[];
  /**
   * 结束时间，不能早于开始时间，YYYY-MM-DD HH:mm:ss
   */
  @IsDateString()
  endTime: string;
  /**
   * 开始时间,YYYY-MM-DD HH:mm:ss
   */
  @IsDateString()
  startTime: string;
  /**
   * 选举名称
   */
  @IsNotEmpty()
  @IsString()
  title: string;
}

@Injectable()
export class QueryVoteCountDto {
  adminService: AdminService;
  appService: AppService;
  constructor(that) {
    this.adminService = that.adminService;
    this.appService = that.appService;
  }
  /**
   * 选举id
   */
  @IsVoteAlreadyExist(
    {},
    {
      message: '选举不存在',
    },
  )
  @IsMongoId()
  @IsString()
  @IsOptional()
  id: string[];

  /**
   * 选举对应的选举人id
   */
  @HasCandidate(
    {
      candidateKey: 'candidateId',
      voteIdKey: 'id',
    },
    {},
  )
  @IsMongoId()
  @IsString()
  @IsOptional()
  candidateId: string;
}

@Injectable()
export class QueryVoteCountArgsDto {
  adminService: AdminService;
  appService: AppService;
  constructor(that) {
    this.adminService = that.adminService;
    this.appService = that.appService;
  }
  /**
   * 分页
   */
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page: string;
}

@Injectable()
export class ParamResultDto {
  adminService: AdminService;
  appService: AppService;
  constructor(that) {
    this.adminService = that.adminService;
    this.appService = that.appService;
  }
  /**
   * 选举id
   */
  @IsVoteAlreadyExist(
    {},
    {
      message: '选举不存在',
    },
  )
  @IsMongoId()
  @IsString()
  @IsOptional()
  id: string[];
}
