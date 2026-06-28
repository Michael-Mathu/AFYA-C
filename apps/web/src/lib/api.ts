/**
 * Mock API Client - no backend needed.
 * All data is generated in-browser.
 * 
 * Credentials:
 *   patient@afya-c.com / password123
 *   doctor@afya-c.com  / password123
 *   admin@afya-c.com   / admin123
 */

interface MockResponse<T = any> {
  data: T;
  status: number;
}

// ============================================================
// MOCK DATABASE
// ============================================================

const USERS: Record<string, { password: string; user: any }> = {
  'patient@afya-c.com': {
    password: 'password123',
    user: { id: 'p001', firstName: 'John', lastName: 'Doe', email: 'patient@afya-c.com', phone: '+254712345678', role: { id: 'patient-role-id', name: 'PATIENT' } },
  },
  'doctor@afya-c.com': {
    password: 'password123',
    user: { id: 'd001', firstName: 'Sarah', lastName: 'Smith', email: 'doctor@afya-c.com', phone: '+254798765432', role: { id: 'doctor-role-id', name: 'DOCTOR' } },
  },
  'admin@afya-c.com': {
    password: 'admin123',
    user: { id: 'a001', firstName: 'Admin', lastName: 'User', email: 'admin@afya-c.com', phone: '+254700000000', role: { id: 'admin-role-id', name: 'ADMIN' } },
  },
};

const DOCTOR = USERS['doctor@afya-c.com'].user;

let appointments: any[] = [
  { id: 'a1', type: { id: 't1', name: 'General Consultation', durationMinutes: 30, price: 2000 }, doctor: DOCTOR, patient: { id: 'p001', firstName: 'John', lastName: 'Doe', mrn: 'MRN-001' }, appointmentDate: new Date(Date.now() + 86400000).toISOString(), reason: 'Annual checkup', status: 'SCHEDULED', createdAt: new Date().toISOString() },
  { id: 'a2', type: { id: 't2', name: 'Follow-up', durationMinutes: 15, price: 1000 }, doctor: DOCTOR, patient: { id: 'p001', firstName: 'John', lastName: 'Doe', mrn: 'MRN-001' }, appointmentDate: new Date(Date.now() + 172800000).toISOString(), reason: 'Blood pressure check', status: 'SCHEDULED', createdAt: new Date().toISOString() },
];

function getPatient() {
  const token = localStorage.getItem('afya_token') || '';
  let email = 'patient@afya-c.com';
  try { const d = JSON.parse(atob(token)); email = d.email; } catch {}
  const u = Object.values(USERS).find(x => x.user.email === email);
  return {
    id: u?.user.id || 'p001',
    firstName: u?.user.firstName || 'John',
    lastName: u?.user.lastName || 'Doe',
    mrn: 'MRN-001',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    phone: u?.user.phone || '+254712345678',
    email: u?.user.email || 'patient@afya-c.com',
    address: '123 Nairobi Street, Nairobi',
    idNumber: 'ID123456',
    allergies: [{ id: 'all-1', name: 'Penicillin', severity: 'MODERATE' }],
    insurance: { provider: 'NHIF', policyNumber: 'NHIF-001', expiryDate: '2024-12-31' },
    emergencyContact: { name: 'Jane Doe', phone: '+254712345679', relationship: 'Spouse' },
  };
}

// ============================================================
// TYPES
// ============================================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: { id: string; name: string };
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  idNumber?: string;
  allergies?: any[];
  insurance?: any;
  emergencyContact?: any;
}

export interface Appointment {
  id: string;
  type: { id: string; name: string; durationMinutes: number; price: number };
  doctor: User;
  patient: Patient;
  appointmentDate: string;
  reason?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  consultationDate: string;
  doctor: User;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnoses?: any[];
  prescriptions?: any[];
  labRequests?: any[];
  status: string;
}

export interface Bill {
  id: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  items: any[];
  payments: any[];
  createdAt: string;
}

// ============================================================
// MOCK API IMPLEMENTATIONS
// ============================================================

function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms));
}

export const authApi = {
  login: async (email: string, password: string): Promise<MockResponse<{ access_token: string; user: User }>> => {
    await delay();
    const u = USERS[email];
    if (!u || u.password !== password) {
      const err: any = new Error('Invalid credentials');
      err.response = { data: { message: 'Invalid credentials' }, status: 401 };
      throw err;
    }
    const access_token = btoa(JSON.stringify({ sub: u.user.id, email: u.user.email, role: u.user.role.name }));
    console.log(`[MOCK] Login: ${email}`);
    return { data: { access_token, user: u.user }, status: 200 };
  },
  register: async (data: any): Promise<MockResponse<{ message: string }>> => {
    await delay();
    return { data: { message: 'Registration successful' }, status: 201 };
  },
};

export const patientApi = {
  getProfile: async (): Promise<MockResponse<Patient>> => {
    await delay();
    return { data: getPatient(), status: 200 };
  },
  updateProfile: async (data: Partial<Patient>): Promise<MockResponse<Patient>> => {
    await delay();
    return { data: { ...getPatient(), ...data }, status: 200 };
  },
  getRecords: async (): Promise<MockResponse<MedicalRecord[]>> => {
    await delay();
    return { data: getRecords(), status: 200 };
  },
};

export const appointmentApi = {
  list: async (params?: any): Promise<MockResponse<{ data: Appointment[]; total: number }>> => {
    await delay();
    return { data: { data: [...appointments], total: appointments.length }, status: 200 };
  },
  get: async (id: string): Promise<MockResponse<Appointment>> => {
    await delay();
    return { data: appointments.find(a => a.id === id) || appointments[0], status: 200 };
  },
  create: async (data: any): Promise<MockResponse<Appointment>> => {
    await delay();
    const appt: any = {
      id: 'a' + Date.now(),
      type: { id: 't1', name: 'General Consultation', durationMinutes: 30, price: 2000 },
      doctor: DOCTOR,
      patient: { id: 'p001', firstName: 'John', lastName: 'Doe', mrn: 'MRN-001' },
      appointmentDate: data.appointmentDate || new Date().toISOString(),
      reason: data.reason || '',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };
    appointments.unshift(appt);
    return { data: appt, status: 201 };
  },
  cancel: async (id: string): Promise<MockResponse<{ message: string }>> => {
    await delay();
    appointments = appointments.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a);
    return { data: { message: 'Appointment cancelled' }, status: 200 };
  },
  complete: async (id: string): Promise<MockResponse<{ message: string }>> => {
    await delay();
    return { data: { message: 'Appointment completed' }, status: 200 };
  },
  checkAvailability: async (doctorId: string, date: string, duration: number): Promise<MockResponse<{ available: boolean }>> => {
    await delay();
    return { data: { available: true }, status: 200 };
  },
};

export const billingApi = {
  list: async (): Promise<MockResponse<Bill[]>> => {
    await delay();
    return { data: getBills(), status: 200 };
  },
  get: async (id: string): Promise<MockResponse<Bill>> => {
    await delay();
    return { data: getBills()[0], status: 200 };
  },
  pay: async (billId: string, data: any): Promise<MockResponse<{ message: string }>> => {
    await delay();
    return { data: { message: 'Payment successful' }, status: 200 };
  },
};

export const medicalRecordApi = {
  list: async (): Promise<MockResponse<MedicalRecord[]>> => {
    await delay();
    return { data: getRecords(), status: 200 };
  },
  get: async (id: string): Promise<MockResponse<MedicalRecord>> => {
    await delay();
    return { data: getRecords()[0], status: 200 };
  },
};

function getRecords(): MedicalRecord[] {
  return [{
    id: 'rec-1',
    consultationDate: new Date(Date.now() - 604800000).toISOString(),
    doctor: DOCTOR,
    subjective: 'Patient reports mild headache and fatigue for the past week. No fever, no cough.',
    objective: 'Blood Pressure: 120/80, Temperature: 36.8°C, Weight: 72kg, Heart Rate: 72bpm',
    assessment: 'Common cold, possibly viral infection. Patient is generally healthy.',
    plan: '1. Rest for 2-3 days\n2. Increase fluid intake\n3. Paracetamol 500mg as needed\n4. Follow up in 1 week if symptoms persist',
    diagnoses: [{ id: 'dx-1', name: 'Upper Respiratory Tract Infection', icd10Code: 'J06.9' }],
    prescriptions: [{ id: 'rx-1', medication: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours', duration: '5 days' }],
    status: 'COMPLETED',
  }];
}

function getBills(): Bill[] {
  return [
    {
      id: 'bill-1',
      totalAmount: 2000,
      paidAmount: 2000,
      status: 'PAID',
      items: [{ id: 'item-1', description: 'General Consultation', amount: 2000 }],
      payments: [{ id: 'pay-1', amount: 2000, method: 'M-Pesa', date: new Date(Date.now() - 604800000).toISOString() }],
      createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: 'bill-2',
      totalAmount: 3500,
      paidAmount: 0,
      status: 'UNPAID',
      items: [
        { id: 'item-2', description: 'Laboratory Tests - Complete Blood Count', amount: 1500 },
        { id: 'item-3', description: 'Consultation Fee', amount: 2000 },
      ],
      payments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export default { authApi, patientApi, appointmentApi, billingApi, medicalRecordApi };