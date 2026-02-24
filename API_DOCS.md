# Schemz API Documentation

Government Scheme Eligibility Platform — REST API Reference

---

## Base URL

```
http://localhost:5000/api
```

Production: `{VITE_API_BASE_URL}/api`

---

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Roles

| Role      | Description                                      |
|-----------|--------------------------------------------------|
| `user`    | Citizen — browse schemes, apply, manage profile  |
| `organizer` | Scheme creator — create/manage schemes          |
| `admin`   | Platform admin — approve schemes, applications  |

---

## Table of Contents

<details>
<summary><strong>Click to expand — jump to any endpoint</strong></summary>

### [Health](#health)
- [Check server status](#check-server-status) — `GET /api/health`

### [Auth](#auth)
- [Register](#register) — `POST /api/auth/register`
- [Login](#login) — `POST /api/auth/login`
- [Google OAuth Login](#google-oauth-login) — `POST /api/auth/google`
- [Get current user](#get-current-user) — `GET /api/auth/me`
- [Update profile](#update-profile) — `PUT /api/auth/profile`
- [Upload profile image](#upload-profile-image) — `POST /api/auth/upload-profile-image`
- [Upload profile documents](#upload-profile-documents) — `POST /api/auth/upload-profile-documents`

### [Schemes](#schemes)
- [Get all approved schemes](#get-all-approved-schemes) — `GET /api/schemes`
- [Get matched schemes (eligibility)](#get-matched-schemes-eligibility) — `GET /api/schemes/match`
- [Get scheme by ID](#get-scheme-by-id) — `GET /api/schemes/:id`

### [Organizer](#organizer)
- [Create scheme](#create-scheme) — `POST /api/organizer/scheme`
- [Get organizer schemes](#get-organizer-schemes) — `GET /api/organizer/schemes`
- [Update scheme](#update-scheme) — `PUT /api/organizer/scheme/:id`
- [Submit scheme](#submit-scheme-for-approval) — `POST /api/organizer/scheme/:id/submit`
- [Delete scheme](#delete-scheme) — `DELETE /api/organizer/scheme/:id`

### [Admin](#admin)
- [Get pending schemes](#get-pending-schemes) — `GET /api/admin/schemes/pending`
- [Get all schemes](#get-all-schemes) — `GET /api/admin/schemes`
- [Approve scheme](#approve-scheme) — `POST /api/admin/scheme/:id/approve`
- [Reject scheme](#reject-scheme) — `POST /api/admin/scheme/:id/reject`
- [Toggle scheme status](#toggle-scheme-status) — `PUT /api/admin/scheme/:id/toggle`
- [Get pending organizer applications](#get-pending-organizer-applications) — `GET /api/admin/applications/pending`
- [Get all organizer applications](#get-all-organizer-applications) — `GET /api/admin/applications`
- [Approve organizer application](#approve-organizer-application) — `POST /api/admin/application/:id/approve`
- [Reject organizer application](#reject-organizer-application) — `POST /api/admin/application/:id/reject`

### [Application (Organizer)](#application-organizer)
- [Submit organizer application](#submit-organizer-application) — `POST /api/application/organizer`
- [Get my applications](#get-my-applications) — `GET /api/application/my-applications`
- [Get application status](#get-application-status) — `GET /api/application/status`

### [Scheme Applications](#scheme-applications)
- [Submit scheme application](#submit-scheme-application) — `POST /api/scheme-applications`
- [Get my scheme applications](#get-my-scheme-applications) — `GET /api/scheme-applications/my-applications`
- [Check if applied](#check-if-applied-to-scheme) — `GET /api/scheme-applications/check/:schemeId`
- [Get applications for scheme](#get-applications-for-scheme) — `GET /api/scheme-applications/scheme/:schemeId`
- [Get all applications (Admin)](#get-all-applications-admin) — `GET /api/scheme-applications`
- [Approve application](#approve-application) — `PATCH /api/scheme-applications/:id/approve`
- [Reject application](#reject-application) — `PATCH /api/scheme-applications/:id/reject`

### [Support Queries](#support-queries)
- [Create query](#create-query) — `POST /api/support-queries`
- [Get queries](#get-queries) — `GET /api/support-queries`
- [Get query by ID](#get-query-by-id) — `GET /api/support-queries/:id`
- [Send message](#send-message) — `POST /api/support-queries/:id/messages`
- [Resolve query](#resolve-query) — `PATCH /api/support-queries/:id/resolve`

### [AI](#ai)
- [Generate scheme draft](#generate-scheme-draft) — `POST /api/ai/generate-scheme`

</details>

---

## Health

### Check server status

```http
GET /api/health
```

**Access:** Public

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```

---

## Auth

Base path: `/api/auth`

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

**Access:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

| Field     | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| name      | string | Yes      | Full name                      |
| email     | string | Yes      | Email address                  |
| password  | string | Yes      | Min 6 characters               |
| role      | string | No       | `user` (default), `organizer`   |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Access:** Public

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Google OAuth Login

```http
POST /api/auth/google
Content-Type: application/json
```

**Access:** Public

**Request Body:**

```json
{
  "credential": "<Google ID token from frontend>"
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "user",
    "profileImage": "https://..."
  }
}
```

---

### Get current user

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Access:** Private (all roles)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "age": 25,
    "profileImage": "https://..."
  }
}
```

---

### Update profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** Private (all roles)

**Request Body:** (all fields optional)

```json
{
  "name": "John Doe",
  "age": 25,
  "dateOfBirth": "1999-01-15",
  "phone": "9876543210",
  "income": 50000,
  "category": "General",
  "education": "Graduate",
  "gender": "Male",
  "state": "Maharashtra",
  "district": "Mumbai",
  "pinCode": "400001",
  "maritalStatus": "Single",
  "religion": "Hindu",
  "disability": false,
  "occupation": "Engineer",
  "aadhaarNumber": "123456789012",
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "SBI",
    "branchName": "Main Branch"
  }
}
```

| Field       | Type   | Values                                                                 |
|-------------|--------|-----------------------------------------------------------------------|
| category    | string | `General`, `OBC`, `SC`, `ST`, `EWS`                                   |
| education   | string | `Below 10th`, `10th Pass`, `12th Pass`, `Graduate`, `Post Graduate`, `Doctorate` |
| gender      | string | `Male`, `Female`, `Other`                                             |
| maritalStatus | string | `Single`, `Married`, `Widowed`, `Divorced`, `Separated`              |

**Response:** `200 OK`

---

### Upload profile image

```http
POST /api/auth/upload-profile-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Access:** Private (all roles)

**Request Body:** Form data with field `image` (file). Max 5MB. Formats: JPEG, PNG, GIF, WebP.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "profileImage": "https://res.cloudinary.com/...",
    "user": { ... }
  }
}
```

---

### Upload profile documents

```http
POST /api/auth/upload-profile-documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Access:** Private (all roles)

**Request Body:** Form data with fields (all optional, at least one required):

| Field             | Type | Max count |
|-------------------|------|-----------|
| aadhaarDocument   | file | 1         |
| incomeCertificate | file | 1         |
| categoryCertificate | file | 1      |

Formats: PDF, JPG, JPEG, PNG. Max 5MB per file.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Documents uploaded successfully",
  "data": { ... }
}
```

---

## Schemes

Base path: `/api/schemes`

### Get all approved schemes

```http
GET /api/schemes
```

**Access:** Public

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "name": "Scheme Name",
      "description": "...",
      "benefits": "...",
      "ministry": "...",
      "status": "approved",
      "active": true
    }
  ]
}
```

---

### Get matched schemes (eligibility)

```http
GET /api/schemes/match
Authorization: Bearer <token>
```

**Access:** Private (user only)

Returns schemes the current user is eligible for based on profile and rules.

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "scheme": { ... },
      "matchScore": 85,
      "matchedRules": [ ... ]
    }
  ]
}
```

---

### Get scheme by ID

```http
GET /api/schemes/:id
```

**Access:** Public

**Parameters:** `id` — MongoDB ObjectId

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Scheme Name",
    "description": "...",
    "benefits": "...",
    "ministry": "...",
    "rules": [
      {
        "field": "age",
        "operator": ">=",
        "value": 18,
        "weight": 10
      }
    ]
  }
}
```

---

## Organizer

Base path: `/api/organizer`

**Access:** All organizer routes require `organizer` role.

### Create scheme

```http
POST /api/organizer/scheme
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Scheme Name",
  "description": "Detailed description",
  "benefits": "Benefits offered",
  "ministry": "Ministry/Department",
  "rules": [
    {
      "field": "age",
      "operator": ">=",
      "value": 18,
      "weight": 10
    }
  ]
}
```

| Rule field | Type   | Values |
|------------|--------|--------|
| field      | string | `age`, `income`, `category`, `education`, `state`, `gender`, `marital_status`, `disability`, `occupation` |
| operator   | string | `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in` |
| value      | mixed  | string, number, boolean, or array |
| weight     | number | 1–100 |

**Response:** `201 Created`

---

### Get organizer schemes

```http
GET /api/organizer/schemes
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

---

### Update scheme

```http
PUT /api/organizer/scheme/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:** `id` — Scheme ID

**Note:** Only draft or rejected schemes can be updated.

**Request Body:** Same as create scheme.

**Response:** `200 OK`

---

### Submit scheme for approval

```http
POST /api/organizer/scheme/:id/submit
Authorization: Bearer <token>
```

**Parameters:** `id` — Scheme ID

**Note:** Only draft or rejected schemes can be submitted.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "pending",
    ...
  }
}
```

---

### Delete scheme

```http
DELETE /api/organizer/scheme/:id
Authorization: Bearer <token>
```

**Parameters:** `id` — Scheme ID

**Note:** Only draft schemes can be deleted.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Scheme deleted"
}
```

---

## Admin

Base path: `/api/admin`

**Access:** All admin routes require `admin` role.

### Get pending schemes

```http
GET /api/admin/schemes/pending
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

---

### Get all schemes

```http
GET /api/admin/schemes?status=pending
Authorization: Bearer <token>
```

**Query params:** `status` (optional) — `draft`, `pending`, `approved`, `rejected`

**Response:** `200 OK`

---

### Approve scheme

```http
POST /api/admin/scheme/:id/approve
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "remarks": "Approved for launch"
}
```

**Response:** `200 OK`

---

### Reject scheme

```http
POST /api/admin/scheme/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "remarks": "Required documentation missing"
}
```

**Response:** `200 OK`

---

### Toggle scheme status

```http
PUT /api/admin/scheme/:id/toggle
Authorization: Bearer <token>
```

**Parameters:** `id` — Scheme ID

Toggles `active` status for approved schemes.

**Response:** `200 OK`

---

### Get pending organizer applications

```http
GET /api/admin/applications/pending
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Get all organizer applications

```http
GET /api/admin/applications?status=pending
Authorization: Bearer <token>
```

**Query params:** `status` (optional) — `pending`, `approved`, `rejected`

**Response:** `200 OK`

---

### Approve organizer application

```http
POST /api/admin/application/:id/approve
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "remarks": "Application approved"
}
```

**Response:** `200 OK`

---

### Reject organizer application

```http
POST /api/admin/application/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "remarks": "Insufficient experience"
}
```

**Response:** `200 OK`

---

## Application (Organizer)

Base path: `/api/application`

**Access:** All routes require `user` role.

### Submit organizer application

```http
POST /api/application/organizer
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "organization": "Company Name",
  "designation": "Manager",
  "reason": "Reason for applying",
  "contactNumber": "9876543210"
}
```

**Response:** `201 Created`

---

### Get my applications

```http
GET /api/application/my-applications
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Get application status

```http
GET /api/application/status
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "pending",
    "reviewedBy": null,
    ...
  }
}
```

---

## Scheme Applications

Base path: `/api/scheme-applications`

### Submit scheme application

```http
POST /api/scheme-applications
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Access:** Private (user only)

**Request Body:** Form data

| Field             | Type   | Required | Description                    |
|-------------------|--------|----------|--------------------------------|
| schemeId          | string | Yes      | Scheme ID                      |
| applicantDetails  | JSON   | Yes      | Applicant profile (name, email, phone, age, gender, category, state, education, etc.) |
| applicationData   | JSON   | Yes      | `{ purpose, aadhaarNumber?, bankDetails? }` |
| marksheet         | file   | Yes      | Educational certificate (PDF/JPEG/PNG) |
| incomeCertificate | file   | No       | Profile document used if not provided |
| categoryCertificate | file | No       | Profile document used if not provided |
| otherDocuments    | file[] | No       | Up to 5 additional documents   |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { ... }
}
```

---

### Get my scheme applications

```http
GET /api/scheme-applications/my-applications
Authorization: Bearer <token>
```

**Access:** Private (user only)

**Response:** `200 OK`

---

### Check if applied to scheme

```http
GET /api/scheme-applications/check/:schemeId
Authorization: Bearer <token>
```

**Access:** Private (user only)

**Response:** `200 OK`

```json
{
  "success": true,
  "hasApplied": true,
  "application": { ... }
}
```

---

### Get applications for scheme

```http
GET /api/scheme-applications/scheme/:schemeId
Authorization: Bearer <token>
```

**Access:** Private (organizer, admin). Organizers can only view their own schemes.

**Response:** `200 OK`

---

### Get all applications (Admin)

```http
GET /api/scheme-applications?status=pending&schemeId=...
Authorization: Bearer <token>
```

**Access:** Private (admin only)

**Query params:** `status`, `schemeId` (optional)

**Response:** `200 OK`

---

### Approve application

```http
PATCH /api/scheme-applications/:id/approve
Authorization: Bearer <token>
```

**Access:** Private (organizer, admin)

**Response:** `200 OK`

---

### Reject application

```http
PATCH /api/scheme-applications/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** Private (organizer, admin)

**Request Body:**

```json
{
  "reason": "Documents incomplete"
}
```

**Response:** `200 OK`

---

## Support Queries

Base path: `/api/support-queries`

**Access:** All routes require `user`, `organizer`, or `admin`. Users/organizers see only their own; admins see all.

### Create query

```http
POST /api/support-queries
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "subject": "Query subject",
  "message": "Initial message content"
}
```

**Response:** `201 Created`

---

### Get queries

```http
GET /api/support-queries?status=open
Authorization: Bearer <token>
```

**Query params:** `status` (optional) — `open`, `resolved`

**Response:** `200 OK`

---

### Get query by ID

```http
GET /api/support-queries/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Send message

```http
POST /api/support-queries/:id/messages
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Message content"
}
```

**Response:** `201 Created`

---

### Resolve query

```http
PATCH /api/support-queries/:id/resolve
Authorization: Bearer <token>
```

**Access:** Admin only

**Response:** `200 OK`

---

## AI

Base path: `/api/ai`

**Access:** All routes require `organizer` role.

### Generate scheme draft

```http
POST /api/ai/generate-scheme
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "Scholarship for students from rural areas"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "name": "Scheme Name",
    "description": "...",
    "benefits": "...",
    "ministry": "...",
    "rules": [
      {
        "field": "education",
        "operator": "in",
        "value": ["10th Pass", "12th Pass"],
        "weight": 10
      }
    ]
  }
}
```

**Note:** Requires `GOOGLE_GENERATIVE_AI_API_KEY` in environment.

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource not found |
| 500 | Server Error — Internal error |

---

## Summary

| Category | Endpoints |
|----------|-----------|
| Health | 1 |
| Auth | 7 |
| Schemes | 3 |
| Organizer | 5 |
| Admin | 9 |
| Application (Organizer) | 3 |
| Scheme Applications | 7 |
| Support Queries | 5 |
| AI | 1 |
| **Total** | **41** |
