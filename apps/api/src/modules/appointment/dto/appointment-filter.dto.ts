export class AppointmentFilterDto {
  page?: number = 1;
  limit?: number = 10;
  status?: string;
  type?: string;
  date?: string;
  patientId?: string;
  doctorId?: string;
}