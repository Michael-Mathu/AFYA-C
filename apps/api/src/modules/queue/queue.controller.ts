import { Controller, Get, Post, Delete, Put, Body, Param, Query, UseGuards, Request, Post as HttpPost } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { CreateQueueEntryDto } from './dto/create-queue-entry.dto';
import { QueueEntryResponseDto } from './dto/queue-entry-response.dto';
import { QueueFilterDto } from './dto/queue-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('queue')
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'List patient queue with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of queue entries' })
  async findAll(
    @Query() filterDto: QueueFilterDto,
    @Request() req
  ): Promise<{ data: QueueEntryResponseDto[]; total: number; page: number; limit: number }> {
    return this.queueService.findAll(filterDto, req.user);
  }

  @Get(':id')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Get queue entry by ID' })
  @ApiResponse({ status: 200, description: 'Queue entry details' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<QueueEntryResponseDto> {
    return this.queueService.findOne(id, req.user);
  }

  @Post()
  @Roles('PATIENT', 'RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Add patient to queue' })
  @ApiResponse({ status: 201, description: 'Patient added to queue successfully' })
  @ApiBody({ type: CreateQueueEntryDto })
  async create(
    @Body() createQueueEntryDto: CreateQueueEntryDto,
    @Request() req
  ): Promise<QueueEntryResponseDto> {
    return this.queueService.create(createQueueEntryDto, req.user);
  }

  @Post('assign/:department')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Assign next patient in queue' })
  @ApiResponse({ status: 200, description: 'Patient assigned successfully' })
  async assignNext(
    @Param('department') department: string,
    @Request() req
  ): Promise<QueueEntryResponseDto> {
    return this.queueService.assignNext(department, req.user);
  }

  @Put(':id/complete')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Mark patient as completed' })
  @ApiResponse({ status: 200, description: 'Patient completed successfully' })
  async complete(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    return this.queueService.complete(id, req.user);
  }

  @Delete(':id')
  @Roles('RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Remove patient from queue' })
  @ApiResponse({ status: 200, description: 'Patient removed from queue' })
  async remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    return this.queueService.cancel(id, req.user);
  }
}