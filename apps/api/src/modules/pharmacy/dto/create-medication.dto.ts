export class CreateMedicationDto {
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  strength?: string;
  form?: string;
  unitPrice?: number;
  currentStock?: number;
  minimumStock?: number;
}