import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  async check() {
    return this.healthService.check();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'System is ready to serve traffic' })
  async ready() {
    return this.healthService.ready();
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'System is alive' })
  async live() {
    return this.healthService.live();
  }
}
