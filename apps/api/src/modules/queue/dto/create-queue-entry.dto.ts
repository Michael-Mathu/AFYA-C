export class CreateQueueEntryDto {
  patientId: string;
  doctorId: string;
  statusId: string;
  department: string;
  priority?: string;
  estimatedWaitTimeMinutes?: number;
  notes?: string;
}