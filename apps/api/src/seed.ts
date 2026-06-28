import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Seeding database...\n');

  try {
    const isSQLite = process.env.USE_SQLITE === 'true';
    const now = isSQLite ? "datetime('now')" : 'NOW()';
    const param = (i: number) => isSQLite ? '?' : `$${i}`;

    // Create roles
    const roles = [
      { id: 'patient-role-id', name: 'PATIENT' },
      { id: 'doctor-role-id', name: 'DOCTOR' },
      { id: 'admin-role-id', name: 'ADMIN' },
      { id: 'nurse-role-id', name: 'NURSE' },
      { id: 'pharmacist-role-id', name: 'PHARMACIST' },
      { id: 'receptionist-role-id', name: 'RECEPTIONIST' },
      { id: 'cashier-role-id', name: 'CASHIER' },
    ];

    for (const role of roles) {
      await dataSource.query(`
        INSERT INTO roles (id, name, "isActive") 
        VALUES (${param(1)}, ${param(2)}, 1)
      `, [role.id, role.name]);
    }
    console.log('✅ Roles created');

    // Create test users
    const users = [
      {
        id: uuidv4(),
        email: 'patient@afya-c.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254712345678',
        roleId: 'patient-role-id',
      },
      {
        id: uuidv4(),
        email: 'doctor@afya-c.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Smith',
        phone: '+254798765432',
        roleId: 'doctor-role-id',
      },
      {
        id: uuidv4(),
        email: 'admin@afya-c.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+254700000000',
        roleId: 'admin-role-id',
      },
    ];

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      await dataSource.query(`
        INSERT INTO users (id, email, "passwordHash", "firstName", "lastName", phone, "isActive", "createdAt")
        VALUES (${param(1)}, ${param(2)}, ${param(3)}, ${param(4)}, ${param(5)}, ${param(6)}, 1, ${now})
      `, [user.id, user.email, passwordHash, user.firstName, user.lastName, user.phone]);

      // Assign role
      await dataSource.query(`
        INSERT INTO user_roles (id, "userId", "roleId", "isActive", "createdAt")
        VALUES (${param(1)}, ${param(2)}, ${param(3)}, 1, ${now})
      `, [uuidv4(), user.id, user.roleId]);
    }
    console.log('✅ Test users created');

    // Create appointment types
    const appointmentTypes = [
      { id: uuidv4(), name: 'General Consultation', durationMinutes: 30, price: 2000 },
      { id: uuidv4(), name: 'Follow-up', durationMinutes: 15, price: 1000 },
      { id: uuidv4(), name: 'Annual Checkup', durationMinutes: 45, price: 5000 },
    ];

    for (const type of appointmentTypes) {
      await dataSource.query(`
        INSERT INTO appointment_types (id, name, "durationMinutes", price, "isActive")
        VALUES (${param(1)}, ${param(2)}, ${param(3)}, ${param(4)}, 1)
      `, [type.id, type.name, type.durationMinutes, type.price]);
    }
    console.log('✅ Appointment types created');

    // Create queue statuses
    const queueStatuses = [
      { id: 'waiting-status', name: 'WAITING' },
      { id: 'in-progress-status', name: 'IN_PROGRESS' },
      { id: 'completed-status', name: 'COMPLETED' },
      { id: 'cancelled-status', name: 'CANCELLED' },
    ];

    for (const status of queueStatuses) {
      await dataSource.query(`
        INSERT INTO queue_statuses (id, name, "isActive")
        VALUES (${param(1)}, ${param(2)}, 1)
      `, [status.id, status.name]);
    }
    console.log('✅ Queue statuses created');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📋 TEST CREDENTIALS:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  Patient:  patient@afya-c.com  / password123');
    console.log('  Doctor:   doctor@afya-c.com   / password123');
    console.log('  Admin:    admin@afya-c.com    / admin123');
    console.log('───────────────────────────────────────────────────────────────\n');

  } catch (error) {
    const err = error as Error;
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  }

  await app.close();
  process.exit(0);
}

seed();