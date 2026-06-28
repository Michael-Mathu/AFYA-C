export class AppointmentResponseDto {
  id: string;
  type: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  appointmentDate: string;
  reason?: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  cancelledBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  completedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  cancelledAt?: Date;
  completedAt?: Date;
}