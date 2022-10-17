import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Vote, VoteSchema } from './schema/vote.schema';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { VoteLog, VoteLogSchema } from './schema/vote-log.schema';
import { Candidate, CandidateSchema } from './schema/candidate.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { Email, EmailSchema } from './schema/email.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory(configService: ConfigService) {
        console.log('链接', configService.get<string>('mongodb'));
        return {
          uri: configService.get<string>('mongodb'),
          // connectTimeoutMS: 1000,
          minPoolSize: 5,
          maxPoolSize: 100,
          // maxIdleTimeMS: 300,
          dbName: configService.get<string>('DBNAME') || 'test',
          retryDelay: 50,
          // socketTimeoutMS: 1000,
          // serverSelectionTimeoutMS: 100, // Keep trying to send operations for 5 seconds
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Vote.name, schema: VoteSchema },
      { name: VoteLog.name, schema: VoteLogSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Email.name, schema: EmailSchema },
    ]),
  ],
  controllers: [AppController, AdminController],
  providers: [
    {
      provide: 'ConfigService',
      useClass: ConfigService,
    },
    AppService,
    AdminService,
  ],
})
export class AppModule {}
