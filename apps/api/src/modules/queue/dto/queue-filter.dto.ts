export class QueueFilterDto {
  page?: number = 1;
  limit?: number = 10;
  status?: string;
  department?: string;
  patientId?: string;
  doctorId?: string;
}