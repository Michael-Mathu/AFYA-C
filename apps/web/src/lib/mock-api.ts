/**
 * Mock API - completely in-browser, no backend needed.
 * 
 * Credentials:
 *   patient@afya-c.com / password123
 *   doctor@afya-c.com  / password123
 *   admin@afya-c.com   / admin123
 */

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
const PATIENT = USERS['patient@afya-c.com'].user;

let appointments = [
  { id: 'a1', patientId: 'p001', doctorId: 'd001', typeId: 't1', status: 'SCHEDULED', appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], reason: 'Annual checkup', createdAt: new Date().toISOString() },
  { id: 'a2', patientId: 'p001', doctorId: 'd001', typeId: 't2', status: 'SCHEDULED', appointmentDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], reason: 'Blood pressure check', createdAt: new Date().toISOString() },
];

interface MockResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export function mockRequest(url: string, method: string, body: any, token: string): MockResponse | null {
  function res(data: any, status = 200): MockResponse {
    return { data, status, statusText: status === 200 ? 'OK' : 'Created', headers: { 'content-type': 'application/json' } };
  }
  function err(status: number, msg: string): MockResponse {
    return { data: { message: msg }, status, statusText: 'Error', headers: { 'content-type': 'application/json' } };
  }

  let tokenUser: any = null;
  try { tokenUser = JSON.parse(atob(token)); } catch {}

  // Health
  if (url.includes('/health')) return res({ status: 'ok', database: 'sqlite', timestamp: new Date().toISOString() });

  // Auth Login
  if (url.includes('/auth/login') && method === 'post') {
    const { email, password } = body || {};
    const u = USERS[email];
    if (!u || u.password !== password) return err(401, 'Invalid credentials');
    const access_token = btoa(JSON.stringify({ sub: u.user.id, email: u.user.email, role: u.user.role.name }));
    return res({ access_token, user: u.user });
  }

  // Auth Register
  if (url.includes('/auth/register') && method === 'post') {
    return res({ message: 'Registration successful' }, 201);
  }

  // Patients / me
  if (url.includes('/patients/me')) {
    const email = tokenUser?.email || 'patient@afya-c.com';
    const u = Object.values(USERS).find(x => x.user.email === email);
    return res({
      id: u?.user.id || 'p001',
      firstName: u?.user.firstName || 'John',
      lastName: u?.user.lastName || 'Doe',
      mrn: 'MRN-001',
      dateOfBirth: '1990-05-15',
      gender: 'MALE',
      phone: u?.user.phone || '+254712345678',
      email: u?.user.email || 'patient@afya-c.com',
      address: '123 Nairobi Street',
      idNumber: 'ID123456',
      allergies: [{ id: 'all-1', name: 'Penicillin', severity: 'MODERATE' }],
      insurance: { provider: 'NHIF', policyNumber: 'NHIF001' },
      emergencyContact: { name: 'Jane Doe', phone: '+254712345679', relationship: 'Spouse' },
    });
  }

  // Appointments
  if (url.includes('/appointments')) {
    // Single GET
    if (method === 'get') {
      const parts = url.split('/').filter(Boolean);
      const isList = parts.length <= 2; // /appointments or /api/v1/appointments
      if (isList) return res({ data: appointments, total: appointments.length });
      const id = parts[parts.length - 1];
      const a = appointments.find((x: any) => x.id === id);
      return res(a || appointments[0]);
    }
    // Create
    if (method === 'post') {
      const a = { id: 'a' + Date.now(), status: 'SCHEDULED', ...body, createdAt: new Date().toISOString() };
      appointments.unshift(a);
      return res(a, 201);
    }
    // Cancel
    if (method === 'put' && url.endsWith('/cancel')) {
      const parts = url.split('/').filter(Boolean);
      const id = parts[parts.length - 2];
      appointments = appointments.map((x: any) => x.id === id ? { ...x, status: 'CANCELLED' } : x);
      return res({ message: 'Cancelled' });
    }
    if (method === 'put' && url.endsWith('/complete')) {
      return res({ message: 'Completed' });
    }
  }

  // Availability
  if (url.includes('/availability')) return res({ available: true, slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] });

  // Consultations
  if (url.includes('/consultations')) {
    const records = [{
      id: 'c1',
      consultationDate: new Date(Date.now() - 604800000).toISOString(),
      doctor: DOCTOR,
      subjective: 'Patient reports mild headache and fatigue for the past week.',
      objective: 'Blood pressure: 120/80, Temperature: 36.8°C, Weight: 72kg',
      assessment: 'Common cold, possibly viral infection.',
      plan: 'Rest, increase fluid intake, paracetamol as needed. Follow up in 1 week if symptoms persist.',
      diagnoses: [{ id: 'dx-1', name: 'Upper Respiratory Tract Infection', icd10Code: 'J06.9' }],
      prescriptions: [{ id: 'rx-1', medication: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours', duration: '5 days' }],
      status: 'COMPLETED',
    }];
    const parts = url.split('/').filter(Boolean);
    if (parts.length > 2) return res(records[0]);
    return res(records);
  }

  // Billing
  if (url.includes('/billing')) {
    const bills = [
      { id: 'b1', totalAmount: 2000, paidAmount: 2000, status: 'PAID', items: [{ description: 'General Consultation', amount: 2000 }], payments: [{ amount: 2000, method: 'M-Pesa', date: new Date().toISOString() }], createdAt: new Date().toISOString() },
      { id: 'b2', totalAmount: 3500, paidAmount: 0, status: 'UNPAID', items: [{ description: 'Lab Tests - CBC', amount: 1500 }, { description: 'Consultation Fee', amount: 2000 }], payments: [], createdAt: new Date().toISOString() },
    ];
    if (url.split('/').filter(Boolean).length > 2) return res(bills[0]);
    return res(bills);
  }
  if (url.includes('/billing') && method === 'post' && url.includes('/payments')) {
    return res({ message: 'Payment successful' });
  }

  return null; // not handled
}