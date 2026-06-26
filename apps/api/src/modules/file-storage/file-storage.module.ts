import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { FileStorageController } from './file-storage.controller';

@Module({
  imports: [],
  controllers: [FileStorageController],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class FileStorageModule {}
