export class QueueEntryResponseDto {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: {
    id: string;
    name: string;
  };
  department: string;
  priority: string;
  position: number;
  estimatedWaitTimeMinutes?: number;
  tokenNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  completedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedAt?: Date;
  completedAt?: Date;
  isActive: boolean;
}