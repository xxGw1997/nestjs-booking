import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { redisConfig } from '@/config';
import { ConfigModule, ConfigType } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      inject: [redisConfig.KEY],
      async useFactory(config: ConfigType<typeof redisConfig>) {
        const client = createClient({
          socket: {
            host: config.host,
            port: +config.port,
          },
          database: +config.database,
        });

        await client.connect();
        return client;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
