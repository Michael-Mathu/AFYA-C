import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BillResponseDto } from './dto/bill-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @Roles('RECEPTIONIST', 'ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Generate bill from services rendered' })
  @ApiResponse({ status: 201, description: 'Bill generated' })
  @ApiBody({ type: CreateBillDto })
  async create(
    @Body() createBillDto: CreateBillDto,
    @Request() req
  ): Promise<BillResponseDto> {
    return this.billingService.create(createBillDto, req.user);
  }

  @Get()
  @Roles('RECEPTIONIST', 'ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'List bills (filter: patient, date, status)' })
  @ApiResponse({ status: 200, description: 'List of bills' })
  async findAll(
    @Request() req
  ): Promise<BillResponseDto[]> {
    return this.billingService.findAll(req.user);
  }

  @Post(':id/pay')
  @Roles('CASHIER', 'ADMIN')
  @ApiOperation({ summary: 'Record payment (cash or M-Pesa)' })
  @ApiResponse({ status: 200, description: 'Payment recorded' })
  @ApiBody({ type: CreatePaymentDto })
  async recordPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req
  ): Promise<PaymentResponseDto> {
    return this.billingService.recordPayment(id, createPaymentDto, req.user);
  }

  @Post(':id/mpesa-push')
  @Roles('CASHIER', 'ADMIN')
  @ApiOperation({ summary: 'Initiate M-Pesa STK Push' })
  @ApiResponse({ status: 200, description: 'STK Push initiated' })
  async initiateMpesa(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string; mpesaRequestId?: string }> {
    return this.billingService.initiateMpesa(id, req.user);
  }

  @Get('revenue/daily')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Daily revenue summary' })
  @ApiResponse({ status: 200, description: 'Daily revenue data' })
  async getDailyRevenue(
    @Request() req
  ): Promise<{ date: string; total: number; count: number; services: any }> {
    return this.billingService.getDailyRevenue(req.user);
  }

  @Get('revenue/monthly')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Monthly revenue summary' })
  @ApiResponse({ status: 200, description: 'Monthly revenue data' })
  async getMonthlyRevenue(
    @Request() req
  ): Promise<{ month: string; year: number; total: number; count: number }> {
    return this.billingService.getMonthlyRevenue(req.user);
  }
}
