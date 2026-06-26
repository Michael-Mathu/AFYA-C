import { AllergyResponseDto } from './allergy-response.dto';

export class PatientResponseDto {
  id: string;
  mrn: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phone?: string;
  email?: string;
  idType: string;
  idNumber: string;
  alternativePhone?: string;
  address?: any;
  allergies?: AllergyResponseDto[];
  insurance?: any;
  emergencyContact?: any;
  nextOfKin?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;
  updatedBy?: string;
}
