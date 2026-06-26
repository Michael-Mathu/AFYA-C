import { IsString, IsUUID, IsNumber, IsEnum, IsDate, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BillResponseDto {
  id: string;
  patientId: string;
  billNumber: string;
  billDate: Date;
  totalAmount: number;
  discount: number;
  taxAmount: number;
  netAmount: number;
  paidAmount?: number;
  balance: number;
  status: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt?: Date;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
    phone?: string;
  };
  createdBy?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class PaymentResponseDto {
  id: string;
  billId: string;
  patientId: string;
  amount: number;
  paymentMethod: string;
  mpesaPhone?: string;
  mpesaTransactionId?: string;
  mpesaResultCode?: number;
  mpesaResultDesc?: string;
  referenceNumber?: string;
  receivedBy?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  paymentDate: Date;
  createdAt: Date;
  bill?: BillResponseDto;
}
