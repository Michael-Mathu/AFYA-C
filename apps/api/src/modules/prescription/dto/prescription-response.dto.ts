export class PrescriptionResponseDto {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  prescribedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  consultation?: {
    id: string;
    consultationDate: string;
  };
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string;
  durationDays?: number;
  quantity?: number;
  instructions?: string;
  status: string;
  isAiSuggested: boolean;
  aiConfidence?: number;
  createdAt: Date;
  updatedAt?: Date;
  dispensedAt?: Date;
}