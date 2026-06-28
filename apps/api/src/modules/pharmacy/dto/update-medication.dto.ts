export class UpdateMedicationDto {
  name?: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  strength?: string;
  form?: string;
  unitPrice?: number;
  currentStock?: number;
  minimumStock?: number;
  isActive?: boolean;
}