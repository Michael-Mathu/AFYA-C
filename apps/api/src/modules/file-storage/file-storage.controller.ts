import { Controller, Post, UploadedFile, UseGuards, Request, Get, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioClientService } from './minio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('file-storage')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FileStorageController {
  constructor(private readonly minioClientService: MinioClientService) {}

  @Post('upload')
  @Roles('DOCTOR', 'NURSE', 'ADMIN', 'LAB_TECH', 'PHARMACIST')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to MinIO' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiBody({ type: 'file' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ): Promise<{ url: string; filename: string }> {
    return this.minioClientService.uploadFile(file, req.user);
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download file from MinIO' })
  @ApiResponse({ status: 200, description: 'File download link' })
  async getFileUrl(@Param('filename') filename: string): Promise<{ url: string }> {
    return this.minioClientService.getFileUrl(filename);
  }

  @Delete(':filename')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete file from MinIO' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('filename') filename: string): Promise<{ message: string }> {
    return this.minioClientService.deleteFile(filename);
  }
}
