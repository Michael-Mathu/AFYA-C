import { Injectable, NotFoundException, ConflictException, InjectRepository, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import { User } from '../core/entities/user.entity';
import { Consultation } from '../consultation/entities/consultation.entity';
import { Prescription } from '../pharmacy/entities/prescription.entity';
import { LabRequest } from '../lab/entities/lab-request.entity';
import { Bill } from './entities/bill.entity';
import { BillItem } from './entities/bill-item.entity';
import { Payment } from './entities/payment.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(LabRequest)
    private labRequestsRepository: Repository<LabRequest>,
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(BillItem)
    private billItemsRepository: Repository<BillItem>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async create(
    createBillDto: CreateBillDto,
    createdBy: User
  ): Promise<any> {
    const { patientId, items } = createBillDto;

    const patient = await this.patientsRepository.findOne({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Generate bill number
    const billNumber = await this.generateBillNumber();

    // Create bill header
    const bill = this.billsRepository.create({
      patient,
      billNumber,
      billDate: new Date(),
      totalAmount: 0,
      discount: 0,
      taxAmount: 0, // VAT in Kenya: 16%
      netAmount: 0,
      status: 'PENDING',
      createdBy,
    });

    const savedBill = await this.billsRepository.save(bill);

    let totalAmount = 0;

    // Create bill items from consultation items
    for (const item of items) {
      let itemName = 'Unknown';
      let unitPrice = 0;
      let quantity = 1;

      switch (item.type) {
        case 'consultation':
          const consultation = await this.consultationsRepository.findOne({
            where: { id: item.id },
          });
          if (consultation) {
            itemName = 'Medical Consultation';
            unitPrice = 1000; // Standard consultation fee
            quantity = 1;
          }
          break;

        case 'prescription':
          const prescription = await this.prescriptionsRepository.findOne({
            where: { id: item.id },
            relations: ['consultation'],
          });
          if (prescription) {
            itemName = prescription.medicationName || 'Medication';
            unitPrice = 500; // Average medication cost
            quantity = 1;
          }
          break;

        case 'lab':
          const labRequest = await this.labRequestsRepository.findOne({
            where: { id: item.id },
            relations: ['labTestCatalogue'],
          });
          if (labRequest && labRequest.labTestCatalogue) {
            itemName = labRequest.labTestCatalogue.name;
            unitPrice = labRequest.labTestCatalogue.price;
            quantity = 1;
          }
          break;
      }

      const billItem = this.billItemsRepository.create({
        bill: savedBill,
        itemType: item.type,
        itemId: item.id,
        itemName,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });

      await this.billItemsRepository.save(billItem);
      totalAmount += billItem.totalPrice;
    }

    // Update bill totals
    const taxAmount = totalAmount * 0.16; // 16% VAT in Kenya
    const netAmount = totalAmount + taxAmount;

    savedBill.totalAmount = totalAmount;
    savedBill.taxAmount = taxAmount;
    savedBill.netAmount = netAmount;
    savedBill.balance = netAmount;

    const finalBill = await this.billsRepository.save(savedBill);

    return this.sanitizeBill(finalBill);
  }

  async findAll(user: User): Promise<any[]> {
    const whereClause: any = {};

    if (user.role?.name === 'CASHIER' && user.role?.name !== 'ADMIN') {
      whereClause.status = 'PENDING';
    }

    const bills = await this.billsRepository.find({
      where: whereClause,
      relations: ['patient', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    return bills.map(bill => this.sanitizeBill(bill));
  }

  async recordPayment(
    id: string,
    createPaymentDto: CreatePaymentDto,
    paidBy: User
  ): Promise<any> {
    const { amount, paymentMethod, mpesaPhone, referenceNumber } = createPaymentDto;

    const bill = await this.billsRepository.findOne({
      where: { id },
      relations: ['patient', 'createdBy'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    if (bill.status === 'PAID') {
      throw new ConflictException('Bill already paid');
    }

    const paymentAmount = amount || bill.balance;

    if (paymentAmount > bill.balance) {
      throw new ConflictException(
        `Payment amount (${paymentAmount}) exceeds bill balance (${bill.balance})`
      );
    }

    const payment = this.paymentsRepository.create({
      bill,
      patient: bill.patient,
      amount: paymentAmount,
      paymentMethod,
      mpesaPhone,
      referenceNumber,
      receivedBy: paidBy,
      paymentDate: new Date(),
    });

    await this.paymentsRepository.save(payment);

    // Update bill status and balance
    bill.balance -= paymentAmount;
    
    if (bill.balance <= 0) {
      bill.balance = 0;
      bill.status = 'PAID';
      bill.paidAmount = bill.netAmount - bill.balance;
      bill.paymentMethod = paymentMethod;
    } else {
      bill.status = 'PARTIALLY_PAID';
    }

    bill.updatedBy = paidBy;
    bill.updatedAt = new Date();

    const updatedBill = await this.billsRepository.save(bill);

    // If payment method is MPESA, simulate callback processing
    if (paymentMethod === 'MPESA') {
      // In a real implementation, this would trigger async processing
      // For now, we'll assume successful payment if amount matches
      if (paymentAmount === bill.netAmount) {
        bill.status = 'PAID';
        await this.billsRepository.save(bill);
      }
    }

    return {
      ...this.sanitizePayment(payment),
      bill: this.sanitizeBill(updatedBill),
    };
  }

  async initiateMpesa(
    id: string,
    user: User
  ): Promise<{ message: string; mpesaRequestId?: string }> {
    const bill = await this.billsRepository.findOne({
      where: { id },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    if (bill.status === 'PAID') {
      throw new ConflictException('Bill already paid');
    }

    // In a real implementation, this would call the M-Pesa Daraja API
    // For this demo, we'll return a mock response
    const mpesaRequestId = `mpesa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      message: `M-Pesa STK Push initiated for KES ${bill.netAmount}. Please check your phone for the payment prompt.",
      mpesaRequestId,
    };
  }

  async getDailyRevenue(user: User): Promise<{ date: string; total: number; count: number; services: any }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereClause: any = {
      createdAt: today,
    };

    if (user.role?.name === 'CASHIER' && user.role?.name !== 'ADMIN') {
      whereClause.createdBy = { id: user.id };
    }

    const bills = await this.billsRepository.find({
      where: whereClause,
    });

    const total = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
    const count = bills.length;

    // Service breakdown
    const services = await this.getServiceBreakdown(bills);

    return {
      date: today.toISOString().split('T')[0],
      total,
      count,
      services,
    };
  }

  async getMonthlyRevenue(user: User): Promise<{ month: string; year: number; total: number; count: number }> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const whereClause: any = {
      createdAt: startOfMonth,
    };

    if (user.role?.name === 'CASHIER' && user.role?.name !== 'ADMIN') {
      whereClause.createdBy = { id: user.id };
    }

    const bills = await this.billsRepository.find({
      where: whereClause,
    });

    const total = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
    const count = bills.length;

    return {
      month: startOfMonth.toLocaleString('default', { month: 'long' }),
      year: startOfMonth.getFullYear(),
      total,
      count,
    };
  }

  private async generateBillNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const prefix = 'INV';

    const latestBill = await this.billsRepository
      .createQueryBuilder('bill')
      .where('bill.billNumber LIKE :pattern', { pattern: `${prefix}-${year}%` })
      .orderBy('bill.billNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (latestBill) {
      const match = latestBill.billNumber.match(/INV-(\d{4})-(\d+)/);
      if (match) {
        sequence = parseInt(match[2]) + 1;
      }
    }

    return `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`;
  }

  private async getServiceBreakdown(bills: any[]): Promise<any> {
    const breakdown = {};

    for (const bill of bills) {
      const items = await this.billItemsRepository.find({
        where: { bill: { id: bill.id } },
      });

      for (const item of items) {
        if (!breakdown[item.itemType]) {
          breakdown[item.itemType] = 0;
        }
        breakdown[item.itemType] += item.totalPrice;
      }
    }

    return breakdown;
  }

  private sanitizeBill(bill: any): any {
    const { createdBy, updatedBy, ...rest } = bill;

    return {
      ...rest,
      createdBy: createdBy ? {
        id: createdBy.id,
        username: createdBy.username,
        email: createdBy.email,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      } : undefined,
      updatedBy: updatedBy ? {
        id: updatedBy.id,
        username: updatedBy.username,
        email: updatedBy.email,
        firstName: updatedBy.firstName,
        lastName: updatedBy.lastName,
      } : undefined,
    };
  }

  private sanitizePayment(payment: any): any {
    const { bill, ...rest } = payment;

    return {
      ...rest,
      bill: bill ? this.sanitizeBill(bill) : undefined,
    };
  }
}
