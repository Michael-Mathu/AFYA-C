import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'afya-c-super-secret-jwt-key-change-in-production';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

async function start() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'afya_c.db');

  let db: any;
  try {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } catch {
    db = new SQL.Database();
  }

  function save() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  let needsSeed = false;

  try {
    db.run("SELECT COUNT(*) as count FROM users");
    const result = db.exec("SELECT COUNT(*) as count FROM users");
    if (result.length === 0 || result[0].values[0][0] === 0) {
      needsSeed = true;
    }
  } catch {
    needsSeed = true;
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "isActive" INTEGER DEFAULT 1
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      phone TEXT,
      "isActive" INTEGER DEFAULT 1,
      "createdAt" TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "roleId" TEXT NOT NULL,
      "isActive" INTEGER DEFAULT 1,
      "createdAt" TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS appointment_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "durationMinutes" INTEGER,
      price REAL,
      "isActive" INTEGER DEFAULT 1
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS queue_statuses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "isActive" INTEGER DEFAULT 1
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      "patientId" TEXT,
      "doctorId" TEXT,
      "typeId" TEXT,
      status TEXT DEFAULT 'SCHEDULED',
      "scheduledDate" TEXT,
      "scheduledTime" TEXT,
      notes TEXT,
      "createdAt" TEXT DEFAULT (datetime('now'))
    )
  `);

  if (needsSeed) {
    console.log('🌱 Seeding database...');

    const roles = [
      { id: 'patient-role-id', name: 'PATIENT' },
      { id: 'doctor-role-id', name: 'DOCTOR' },
      { id: 'admin-role-id', name: 'ADMIN' },
      { id: 'nurse-role-id', name: 'NURSE' },
      { id: 'pharmacist-role-id', name: 'PHARMACIST' },
      { id: 'receptionist-role-id', name: 'RECEPTIONIST' },
      { id: 'cashier-role-id', name: 'CASHIER' },
    ];

    const stmt = db.prepare("INSERT OR IGNORE INTO roles (id, name, \"isActive\") VALUES (?, ?, 1)");
    for (const role of roles) stmt.run([role.id, role.name]);
    stmt.free();
    console.log('✅ Roles created');

    const users = [
      { email: 'patient@afya-c.com', password: 'password123', firstName: 'John', lastName: 'Doe', phone: '+254712345678', roleId: 'patient-role-id' },
      { email: 'doctor@afya-c.com', password: 'password123', firstName: 'Sarah', lastName: 'Smith', phone: '+254798765432', roleId: 'doctor-role-id' },
      { email: 'admin@afya-c.com', password: 'admin123', firstName: 'Admin', lastName: 'User', phone: '+254700000000', roleId: 'admin-role-id' },
    ];

    const insertUser = db.prepare("INSERT OR IGNORE INTO users (id, email, \"passwordHash\", \"firstName\", \"lastName\", phone, \"isActive\") VALUES (?, ?, ?, ?, ?, ?, 1)");
    const insertUserRole = db.prepare("INSERT INTO user_roles (id, \"userId\", \"roleId\", \"isActive\") VALUES (?, ?, ?, 1)");

    for (const user of users) {
      const id = uuidv4();
      const hash = bcrypt.hashSync(user.password, 12);
      insertUser.run([id, user.email, hash, user.firstName, user.lastName, user.phone]);
      insertUserRole.run([uuidv4(), id, user.roleId]);
    }
    insertUser.free();
    insertUserRole.free();
    console.log('✅ Test users created');

    const apptStmt = db.prepare("INSERT OR IGNORE INTO appointment_types (id, name, \"durationMinutes\", price, \"isActive\") VALUES (?, ?, ?, ?, 1)");
    const apptTypes = [
      { name: 'General Consultation', durationMinutes: 30, price: 2000 },
      { name: 'Follow-up', durationMinutes: 15, price: 1000 },
      { name: 'Annual Checkup', durationMinutes: 45, price: 5000 },
    ];
    for (const t of apptTypes) apptStmt.run([uuidv4(), t.name, t.durationMinutes, t.price]);
    apptStmt.free();
    console.log('✅ Appointment types created');

    const statusStmt = db.prepare("INSERT OR IGNORE INTO queue_statuses (id, name, \"isActive\") VALUES (?, ?, 1)");
    const statuses = [
      { id: 'waiting-status', name: 'WAITING' },
      { id: 'in-progress-status', name: 'IN_PROGRESS' },
      { id: 'completed-status', name: 'COMPLETED' },
      { id: 'cancelled-status', name: 'CANCELLED' },
    ];
    for (const s of statuses) statusStmt.run([s.id, s.name]);
    statusStmt.free();
    console.log('✅ Queue statuses created');

    save();

    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 TEST CREDENTIALS:');
    console.log('  Patient:  patient@afya-c.com  / password123');
    console.log('  Doctor:   doctor@afya-c.com   / password123');
    console.log('  Admin:    admin@afya-c.com    / admin123');
    console.log('─────────────────────────────────────────────────\n');
  }

  // Auth middleware
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  }

  // Auth routes
  app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const stmt = db.prepare("SELECT * FROM users WHERE email = ? AND \"isActive\" = 1");
    stmt.bind([email]);
    let user = null;
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      user = {};
      for (let i = 0; i < cols.length; i++) {
        user[cols[i]] = vals[i];
      }
    }
    stmt.free();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const roleStmt = db.prepare("SELECT r.name FROM roles r JOIN user_roles ur ON ur.\"roleId\" = r.id WHERE ur.\"userId\" = ? AND ur.\"isActive\" = 1");
    roleStmt.bind([user.id]);
    let roleName = 'PATIENT';
    if (roleStmt.step()) {
      roleName = roleStmt.get()[0] as string;
    }
    roleStmt.free();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: roleName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: roleName,
      },
    });
  });

  app.post('/api/v1/auth/register', (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const checkStmt = db.prepare("SELECT id FROM users WHERE email = ?");
    checkStmt.bind([email]);
    if (checkStmt.step()) {
      checkStmt.free();
      return res.status(409).json({ message: 'Email already registered' });
    }
    checkStmt.free();

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 12);
    db.run("INSERT INTO users (id, email, \"passwordHash\", \"firstName\", \"lastName\", phone, \"isActive\") VALUES (?, ?, ?, ?, ?, ?, 1)", [id, email, hash, firstName, lastName, phone || null]);
    db.run("INSERT INTO user_roles (id, \"userId\", \"roleId\", \"isActive\") VALUES (?, ?, ?, 1)", [uuidv4(), id, 'patient-role-id']);
    save();

    res.status(201).json({ message: 'User registered successfully', userId: id });
  });

  app.post('/api/v1/auth/me', authenticateToken, (req, res) => {
    const stmt = db.prepare("SELECT id, email, \"firstName\", \"lastName\", phone FROM users WHERE id = ?");
    stmt.bind([req.user.id]);
    let user = null;
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      user = {};
      for (let i = 0; i < cols.length; i++) {
        user[cols[i]] = vals[i];
      }
    }
    stmt.free();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const roleStmt = db.prepare("SELECT r.name FROM roles r JOIN user_roles ur ON ur.\"roleId\" = r.id WHERE ur.\"userId\" = ? AND ur.\"isActive\" = 1");
    roleStmt.bind([req.user.id]);
    let roleName = 'PATIENT';
    if (roleStmt.step()) {
      roleName = roleStmt.get()[0] as string;
    }
    roleStmt.free();

    res.json({ ...user, role: roleName });
  });

  // Health check
  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Appointments
  app.get('/api/v1/appointments', authenticateToken, (req, res) => {
    const appointments = db.exec(`
      SELECT a.*, 
        u1."firstName" as patientFirstName, u1."lastName" as patientLastName,
        u2."firstName" as doctorFirstName, u2."lastName" as doctorLastName
      FROM appointments a
      LEFT JOIN users u1 ON u1.id = a."patientId"
      LEFT JOIN users u2 ON u2.id = a."doctorId"
      ORDER BY a."scheduledDate" DESC
    `);
    res.json(appointments);
  });

  app.post('/api/v1/appointments', authenticateToken, (req, res) => {
    const { patientId, doctorId, typeId, scheduledDate, scheduledTime, notes } = req.body;
    const id = uuidv4();
    db.run("INSERT INTO appointments (id, \"patientId\", \"doctorId\", \"typeId\", status, \"scheduledDate\", \"scheduledTime\", notes) VALUES (?, ?, ?, ?, 'SCHEDULED', ?, ?, ?)",
      [id, patientId || 'patient-role-id', doctorId || 'doctor-role-id', typeId || null, scheduledDate, scheduledTime, notes || '']);
    save();
    res.status(201).json({ id, message: 'Appointment created' });
  });

  // Patients
  app.get('/api/v1/patients', authenticateToken, (req, res) => {
    const result = db.exec("SELECT id, email, \"firstName\", \"lastName\", phone FROM users");
    const patients = result.length > 0 ? result[0].values.map((row: any) => ({
      id: row[0], email: row[1], firstName: row[2], lastName: row[3], phone: row[4]
    })) : [];
    res.json(patients);
  });

  // Doctors
  app.get('/api/v1/doctors', authenticateToken, (req, res) => {
    const result = db.exec("SELECT u.id, u.email, u.\"firstName\", u.\"lastName\", u.phone FROM users u JOIN user_roles ur ON ur.\"userId\" = u.id WHERE ur.\"roleId\" = 'doctor-role-id'");
    const doctors = result.length > 0 ? result[0].values.map((row: any) => ({
      id: row[0], email: row[1], firstName: row[2], lastName: row[3], phone: row[4]
    })) : [];
    res.json(doctors);
  });

  // Consultations
  app.get('/api/v1/consultations', authenticateToken, (req, res) => {
    res.json([]);
  });

  // Billing
  app.get('/api/v1/billing', authenticateToken, (req, res) => {
    res.json([]);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AFYA-C API running on: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/health`);
    console.log(`\n📋 TEST CREDENTIALS:`);
    console.log(`   Patient:  patient@afya-c.com  / password123`);
    console.log(`   Doctor:   doctor@afya-c.com   / password123`);
    console.log(`   Admin:    admin@afya-c.com    / admin123\n`);
  });
}

start().catch(console.error);