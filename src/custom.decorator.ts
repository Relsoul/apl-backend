import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 合并至对象进行统一处理
 */
export const DtoValid = createParamDecorator(
  (
    data: {
      paramList: Array<'body' | 'params' | 'query' | 'headers'>;
    },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    let obj = {};

    for (const i of data.paramList) {
      obj = {
        ...obj,
        ...request[i],
      };
    }

    return obj;
  },
);
export const Custom = (...args: string[]) => SetMetadata('custom', args);
