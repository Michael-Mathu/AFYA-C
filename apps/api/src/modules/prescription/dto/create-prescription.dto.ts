export class CreatePrescriptionDto {
  patientId: string;
  consultationId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string;
  durationDays?: number;
  quantity?: number;
  instructions?: string;
  isAiSuggested?: boolean;
  aiConfidence?: number;
}