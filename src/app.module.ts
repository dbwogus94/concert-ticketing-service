import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Redis from 'ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ConvertExceptionInterceptor,
  ConvertResponseInterceptor,
  getTypeOrmModuleAsyncOptions,
  KAFKA_CLIENT_NAME,
  RedisCacheStore,
} from './common';
import { DomainModule } from './domain';
import { AopModule, CustomLoggerModule, RedisModule } from './global';

const cacheRedis = new Redis({ db: 0 });
const clientRedis = new Redis({ db: 1 });

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      ...getTypeOrmModuleAsyncOptions(),
    }),
    CacheModule.register({
      store: new RedisCacheStore(cacheRedis),
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ClientsModule.register({
      isGlobal: true,
      clients: [
        {
          name: KAFKA_CLIENT_NAME,
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'concert',
              brokers: ['localhost:9094'],
              retry: {
                retries: 2,
              },
            },
            consumer: {
              groupId: 'concert-consumer',
              heartbeatInterval: 3000 * 3, // 주기가 짧을 수록 리벨런싱 속도가 빠르다
              retry: {
                retries: 2,
              },
            },
          },
        },
      ],
    }),

    /* custom module */
    CustomLoggerModule.forRoot(),
    AopModule.forRoot(),
    RedisModule.forRoot(clientRedis),
    DomainModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 전역 응답 포멧팅 처리
    { provide: APP_INTERCEPTOR, useClass: ConvertResponseInterceptor },
    // 전역 예외 처리
    { provide: APP_INTERCEPTOR, useClass: ConvertExceptionInterceptor },
  ],
})
export class AppModule {}
