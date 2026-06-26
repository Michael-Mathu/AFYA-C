import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class CoreConfigModule {}
