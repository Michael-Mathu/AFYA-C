# AFYA-C: AI-Native Medical Centre Management System
## Phase 1 — Architecture & Implementation Plan

> **Version**: 1.0.0  
> **Date**: 26 June 2026  
> **Author**: AFYA-C Engineering Team  
> **Status**: Approved for Phase 1 Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Objectives](#2-objectives)
3. [Scope](#3-scope)
4. [Requirements](#4-requirements)
5. [Assumptions](#5-assumptions)
6. [Technology Stack](#6-technology-stack)
7. [Architecture](#7-architecture)
8. [Database Design](#8-database-design)
9. [API Contracts](#9-api-contracts)
10. [UI Specifications](#10-ui-specifications)
11. [AI Integration Design](#11-ai-integration-design)
12. [Security Architecture](#12-security-architecture)
13. [Performance Considerations](#13-performance-considerations)
14. [Accessibility Considerations](#14-accessibility-considerations)
15. [Test Plan](#15-test-plan)
16. [Deployment Plan](#16-deployment-plan)
17. [Risks and Mitigations](#17-risks-and-mitigations)
18. [Implementation Roadmap](#18-implementation-roadmap)
19. [Project Structure](#19-project-structure)
20. [Deliverables Checklist](#20-deliverables-checklist)
21. [Future Roadmap (Post Phase 1)](#21-future-roadmap-post-phase-1)

---

## 1. Executive Summary

AFYA-C Phase 1 will deliver a deployable, production-ready Medical Centre Management System for a single-site Kenyan medical centre. The system handles the complete patient journey from registration → triage → consultation → pharmacy → billing, with integrated AI assistance for clinical documentation. Built by a solo developer, Phase 1 prioritises essential modules for daily clinic operations while establishing the architectural foundation for multi-branch, multi-country expansion.

**Target Market**: Kenyan medical centres, specialist clinics
**Primary Users**: Receptionists, Doctors, Nurses, Pharmacists, Lab Technicians, Cashiers, Administrators
**Deployment**: Cloud VPS via Docker Compose
**Timeline**: ~15 weeks full-time development

---

## 2. Objectives

1. Deliver a production-ready system deployable in a real Kenyan medical centre with minimal additional development
2. Reduce administrative burden through automation and AI assistance
3. Ensure patient safety with audit trails and clinician-controlled AI
4. Establish a modular, maintainable architecture for future expansion
5. Integrate essential Kenyan-specific features (M-Pesa, SHIF, KRA-compliant invoicing)

---

## 3. Scope

### In Scope (Phase 1)

| Module | Description |
|--------|-------------|
| **Authentication & RBAC** | JWT auth, refresh tokens, role-based access control, MFA foundation |
| **Patient Registration** | Demographics, ID verification, insurance, duplicate detection |
| **Appointments & Queue** | Walk-in & scheduled appointments, department queues, real-time dashboard |
| **Consultation / EMR** | SOAP notes, vitals, ICD-11 diagnoses, AI-assisted note generation |
| **Pharmacy** | Prescription management, dispensing, inventory tracking |
| **Laboratory** | Test catalogue, lab ordering, sample tracking, result entry |
| **Billing & Payments** | Bill generation, M-Pesa integration, cash payments, insurance billing |
| **Reporting** | Daily summary, revenue reports, patient demographics |
| **AI Integration** | SOAP note generation, history summarization, prescription suggestions |
| **Audit & Compliance** | Comprehensive audit logging, data protection |

### Out of Scope (Phase 1)

- ❌ Telemedicine (Phase 2)
- ❌ Patient Portal / Mobile App (Flutter, Phase 2)
- ❌ Multi-branch support (Phase 3)
- ❌ Radiology/PACS integration (Phase 2)
- ❌ Advanced inventory/procurement (Phase 2)
- ❌ HR module (Phase 2)
- ❌ Wearable device integration (Phase 3)
- ❌ Full FHIR/HL7 interoperability (Phase 2)
- ❌ Kubernetes (Phase 3)
- ❌ Elasticsearch (Phase 2 — PostgreSQL full-text search sufficient)
- ❌ Offline mode (Phase 2)

---

## 4. Requirements

### Functional Requirements

- **FR-001**: System shall support patient registration with Kenyan ID types (National ID, Passport, Birth Certificate, Alien Card)
- **FR-002**: System shall generate unique Medical Record Numbers (MRN) for each patient
- **FR-003**: System shall detect duplicate patient records using fuzzy matching on name, ID number, and phone
- **FR-004**: System shall support walk-in and scheduled appointment booking
- **FR-005**: System shall manage department-based queues with status tracking
- **FR-006**: System shall support SOAP note creation with AI-assisted formatting
- **FR-007**: System shall record vitals (BP, temperature, pulse, respiratory rate, SpO2, weight, height, BMI)
- **FR-008**: System shall support ICD-11 diagnosis coding
- **FR-009**: System shall manage prescriptions with dispensing workflow
- **FR-010**: System shall track medication inventory with low-stock alerts
- **FR-011**: System shall support lab test ordering and result entry
- **FR-012**: System shall generate bills from services rendered
- **FR-013**: System shall integrate with M-Pesa Daraja API for STK Push payments
- **FR-014**: System shall generate KRA-compliant invoices and receipts
- **FR-015**: System shall support basic insurance billing (SHIF and private)
- **FR-016**: System shall provide role-based access control with granular permissions
- **FR-017**: System shall log all data modifications in an immutable audit trail
- **FR-018**: System shall provide AI-assisted clinical documentation with audit logging
- **FR-019**: System shall provide daily, weekly, and monthly revenue reports

### Non-Functional Requirements

- **NFR-001**: API response time < 200ms for 95th percentile (cached data)
- **NFR-002**: API response time < 500ms for 95th percentile (database queries)
- **NFR-003**: System shall support 50+ concurrent users (single clinic)
- **NFR-004**: System shall handle 1M+ patient records
- **NFR-005**: System availability ≥ 99.5% (excluding planned maintenance)
- **NFR-006**: Backup recovery time ≤ 4 hours
- **NFR-007**: All PHI encrypted at rest and in transit
- **NFR-008**: Authentication tokens expire within 15 minutes (access) and 7 days (refresh)
- **NFR-009**: Audit logs are append-only and immutable
- **NFR-010**: AI features add < 3 seconds additional latency (asynchronous UI updates)
- **NFR-011**: System shall support English language with i18n structure for future languages
- **NFR-012**: UI shall meet WCAG 2.1 AA accessibility standards

---

## 5. Assumptions

1. Single-site clinic deployment (no multi-branch in Phase 1)
2. Internet connectivity available for M-Pesa and AI API calls
3. Clinic has basic IT infrastructure (computers, printer, network)
4. Staff have basic computer literacy
5. M-Pesa is the primary digital payment method
6. OpenAI/Anthropic APIs are accessible (no local LLM)
7. Cloud VPS with 4GB RAM is sufficient for Phase 1 load
8. Mobile app not required in Phase 1 (responsive web UI for tablets)
9. Kenya-specific features (SHIF, M-Pesa, VAT) are configurable via environment/DB, not hardcoded
10. PostgreSQL 16 with pgvector extension is available

---

## 6. Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Backend Framework** | NestJS 10 (TypeScript) | Best-in-class TypeScript support, modular architecture via decorators, built-in dependency injection. Module system maps cleanly to domain modules (Patient, Appointment, etc.). Largest Node.js enterprise framework ecosystem. |
| **Web Frontend** | React 18 + TypeScript | Largest UI ecosystem, best component libraries for data-heavy healthcare forms. Mantine UI provides production-ready DataTable, forms, modals. |
| **Mobile** | Flutter (Phase 2) | Not ready for complex healthcare SPA on web. Phase 2 for patient portal and clinician mobile. |
| **Database** | PostgreSQL 16 + pgvector | Battle-tested, JSONB for flexible EMR data, excellent with Prisma ORM. pgvector enables vector embeddings for AI without separate vector DB. |
| **ORM** | Prisma 5 | Type-safe, auto-generated migrations, excellent NestJS integration, JSONB and enum support. |
| **API Style** | REST (primary) + limited GraphQL | REST for standard CRUD (clear, cacheable, simple). GraphQL via NestJS code-first for reporting dashboards. |
| **Authentication** | JWT + Refresh Tokens | Industry standard. NestJS Passport integration. Refresh tokens stored in Redis with device fingerprinting. |
| **Cache / Session** | Redis 7 | Session store, rate limiting, Bull job queues, cache for frequently accessed data. |
| **File Storage** | MinIO (S3-compatible) | Self-hosted for data sovereignty. S3 API allows cloud migration. Stores documents, lab results. |
| **Payments** | M-Pesa Daraja API | Direct Safaricom integration. Abstracted behind payment gateway pattern for future gateways. |
| **AI / LLM** | OpenAI API / Anthropic API | Abstracted behind `AiProviderService`. GPT-4o-mini for cost-effective performance. |
| **Queue / Jobs** | Bull + Redis | Background processing for: M-Pesa status polling, report generation, AI processing. |
| **CI/CD** | GitHub Actions | Free for public repos, excellent Docker support, SSH deployment. |
| **Containerisation** | Docker + Docker Compose | Single VPS deployment. Each service in its own container. |
| **Monitoring** | OpenTelemetry → Prometheus → Grafana | OpenTelemetry SDK for NestJS auto-instrumentation. Health checks on `/health`. |
| **Logging** | Pino (structured JSON) | Fastest Node.js logger, structured output for future log aggregation. |
| **Testing** | Jest + Supertest + Cypress | Jest (unit), Supertest (integration), Cypress (E2E). |
| **Deployment** | Single VPS (DigitalOcean/Linode/Hetzner) | ~$30-60/month. Cloud-agnostic — migrate to AWS/GCP later. |

---

## 7. Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Clients (Browser)                        │
│  React SPA (Mantine UI)  ←→  Nginx (reverse proxy, SSL)   │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼─────────────────────────────────┐
│                NestJS API Server (Docker)                   │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ REST Module │  │ GraphQL  │  │ WebSocket Gateway  │    │
│  └──────┬──────┘  └──────────┘  └────────────────────┘    │
│         │                                                  │
│  ┌──────▼─────────────────────────────────────────────┐   │
│  │           Core Modules (Domain-Driven)              │   │
│  │  Auth │ Patient │ Appointment │ Consultation │ ... │   │
│  └──────┬─────────────────────────────────────────────┘   │
│         │                                                  │
│  ┌──────▼─────────────────────────────────────────────┐   │
│  │           Service Layer                              │   │
│  │  Business Logic │ Validation │ AI Integration        │   │
│  └──────┬─────────────────────────────────────────────┘   │
│         │                                                  │
│  ┌──────▼─────────────────────────────────────────────┐   │
│  │           Data Access Layer (Prisma)                 │   │
│  └──────┬─────────────────────────────────────────────┘   │
└─────────┼──────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────┐
│                    PostgreSQL 16 + pgvector                 │
│  Patients │ Appointments │ Consultations │ Inventory │ ... │
└────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐
│   Redis     │  │   MinIO      │  │  External APIs          │
│ (Cache/Queue)│  │ (Documents)  │  │  M-Pesa │ SMS │ AI     │
└─────────────┘  └──────────────┘  └────────────────────────┘
```

### Key Architectural Decisions

1. **Monorepo with Nx**: Single repository with shared libraries (`@afya-core/types`, `@afya-core/utils`, `@afya-core/schemas`).

2. **Domain Module Pattern**: Each domain is a NestJS module with Controller, Service, Module, DTOs, and Prisma model mapping.

3. **CQRS-lite**: Commands and queries separated at service method level. `QueryService` for reads, `CommandService` for writes. Enables future CQRS migration.

4. **Multi-tenancy ready**: All tables include `branch_id` column (nullable in Phase 1). No hardcoded single-tenant assumptions.

5. **Localisation ready**: All user-facing strings use i18n keys. No hardcoded Kenyan-specific strings in core code.

---

## 8. Database Design

### Entity Relationship Overview

The system uses PostgreSQL 16 with the following core entities:

**Patient Management**
- `patients` — Core patient demographics, insurance, emergency contacts
- `patients.allergies` — JSONB array of allergen/reaction/severity

**Appointments & Queue**
- `appointments` — Walk-in and scheduled visits
- `queue_entries` — Department-based queue with status tracking

**Clinical**
- `consultations` — SOAP notes, diagnoses (JSONB with ICD-11), AI notes
- `vitals` — Blood pressure, temperature, heart rate, SpO2, BMI
- `prescriptions` — Medication orders with dispensing status

**Laboratory**
- `lab_test_catalogue` — Test definitions with prices and panels
- `lab_requests` — Test orders with results and flags

**Pharmacy & Inventory**
- `inventory_items` — Medications, supplies, reagents
- `stock_movements` — Purchase, dispensing, adjustment tracking

**Billing**
- `bills` — Invoice headers with totals and payment status
- `bill_items` — Line items (consultation, lab, medication)
- `payments` — Payment records (cash, M-Pesa, insurance)

**Security & Audit**
- `users` — Staff accounts with role assignments
- `roles` — System roles (ADMIN, DOCTOR, NURSE, etc.)
- `permissions` — Granular resource/action permissions
- `role_permissions` — Role-permission mapping
- `audit_log` — Immutable record of all data changes

### Design Principles

- UUID primary keys for all tables (multi-branch/offline ready)
- Soft deletes via `deleted_at` timestamps
- Audit columns: `created_by`, `created_at`, `updated_by`, `updated_at`
- JSONB for flexible/future-proof fields (vitals, diagnoses, allergies)
- PostgreSQL enums for constrained status values
- Full-text search index on patient names and ID numbers
- Composite indexes on frequently queried join conditions
- Foreign keys with indexes on all reference columns

Full schema in `prisma/schema.prisma` (generated during implementation).

---

## 9. API Contracts

### Authentication
```
POST   /api/auth/login              → { accessToken, refreshToken, user }
POST   /api/auth/refresh            → { accessToken, refreshToken }
POST   /api/auth/logout             → void
POST   /api/auth/change-password    → void
```

### Patients
```
GET    /api/patients                → Paginated list (search: ?q=, ?phone=, ?mrn=)
POST   /api/patients                → Create patient
GET    /api/patients/:id            → Patient details with visit history
PUT    /api/patients/:id            → Update patient
DELETE /api/patients/:id            → Soft delete
GET    /api/patients/:id/history    → Patient visit timeline
POST   /api/patients/merge          → Merge duplicate patients
```

### Appointments
```
GET    /api/appointments            → Paginated (filters: date, doctor, status, department)
POST   /api/appointments            → Create appointment (walk-in or scheduled)
PUT    /api/appointments/:id        → Update (reschedule, cancel)
GET    /api/appointments/today      → Today's appointments for reception dashboard
GET    /api/appointments/doctor/:doctorId → Doctor's schedule
```

### Queue
```
GET    /api/queue/:department       → Current queue for department
POST   /api/queue/check-in          → Check in patient
PUT    /api/queue/:id/call          → Call patient to consultation room
PUT    /api/queue/:id/complete      → Mark consultation complete
PUT    /api/queue/:id/transfer      → Transfer to another department
GET    /api/queue/stats             → Queue statistics
```

### Consultations
```
GET    /api/consultations           → Doctor's consultations (filter: date, status)
POST   /api/consultations           → Start new consultation
GET    /api/consultations/:id       → Full consultation details
PUT    /api/consultations/:id       → Update consultation (save draft)
PUT    /api/consultations/:id/sign  → Sign/finalize consultation
POST   /api/consultations/:id/ai-generate-soap → AI generates SOAP from notes
POST   /api/consultations/:id/ai-summarize  → AI summarizes patient history
```

### Prescriptions
```
GET    /api/prescriptions           → Filter by consultation, patient, date
POST   /api/prescriptions           → Add prescription
PUT    /api/prescriptions/:id/dispense → Pharmacist dispenses
POST   /api/prescriptions/ai-suggest → AI suggests medication for diagnosis
```

### Lab
```
GET    /api/lab/tests               → Lab test catalogue
POST   /api/lab/requests            → Order lab test
GET    /api/lab/requests            → Lab worklist (filter: status, date)
PUT    /api/lab/requests/:id/collect → Mark sample collected
PUT    /api/lab/requests/:id/result → Enter result
GET    /api/lab/requests/:id        → View result
```

### Inventory
```
GET    /api/inventory               → Inventory list (with low-stock filter)
POST   /api/inventory               → Add inventory item
GET    /api/inventory/low-stock     → Items below reorder level
POST   /api/inventory/stock-in      → Stock in (purchase/adjustment)
GET    /api/inventory/movements     → Stock movement history
```

### Billing
```
GET    /api/bills                   → Bills (filter: patient, date, status)
POST   /api/bills                   → Generate bill from consultation items
POST   /api/bills/:id/pay          → Record payment (cash or M-Pesa)
POST   /api/bills/:id/mpesa-push   → Initiate M-Pesa STK Push
GET    /api/bills/revenue/daily     → Daily revenue summary
GET    /api/bills/revenue/monthly   → Monthly revenue summary
```

### Reporting
```
GET    /api/reports/daily-summary          → Patients, revenue, top diagnoses
GET    /api/reports/patient-demographics   → Age/gender/district distribution
GET    /api/reports/diagnoses-frequency    → Most common diagnoses (date range)
GET    /api/reports/revenue-by-department  → Revenue breakdown
GET    /api/reports/appointment-adherence  → Show/no-show rates
```

### Admin
```
GET    /api/users                   → User list
POST   /api/users                   → Create user
PUT    /api/users/:id               → Update user
GET    /api/roles                   → Role list with permissions
PUT    /api/roles/:id/permissions   → Update role permissions
```

---

## 10. UI Specifications

### Design System
- **Theme**: Clean, medical-grade white + light blue/green accents
- **Typography**: Inter font (highly readable at small sizes)
- **Component Library**: Mantine UI 7 (production-ready DataTable, forms, modals, notifications)
- **Responsive**: Desktop-first for Phase 1, tablet-friendly layouts
- **Language**: English (i18n structure ready for Swahili in Phase 2)
- **Accessibility**: WCAG 2.1 AA — color contrast ≥ 4.5:1, keyboard navigation, ARIA labels

### Key Screens

1. **Login Screen** — Username/password, optional MFA, "Forgot Password"
2. **Reception Dashboard** — Quick stats, today's queue, today's appointments, patient search
3. **Patient Registration** — Multi-section form (personal info, insurance, emergency contact, allergies)
4. **Doctor's Consultation** — Three-panel layout (patient history, SOAP editor, quick actions)
5. **Pharmacy Dispensing** — Prescription worklist, dispensing confirmation, inventory check
6. **Lab Worklist** — Pending tests, result entry forms, abnormal flagging
7. **Billing Screen** — Bill creation, payment entry, M-Pesa push, receipt generation
8. **Admin Settings** — User management, role configuration, system settings

---

## 11. AI Integration Design

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   AiService (Core)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  AiProviderService (Interface)                     │ │
│  │  ├── OpenAiProvider (GPT-4o-mini — default)        │ │
│  │  └── AnthropicProvider (Claude 3 Haiku — fallback) │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  AiUseCase Services                               │ │
│  │  ├── SoapGenerationService  (notes → SOAP)         │ │
│  │  ├── HistorySummaryService  (visits → summary)     │ │
│  │  └── PrescriptionSuggestionService (dx → rx)       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  AiAuditService  (logs every request/response)     │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Async by default**: AI calls never block the UI. Processing state shown with loading indicators.
2. **Audit trail**: Every AI interaction logged with prompt, response, confidence, model, latency.
3. **Clinician in control**: AI outputs are drafts. Clinician must accept, edit, or reject before saving.
4. **Confidence indicators**: AI suggestions show confidence scores. Low-confidence suggestions flagged.
5. **Provider abstraction**: Swap AI providers via configuration. No vendor lock-in.

---

## 12. Security Architecture

### Authentication Flow
1. User submits credentials → `POST /api/auth/login`
2. Server validates → returns `access_token` (JWT, 15min expiry) + `refresh_token` (opaque, 7-day expiry, Redis)
3. Frontend stores access_token in memory, refresh_token in httpOnly cookie
4. On 401 → `POST /api/auth/refresh` → new access_token
5. On logout → refresh token invalidated in Redis

### Authorization (RBAC)
- Endpoint decorators: `@Roles('DOCTOR', 'ADMIN')`
- Middleware checks user's role against required permissions
- Granular actions: CREATE, READ, UPDATE, DELETE, APPROVE, DISPENSE per resource

### Data Protection
- Passwords: bcrypt (cost factor 12)
- All traffic: HTTPS (Let's Encrypt via Nginx)
- PHI: Encrypted at rest via PostgreSQL TDE
- Audit logs: Append-only, timestamped, old/new values

### API Security
- Rate limiting: 100 req/min/IP (global), 20 req/min (auth endpoints)
- CORS: Whitelisted origins only
- Helmet middleware: Security headers
- Input validation: class-validator + Zod schemas
- SQL injection: Prevented by Prisma parameterized queries
- XSS: Prevented by React escaping + CSP headers

---

## 13. Performance Considerations

- **Connection pooling**: Prisma with pgBouncer in transaction mode
- **Redis caching**: Patient search (5min TTL), lookup tables (1hr TTL)
- **Pagination**: Cursor-based for all list endpoints (no OFFSET)
- **N+1 prevention**: Prisma `include` and `select` for eager loading
- **Indexes**: All foreign keys, query columns, full-text search on patient names
- **Compression**: Nginx gzip for API responses
- **AI calls**: Asynchronous with loading states in UI

---

## 14. Accessibility Considerations

- WCAG 2.1 AA compliance target
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All interactive elements keyboard navigable
- ARIA labels on all form inputs and interactive elements
- Focus indicators visible on all elements
- Error messages associated with inputs via aria-describedby
- Screen reader support for tables with proper headers
- No information conveyed solely through color

---

## 15. Test Plan

| Type | Tool | Target Coverage | Quality Gate |
|------|------|----------------|--------------|
| Unit Tests | Jest | All services, validators, AI service | ≥ 80% coverage |
| Integration Tests | Supertest | All API endpoints, auth flow, DB operations | 100% of endpoints |
| E2E Tests | Cypress | Critical paths: registration → consultation → pharmacy → billing | 5 critical paths |
| Contract Tests | Jest + Supertest | API response schemas | All endpoints validated |
| Security Tests | Manual + automated | OWASP Top 10 | No critical vulnerabilities |

### Quality Gates (CI/CD)
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ TypeScript compilation succeeds (strict mode)
- ✅ ESLint passes (no warnings)
- ✅ Test coverage ≥ 80% (services), ≥ 70% (controllers)
- ✅ Prisma migration generates successfully
- ✅ Docker build succeeds

---

## 16. Deployment Plan

### Docker Compose Architecture
```
docker-compose.yml
├── nginx (reverse proxy, SSL termination)
├── api (NestJS app, 2 replicas)
├── postgres (PostgreSQL 16 + pgvector)
├── redis (Redis 7)
├── minio (S3-compatible storage)
└── pgadmin (optional, DB management)
```

### VPS Requirements
- **Provider**: DigitalOcean / Linode / Hetzner
- **Region**: Nairobi (if available), else Johannesburg / Frankfurt
- **Spec**: 4GB RAM, 2 vCPU, 80GB SSD (~$30-50/month)
- **OS**: Ubuntu 24.04 LTS
- **Docker**: Docker CE 24+ with Docker Compose v2

### CI/CD Pipeline (GitHub Actions)
1. Push to main → GitHub Actions triggered
2. Install dependencies → `npm ci`
3. Lint → ESLint
4. Test → Jest (unit + integration)
5. Build → NestJS build + React build
6. Docker → Build & tag images
7. Deploy → SSH → `docker compose pull && docker compose up -d`
8. Health check → `curl /health`
9. Migration → `npx prisma migrate deploy`
10. Notify → Slack/Discord webhook

### Backup Strategy
- PostgreSQL: pg_dump daily + WAL archiving for point-in-time recovery
- MinIO: rsync to secondary storage
- Retention: 7 days daily, 4 weeks weekly, 3 months monthly

### Rollback Strategy
- Previous Docker images tagged with version (e.g., `afya-api:v1.2.3`)
- If health check fails → GitHub Actions auto-rollback
- Database: Prisma reversible migrations
- Manual: `docker compose down && docker compose -f docker-compose.rollback.yml up -d`

---

## 17. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Scope creep | High | High | Strict Phase 1 scope. Parking lot for out-of-scope ideas. |
| Solo dev burnout | Medium | High | Modular milestones. Each module = tangible progress. |
| M-Pesa API issues | Medium | High | Sandbox testing first. Cash payment fallback. |
| AI API costs | Low | Medium | GPT-4o-mini ($0.15/1M tokens). Cache common requests. |
| Data loss | Low | Critical | Automated daily backups, WAL archiving, tested restore. |
| Performance under load | Low | Medium | Connection pooling, Redis caching, pagination. |
| Regulatory compliance | Medium | High | Data Protection Act compliance from day one. |
| Internet outage | High | High | Phase 1 requires internet. Offline-first in Phase 2. |

---

## 18. Implementation Roadmap

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Week 1-2: Foundation** | 14 days | Monorepo setup, Prisma schema, migrations, auth system, RBAC, audit logging, Docker, CI/CD |
| **Week 3-4: Patients + Queue** | 14 days | Patient registration CRUD, search, duplicate detection, appointment booking, queue management, reception UI |
| **Week 5-7: Clinical Core** | 21 days | Consultation module, vitals, SOAP notes, AI SOAP generation, ICD-11 diagnoses, patient history view |
| **Week 8-9: Pharmacy + Lab** | 14 days | Prescription management, inventory, dispensing, lab catalogue, lab ordering, result entry |
| **Week 10-11: Billing** | 14 days | Bill generation, M-Pesa integration, cash payments, receipts, revenue summary, insurance billing |
| **Week 12-13: AI + Polish** | 14 days | History summary AI, prescription suggestion AI, UI refinements, error handling, loading states |
| **Week 14: Testing + Docs** | 7 days | Integration tests, E2E tests, documentation, deployment guide, user manual |
| **Week 15: Deployment** | 7 days | VPS setup, SSL, domain, deploying, seed data, go-live support |

**Total: ~15 weeks** (full-time solo developer, 40-60 hrs/week)

---

## 19. Project Structure

```
afya-c/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/     # @CurrentUser, @Roles
│   │   │   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   │   │   ├── interceptors/   # Logging, Audit
│   │   │   │   ├── filters/        # Exception filters
│   │   │   │   ├── pipes/          # Validation pipe
│   │   │   │   └── middleware/     # Rate limiting
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── patients/
│   │   │   │   ├── appointments/
│   │   │   │   ├── queue/
│   │   │   │   ├── consultations/
│   │   │   │   ├── prescriptions/
│   │   │   │   ├── lab/
│   │   │   │   ├── pharmacy/
│   │   │   │   ├── inventory/
│   │   │   │   ├── billing/
│   │   │   │   ├── reporting/
│   │   │   │   ├── ai/
│   │   │   │   ├── users/
│   │   │   │   └── audit/
│   │   │   ├── config/
│   │   │   └── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── .env.example
│   └── web/                       # React frontend
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── contexts/
│       │   ├── services/          # API client
│       │   ├── types/
│       │   ├── utils/
│       │   └── styles/
│       ├── Dockerfile
│       └── .env.example
├── libs/
│   ├── schemas/                   # Zod validation schemas
│   ├── types/                     # Shared TypeScript types
│   └── utils/                     # Shared utilities
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── docker-compose.yml
├── docs/
│   ├── architecture-and-implementation-plan.md  (this file)
│   ├── api.md
│   ├── deployment.md
│   └── user-guide.md
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   └── seed-data.ts
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── nx.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 20. Deliverables Checklist

At the end of Phase 1, the following will be delivered:

- [ ] **Working software**: Deployable medical centre management system
- [ ] **API**: 60+ REST endpoints with OpenAPI documentation
- [ ] **Database**: Prisma schema with 25+ tables, migrations, seed data
- [ ] **Frontend**: React SPA with 7+ main screens
- [ ] **AI Integration**: SOAP note generation, history summarization, prescription suggestions
- [ ] **M-Pesa Integration**: STK Push payments with callback handling
- [ ] **Authentication**: JWT + refresh tokens + RBAC with permission matrix
- [ ] **Audit**: Comprehensive, immutable audit logging
- [ ] **Tests**: Unit + integration tests (≥80% coverage)
- [ ] **Docker**: Docker Compose production deployment configuration
- [ ] **CI/CD**: GitHub Actions pipeline with quality gates
- [ ] **Documentation**: Architecture, API, deployment, user guide
- [ ] **Backup**: Automated backup and restore scripts
- [ ] **Release notes**: v1.0.0 release notes
- [ ] **Roadmap**: Phase 2 plan with prioritized backlog

---

## 21. Future Roadmap (Post Phase 1)

### Phase 2 — Expansion (~8-10 weeks)
- Patient Portal (Flutter mobile)
- Telemedicine (video consultations)
- Advanced Reporting with Elasticsearch
- Full FHIR R4 interoperability
- Ward/Inpatient management
- Radiology module with DICOM viewer
- Enhanced AI (image analysis, predictive risk scoring)
- SMS notifications (Africa's Talking)
- Offline-first mode for network outages

### Phase 3 — Scale (~10-12 weeks)
- Multi-branch management
- Kubernetes deployment
- National Health Integration (Kenya EMRI)
- Advanced analytics / BI dashboard
- Wearable device integration
- Population health analytics
- Insurance claims management (full lifecycle)

### Phase 4 — Ecosystem (~ongoing)
- Interoperability with external health systems
- Patient mobile app (appointments, records, payments)
- Telehealth network (multi-clinic)
- AI-powered clinical decision support
- Research and public health reporting
- Regional expansion (Uganda, Tanzania, Rwanda)

---

## Appendix A: Data Protection Compliance (Kenya Data Protection Act)

The system is designed to comply with the Kenya Data Protection Act (2019):

1. **Data minimization**: Only essential patient data collected
2. **Purpose limitation**: Data used only for healthcare delivery
3. **Storage limitation**: Data retention policies configurable
4. **Access control**: RBAC ensures need-to-know access
5. **Audit trail**: All data access and modifications logged
6. **Consent management**: Patient consent tracked (Phase 2)
7. **Data portability**: Patient data exportable (Phase 2)
8. **Breach notification**: Alerting framework (Phase 2)
9. **Data processor agreements**: For cloud/AI providers

---

## Appendix B: Configuration Localisation

Kenya-specific features are configurable, not hardcoded:

| Feature | Configuration |
|---------|---------------|
| VAT rate | `VILLAGE_TAX_RATE` env var (default: 16%) |
| Timezone | `TZ` env var (default: Africa/Nairobi) |
| Currency | `CURRENCY_CODE` env var (default: KES) |
| ID types | Database table `id_types` (configurable) |
| Payment gateways | Database table `payment_gateways` |
| Insurance providers | Database table `insurance_providers` |
| Public holidays | Configurable via admin panel |
| SHIF integration | Configurable API credentials |

This ensures the core platform remains country-agnostic while supporting Kenyan deployment out of the box.

---

> **Next Step**: Begin Phase 1 implementation starting with project scaffolding, Prisma schema, and authentication module.