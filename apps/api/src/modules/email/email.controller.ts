import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiBody({ type: SendEmailDto })
  async sendEmail(
    @Body() sendEmailDto: SendEmailDto,
    @Request() req
  ): Promise<{ message: string }> {
    return this.emailService.sendEmail(sendEmailDto);
  }

  @Post('send-bulk')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Send bulk email notifications' })
  @ApiResponse({ status: 200, description: 'Emails sent successfully' })
  async sendBulkEmails(
    @Body() bulkEmailDto: { recipients: string[]; subject: string; template: string; data: any },
    @Request() req
  ): Promise<{ message: string; sent: number; failed: number }> {
    return this.emailService.sendBulkEmails(bulkEmailDto, req.user);
  }

  @Post('templates')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create email template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async createTemplate(
    @Body() templateDto: { name: string; subject: string; body: string; category: string },
    @Request() req
  ): Promise<{ message: string }> {
    return this.emailService.createTemplate(templateDto, req.user);
  }
}
