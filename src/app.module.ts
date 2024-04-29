import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { databaseConfig, configModuleLoadList } from './config';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configModuleLoadList,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: async (config: ConfigType<typeof databaseConfig>) => {
        return {
          type: 'mysql',
          host: config.host,
          port: +config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          autoLoadEntities: true,
          synchronize: true, //turn false in prod
        };
      },
    }),
    UserModule,
    RedisModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
