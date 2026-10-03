import { Logger, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { ADDRESS_CACHE, redisAddressCache } from './address-cache.js';
import { GeocodeController } from './geocode.controller.js';
import { GeocodeService } from './geocode.service.js';
import { GoogleGeocoder } from './google-geocoder.js';

@Module({
  controllers: [GeocodeController],
  providers: [
    GeocodeService,
    GoogleGeocoder,
    {
      provide: ADDRESS_CACHE,
      useFactory: () => {
        const logger = new Logger('Redis');
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
          },
          // 接続できないときは、コマンドを溜めずに、すぐ失敗させる（キャッシュなしで動かす）
          disableOfflineQueue: true,
        });
        client.on('error', (error) => logger.warn(String(error)));
        client.connect().catch((error) => logger.warn(String(error)));
        return redisAddressCache(client);
      },
    },
  ],
})
export class GeocodeModule {}
