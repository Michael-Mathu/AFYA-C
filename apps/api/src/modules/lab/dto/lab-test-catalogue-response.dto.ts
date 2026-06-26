import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LabTestCatalogueResponseDto {
  id: string;
  name: string;
  shortCode?: string;
  category: string;
  sampleType?: string;
  turnaroundHours?: number;
  price: number;
  isPanel: boolean;
  parentId?: string;
  isPanel: boolean;
  parent?: {
    id: string;
    name: string;
    shortCode: string;
  };
}

export class LabRequestResponseDto {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  labTestCatalogueId: string;
  priority: string;
  clinicalNotes?: string;
  status: string;
  specimenType?: string;
  specimenCollectedAt?: Date;
  specimenCollectedBy?: string;
  resultValue?: string;
  resultJson?: any;
  resultNote?: string;
  isAbnormal?: boolean;
  resultedBy?: string;
  resultedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  labTestCatalogue?: {
    id: string;
    name: string;
    shortCode?: string;
    category: string;
  };
  consultation?: {
    id: string;
    consultationDate: Date;
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}
