import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('config')
@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('app')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get application configuration' })
  @ApiResponse({ status: 200, description: 'Application config' })
  getAppConfig(@Request() req) {
    return this.configService.getApp();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public configuration (no auth required)' })
  @ApiResponse({ status: 200, description: 'Public config' })
  getPublicConfig() {
    return {
      appName: 'AFYA-C',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      currency: process.env.CURRENCY_CODE || 'KES',
      timezone: process.env.TZ || 'Africa/Nairobi',
    };
  }
}
