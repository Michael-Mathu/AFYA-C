# AFYA-C Mobile App - API Contracts

## Base Configuration
- **API Base URL:** https://api.afya-c.com/api/v1
- **Authentication:** JWT Bearer tokens
- **Content-Type:** application/json
- **Platform:** Cross-platform (iOS/Android)

---

## Authentication Endpoints

### POST /auth/mobile/login
Mobile biometric login with device tracking

**Request:**
```json
{
  "email": "patient@example.com",
  "password": "securepassword",
  "deviceInfo": {
    "deviceId": "device-uuid",
    "deviceType": "android",
    "osVersion": "14.0",
    "appVersion": "1.0.0",
    "pushToken": "fcm-token-here"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "patient@example.com",
      "mrn": "MRN-2026-000001",
      "role": "PATIENT"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": 900
  }
}
```

---

## Patient Endpoints

### GET /patients/me
Get current patient profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "phone": "+254712345678",
  "email": "john@example.com",
  "mrn": "MRN-2026-000001",
  "address": {
    "county": "Nairobi",
    "subcounty": "Westlands",
    "ward": "Parklands"
  },
  "allergies": [
    {
      "id": "uuid",
      "allergen": "Penicillin",
      "reaction": "Rash",
      "severity": "MODERATE"
    }
  ],
  "insurance": {
    "provider": "SHIF",
    "number": "SHIF-123456",
    "validUntil": "2025-12-31"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+254723456789",
    "relationship": "Spouse"
  }
}
```

---

## Appointments Endpoints

### GET /appointments
List patient appointments with filtering

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: PENDING, CONFIRMED, CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)
- `department`: string (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "appointmentDate": "2024-01-15T10:00:00Z",
      "department": "General",
      "status": "CONFIRMED",
      "type": "SCHEDULED",
      "reason": "Annual check-up",
      "priority": "ROUTINE",
      "doctor": {
        "id": "uuid",
        "firstName": "Sarah",
        "lastName": "Kamau",
        "specialization": "General Practitioner"
      },
      "queueEntry": {
        "id": "uuid",
        "queueNumber": 12,
        "status": "WAITING",
        "estimatedWaitTime": 15
      },
      "videoLink": "https://meet.google.com/abc-def-ghi",
      "notes": "Bring previous test results"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### POST /appointments
Create new appointment

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "appointmentDate": "2024-01-15T10:00:00Z",
  "department": "General",
  "type": "SCHEDULED",
  "reason": "Annual check-up",
  "priority": "ROUTINE",
  "doctorId": "uuid",
  "notes": "Bring previous test results"
}
```

**Response:**
```json
{
  "id": "uuid",
  "appointmentDate": "2024-01-15T10:00:00Z",
  "department": "General",
  "status": "PENDING",
  "type": "SCHEDULED",
  "doctor": {
    "id": "uuid",
    "firstName": "Sarah",
    "lastName": "Kamau"
  }
}
```

---

## Consultations Endpoints

### GET /consultations/patients/:patientId
Get patient consultation history

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "consultationDate": "2024-01-15",
      "consultationTime": "10:30:00",
      "status": "COMPLETED",
      "doctor": {
        "id": "uuid",
        "firstName": "Sarah",
        "lastName": "Kamau",
        "specialization": "General Practitioner"
      },
      "diagnoses": [
        {
          "icdCode": "A00",
          "description": "Malaria",
          "type": "PRIMARY"
        }
      ],
      "prescriptions": [
        {
          "id": "uuid",
          "medicationName": "Artemether/Lumefantrine",
          "dosage": "20/120mg",
          "frequency": "Twice daily",
          "durationDays": 3,
          "status": "DISPENSED"
        }
      ],
      "labRequests": [
        {
          "id": "uuid",
          "testName": "Complete Blood Count",
          "status": "COMPLETED",
          "resultValue": "Normal",
          "isAbnormal": false
        }
      ],
      "followUpDate": "2024-01-22"
    }
  ]
}
```

---

## Prescriptions Endpoints

### GET /prescriptions/patients/:patientId
Get patient prescriptions

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "consultationId": "uuid",
      "doctorId": "uuid",
      "doctorName": "Dr. Sarah Kamau",
      "prescriptionDate": "2024-01-15",
      "status": "DISPENSED",
      "medications": [
        {
          "id": "uuid",
          "name": "Artemether/Lumefantrine",
          "dosage": "20/120mg",
          "frequency": "Twice daily",
          "route": "ORAL",
          "durationDays": 3,
          "quantity": 12,
          "instructions": "Take after meals",
          "isAiSuggested": false,
          "dispensedAt": "2024-01-15T14:30:00Z"
        }
      ]
    }
  ]
}
```

---

## Lab Results Endpoints

### GET /lab-requests/patients/:patientId
Get patient lab requests and results

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "testName": "Complete Blood Count",
      "category": "Hematology",
      "priority": "ROUTINE",
      "status": "COMPLETED",
      "requestedDate": "2024-01-15",
      "resultDate": "2024-01-15",
      "result": {
        "value": "Normal",
        "isAbnormal": false,
        "note": "All parameters within normal range"
      },
      "doctorName": "Dr. Sarah Kamau",
      "resultedByName": "Lab Tech John"
    }
  ]
}
```

---

## Billing Endpoints

### GET /bills/patients/:patientId
Get patient billing history

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "billNumber": "INV-2024-000001",
      "billDate": "2024-01-15",
      "status": "PAID",
      "totalAmount": 2500.00,
      "paidAmount": 2500.00,
      "balance": 0,
      "paymentMethod": "MPESA",
      "items": [
        {
          "itemType": "CONSULTATION",
          "itemName": "General Consultation",
          "quantity": 1,
          "unitPrice": 1000,
          "totalPrice": 1000
        },
        {
          "itemType": "LAB_TEST",
          "itemName": "Complete Blood Count",
          "quantity": 1,
          "unitPrice": 500,
          "totalPrice": 500
        }
      ]
    }
  ]
}
```

---

## Messaging Endpoints

### GET /messaging/conversations
Get patient conversations

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "participant": {
        "id": "uuid",
        "firstName": "Sarah",
        "lastName": "Kamau",
        "role": "DOCTOR"
      },
      "lastMessage": {
        "content": "Your test results are ready",
        "timestamp": "2024-01-15T16:30:00Z",
        "sender": "DOCTOR"
      },
      "unreadCount": 2
    }
  ]
}
```

---

## Notifications Endpoints

### GET /notifications
Get patient notifications

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "APPOINTMENT_REMINDER",
      "title": "Appointment Tomorrow",
      "message": "You have an appointment with Dr. Kamau at 10:00 AM",
      "timestamp": "2024-01-15T18:00:00Z",
      "isRead": false
    }
  ]
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes
- `VALIDATION_ERROR` - 400
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `CONFLICT` - 409
- `INTERNAL_ERROR` - 500

---

## Mobile-Specific Considerations

### Offline Support
- Use local storage for offline data
- Sync when connection restored
- Queue mutations for retry

### Performance
- Paginate all list endpoints (default: 20 items)
- Use ETags for caching
- Compress responses

### Security
- All endpoints require authentication
- Refresh tokens for session management
- Device binding for additional security
- Biometric authentication fallback
