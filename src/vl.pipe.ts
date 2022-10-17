import {
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { plainToClass, plainToClassFromExist } from 'class-transformer';
import { validate } from 'class-validator';
import { buildResult } from './utils/result';
import { AdminService } from './admin/admin.service';
import { AppService } from './app.service';

@Injectable()
export class VlPipe implements PipeTransform {
  adminService: any;
  appService: any;
  constructor(
    @Inject(AdminService) adminService?: any,
    @Inject(AppService) appService?: any,
  ) {
    this.adminService = adminService;
    this.appService = appService;
  }
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      return true;
    }

    const valid = metadata.metatype.bind(this);
    const cc = new valid(this);
    const object = plainToClassFromExist(cc, value);
    const errors = await validate(object, {
      forbidUnknownValues: true,
      stopAtFirstError: true,
    });
    if (errors.length > 0) {
      const _obj = {};
      for (const i of errors) {
        _obj[i.property] = Object.values(i.constraints);
      }

      throw new HttpException(buildResult(0, '验证错误', _obj), HttpStatus.OK);
    }
    return value;
  }
}
