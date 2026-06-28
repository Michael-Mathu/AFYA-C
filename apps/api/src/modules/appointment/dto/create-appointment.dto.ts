export class CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  typeId: string;
  appointmentDate: string;
  reason?: string;
  notes?: string;
}