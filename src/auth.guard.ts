import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AppService } from './app.service';
import { buildResult } from './utils/result';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('ConfigService')
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const headers = context.switchToHttp().getRequest().headers;
    if (!headers['access-token']) {
      throw new HttpException(
        buildResult(401, '授权验证错误,请传递token header', {}),
        HttpStatus.OK,
      );
      return false;
    }
    if (headers['access-token'] !== this.configService.get('adminToken')) {
      throw new HttpException(
        buildResult(401, '校验token失败，未授权访问', {}),
        HttpStatus.OK,
      );
    }

    // 附加到单次请求上
    return true;
  }
}
