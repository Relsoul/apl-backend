import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.enableCors();
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await app.listen(7790);
}
process.on('uncaughtException', (err) => {
  console.error('有一个未捕获的错误', err);
  // process.exit(1); //强制性的（根据 Node.js 文档）
});
process.on('unhandledRejection', function (err, promise) {
  console.error('有Promise没有被捕获的失败函数', err);
});
bootstrap();
