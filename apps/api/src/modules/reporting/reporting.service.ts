import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Consultation } from '../consultation/entities/consultation.entity';
import { Bill } from '../billing/entities/bill.entity';
import { LabRequest } from '../lab/entities/lab-request.entity';
import { Prescription } from '../pharmacy/entities/prescription.entity';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(LabRequest)
    private labRequestsRepository: Repository<LabRequest>,
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async getDailySummary(
    user: User,
    date?: string
  ): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();

    // Patient-related statistics
    const patientsCount = await this.patientsRepository.count({
      where: {
        createdAt: targetDate,
      },
    });

    const patientsToday = await this.patientsRepository.count({
      where: {
        createdAt: targetDate,
      },
    });

    // Consultation statistics
    const consultationsCount = await this.consultationsRepository.count({\n      where: {
        consultationDate: targetDate.toISOString().split('T')[0],
      },
    });

    const completedConsultations = await this.consultationsRepository.count({
      where: {
        status: 'COMPLETED',
        consultationDate: targetDate.toISOString().split('T')[0],
      },
    });

    const signedConsultations = await this.consultationsRepository.count({
      where: {
        status: 'SIGNED',
        consultationDate: targetDate.toISOString().split('T')[0],
      },
    });

    // Lab statistics
    const labRequestsToday = await this.labRequestsRepository.count({
      where: {
        createdAt: targetDate,
      },
    });

    const completedLabRequests = await this.labRequestsRepository.count({
      where: {
        status: 'COMPLETED',
        createdAt: targetDate,
      },
    });

    // Prescription statistics
    const prescriptionsToday = await this.prescriptionsRepository.count({
      where: {
        createdAt: targetDate,
      },
    });

    const dispensedPrescriptions = await this.prescriptionsRepository.count({
      where: {
        status: 'DISPENSED',
        createdAt: targetDate,
      },
    });

    // Billing statistics
    const billsToday = await this.billsRepository.count({
      where: {
        billDate: targetDate.toISOString().split('T')[0],
      },
    });

    const paidBillsToday = await this.billsRepository.count({
      where: {
        status: 'PAID',
        billDate: targetDate.toISOString().split('T')[0],
      },
    });

    const totalRevenue = await this.billsRepository
      .createQueryBuilder('bill')
      .select('SUM(bill.net_amount)', 'total')
      .where('bill.bill_date = :date', { date: targetDate.toISOString().split('T')[0] })
      .andWhere('bill.status = :status', { status: 'PAID' })
      .getRawOne();

    // Top diagnoses (from consultation diagnoses)
    const topDiagnoses = await this.consultationsRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.diagnoses', 'diagnosis')
      .select('diagnosis.description', 'diagnosis')
      .addSelect('COUNT(*)', 'count')
      .where('consultation.consultation_date = :date', { date: targetDate.toISOString().split('T')[0] })
      .groupBy('diagnosis.description')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      date: targetDate.toISOString().split('T')[0],
      patients: {
        total: patientsCount,
        today: patientsToday,
      },
      consultations: {
        total: consultationsCount,
        completed: completedConsultations,
        signed: signedConsultations,
      },
      lab: {
        requested: labRequestsToday,
        completed: completedLabRequests,
      },
      prescriptions: {
        total: prescriptionsToday,
        dispensed: dispensedPrescriptions,
      },
      billing: {
        billsGenerated: billsToday,
        paymentsReceived: paidBillsToday,
        revenue: totalRevenue?.total || 0,
      },
      topDiagnoses,
    };
  }

  async getDailyRevenue(
    user: User,
    date?: string
  ): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();

    const bills = await this.billsRepository.find({
      where: {
        billDate: targetDate.toISOString().split('T')[0],
        status: 'PAID',
      },
    });

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
    const serviceBreakdown = this.getServiceBreakdown(bills);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalRevenue,
      billsCount: bills.length,
      services: serviceBreakdown,
    };
  }

  async getMonthlyRevenue(
    user: User,
    month?: string,
    year?: number
  ): Promise<any> {
    const targetDate = month && year ? new Date(year, new Date().getMonth()) : new Date();
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const whereClause: any = {
      billDate: startOfMonth.toISOString().split('T')[0],
    };

    if (!month && !year) {
      whereClause.billDate = {
        $gte: startOfMonth.toISOString().split('T')[0],
        $lte: endOfMonth.toISOString().split('T')[0],
      };
    }

    const bills = await this.billsRepository.find({
      where: whereClause,
    });

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
    const billsCount = bills.length;

    return {
      month: targetDate.toLocaleString('default', { month: 'long' }),
      year: targetDate.getFullYear(),
      totalRevenue,
      billsCount,
      averageBillValue: billsCount > 0 ? totalRevenue / billsCount : 0,
    };
  }

  async getPatientDemographics(
    user: User,
    ageGroup?: string,
    gender?: string
  ): Promise<any> {
    let query = this.patientsRepository.createQueryBuilder('patient');

    if (ageGroup) {
      // Simple age group filtering (in real implementation, use more precise logic)
      if (ageGroup === '0-18') {
        query = query.where('patient.age <= 18');
      } else if (ageGroup === '19-35') {
        query = query.where('patient.age >= 19 and patient.age <= 35');
      } else if (ageGroup === '36-60') {
        query = query.where('patient.age >= 36 and patient.age <= 60');
      } else if (ageGroup === '61+') {
        query = query.where('patient.age > 60');
      }
    }

    if (gender) {
      query = query.where('patient.gender = :gender', { gender });
    }

    const patients = await query.getMany();

    // Count by gender
    const genderCounts = patients.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {});

    // Age distribution
    const ageDistribution = patients.reduce((acc, patient) => {
      const age = patient.age || 0;
      if (age < 18) acc['0-18'] = (acc['0-18'] || 0) + 1;
      else if (age < 36) acc['19-35'] = (acc['19-35'] || 0) + 1;
      else if (age < 61) acc['36-60'] = (acc['36-60'] || 0) + 1;
      else acc['61+'] = (acc['61+'] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPatients: patients.length,
      genderDistribution: genderCounts,
      ageDistribution,
    };
  }

  async getDiagnosesFrequency(
    user: User,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<any[]> {
    let query = this.consultationsRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.diagnoses', 'diagnosis')
      .select('diagnosis.description', 'diagnosis')
      .addSelect('COUNT(*)', 'count')
      .where('diagnosis.description IS NOT NULL');

    if (startDate) {
      query = query.andWhere('consultation.consultation_date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('consultation.consultation_date <= :endDate', { endDate });
    }

    query = query
      .groupBy('diagnosis.description')
      .orderBy('count', 'DESC')
      .limit(limit || 10);

    return query.getRawMany();
  }

  async getRevenueByDepartment(
    user: User,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    // This is a simplified version - in practice would need more complex joins
    const departments = ['General', 'Pediatrics', 'OBGYN', 'Cardiology', 'Dermatology'];
    const revenueData = {};

    for (const department of departments) {
      const bills = await this.billsRepository.find({
        where: {
          billDate: startDate || new Date().toISOString().split('T')[0],
          status: 'PAID',
        },
      });

      const departmentRevenue = bills.reduce((sum, bill) => sum + bill.netAmount, 0) * 0.1; // 10% per department (simplified)
      revenueData[department] = {
        revenue: departmentRevenue,
        percentage: 10,
        billCount: bills.length,
      };
    }

    return revenueData;
  }

  async getAppointmentAdherence(
    user: User,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const targetStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const targetEndDate = endDate ? new Date(endDate) : new Date();

    const appointments = await this.consultationsRepository
      .createQueryBuilder('consultation')
      .where('consultation.consultation_date >= :startDate', { startDate: targetStartDate.toISOString().split('T')[0] })
      .andWhere('consultation.consultation_date <= :endDate', { endDate: targetEndDate.toISOString().split('T')[0] })
      .getMany();n
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
    const noShowAppointments = appointments.filter(a => a.status === 'NO_SHOW').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length;

    const adherenceRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    return {
      period: {
        start: targetStartDate.toISOString().split('T')[0],
        end: targetEndDate.toISOString().split('T')[0],
      },
      totalAppointments,
      completedAppointments,
      noShowAppointments,
      cancelledAppointments,
      adherenceRate,
      appointmentTypes: {
        completed: completedAppointments,
        noShow: noShowAppointments,
        cancelled: cancelledAppointments,
      },
    };
  }

  async getStockUsage(
    user: User,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const targetEndDate = endDate ? new Date(endDate) : new Date();
    const targetStartDate = startDate ? new Date(startDate) : new Date(targetEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all bills in the date range
    const bills = await this.billsRepository.find({
      where: {
        billDate: targetStartDate.toISOString().split('T')[0],
      },
    });

    // Calculate usage for each medication category
    const categories = ['MEDICATION', 'SUPPLIES', 'EQUIPMENT', 'LAB_REAGENT'];
    const usageData = {};

    for (const category of categories) {
      const categoryBills = await this.billsRepository.find({
        where: {
          billDate: targetStartDate.toISOString().split('T')[0],
          '$and': [{ status: 'PAID' }],
        },
      });n
      const categoryUsage = categoryBills.reduce((sum, bill) => sum + bill.netAmount * 0.25, 0); // Simplified calculation
      usageData[category] = {
        quantityUsed: Math.floor(categoryUsage / 100), // Simplified
        totalCost: categoryUsage,
        percentage: 25, // Simplified
      };
    }

    return usageData;
  }

  async getPatientVisits(
    user: User,
    startDate?: string,
    endDate?: string,
    department?: string
  ): Promise<any> {
    let query = this.consultationsRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.patient', 'patient')
      .select('patient.id', 'patientId')
      .addSelect('patient.firstName', 'firstName')
      .addSelect('patient.lastName', 'lastName')
      .addSelect('COUNT(*)', 'visitCount')
      .groupBy('patient.id')
      .addGroupBy('patient.firstName')
      .addGroupBy('patient.lastName');

    if (startDate) {
      query = query.where('consultation.consultation_date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('consultation.consultation_date <= :endDate', { endDate });
    }

    if (department) {
      query = query.andWhere('consultation.department = :department', { department });
    }

    query = query.orderBy('visitCount', 'DESC').limit(20);

    const results = await query.getRawMany();

    return results.map(result => ({
      patientId: result.patientId,
      name: `${result.firstName} ${result.lastName}`,
      visitCount: parseInt(result.visitCount),
    }));
  }

  private getServiceBreakdown(bills: any[]): any {
    const breakdown = {
      consultation: 0,
      lab: 0,
      medication: 0,
      procedure: 0,
      other: 0,
    };

    for (const bill of bills) {
      const billItems = bill.items || [];
      for (const item of billItems) {
        if (item.itemType in breakdown) {
          breakdown[item.itemType] += item.totalPrice;
        } else {
          breakdown.other += item.totalPrice;
        }
      }
    }

    return breakdown;
  }
}
