export class MedicationResponseDto {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  strength?: string;
  form?: string;
  unitPrice?: number;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  totalStock: number;
  createdAt: Date;
  updatedAt?: Date;
}