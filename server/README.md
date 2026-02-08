# Schemz Backend - Government Scheme Eligibility Platform

## 🎯 Overview

A rule-based eligibility matching platform where government schemes are proposed by departments, approved by authorities, and dynamically matched to citizen profiles without backend code changes.

## 🏗️ Architecture

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication & profile
│   ├── schemeController.js      # User scheme viewing
│   ├── organizerController.js   # Scheme creation & management
│   └── adminController.js       # Approval workflow
├── middleware/
│   └── auth.js                  # JWT & role-based auth
├── models/
│   ├── User.js                  # User with roles
│   └── Scheme.js                # Scheme with embedded rules
├── routes/
│   ├── authRoutes.js
│   ├── schemeRoutes.js
│   ├── organizerRoutes.js
│   └── adminRoutes.js
├── services/
│   └── eligibilityEngine.js     # Core matching logic 🧠
└── server.js                    # Express app entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

```bash
cd server
npm install
```

### Environment Setup

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schemz
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📋 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

### 🔐 Authentication Routes

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // user | organizer | admin
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 25,
  "income": 200000,
  "category": "OBC",
  "education": "Graduate",
  "gender": "Male",
  "state": "Maharashtra",
  "disability": false,
  "occupation": "Student"
}
```

---

### 👤 User Routes (Citizen)

#### Get Eligible Schemes (Matched)
```http
GET /schemes/match
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "scheme": {
        "_id": "...",
        "name": "PM Awas Yojana",
        "description": "...",
        "benefits": "...",
        "ministry": "Ministry of Housing"
      },
      "matchPercentage": 91,
      "matchedRules": [...]
    }
  ]
}
```

#### Get All Approved Schemes
```http
GET /schemes
```

#### Get Single Scheme
```http
GET /schemes/:id
```

---

### 🧑‍💼 Organizer Routes

**All routes require `Authorization: Bearer <token>` and `organizer` role**

#### Create Scheme
```http
POST /organizer/scheme
Content-Type: application/json

{
  "name": "PM Scholarship Scheme",
  "description": "Scholarship for meritorious students",
  "benefits": "₹50,000 per year",
  "ministry": "Ministry of Education",
  "rules": [
    {
      "field": "age",
      "operator": "<=",
      "value": 25,
      "weight": 20
    },
    {
      "field": "income",
      "operator": "<=",
      "value": 300000,
      "weight": 30
    },
    {
      "field": "education",
      "operator": "in",
      "value": ["Graduate", "Post Graduate"],
      "weight": 50
    }
  ]
}
```

#### Get My Schemes
```http
GET /organizer/schemes
```

#### Update Scheme (Draft/Rejected only)
```http
PUT /organizer/scheme/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "...",
  "benefits": "...",
  "ministry": "...",
  "rules": [...]
}
```

#### Submit for Approval
```http
POST /organizer/scheme/:id/submit
```

#### Delete Scheme (Draft only)
```http
DELETE /organizer/scheme/:id
```

---

### 🛠 Admin Routes

**All routes require `Authorization: Bearer <token>` and `admin` role**

#### Get Pending Schemes
```http
GET /admin/schemes/pending
```

#### Get All Schemes
```http
GET /admin/schemes?status=approved
```

#### Approve Scheme
```http
POST /admin/scheme/:id/approve
Content-Type: application/json

{
  "remarks": "Approved after review"
}
```

#### Reject Scheme
```http
POST /admin/scheme/:id/reject
Content-Type: application/json

{
  "remarks": "Eligibility criteria too broad"
}
```

#### Toggle Scheme Status
```http
PUT /admin/scheme/:id/toggle
```

#### Get Pending Organizer Applications
```http
GET /admin/applications/pending
```

#### Get All Organizer Applications
```http
GET /admin/applications?status=pending
```

#### Approve Organizer Application
```http
POST /admin/application/:id/approve
Content-Type: application/json

{
  "remarks": "Application approved - user promoted to organizer"
}
```

**Note:** This automatically changes the user's role from `user` to `organizer`.

#### Reject Organizer Application
```http
POST /admin/application/:id/reject
Content-Type: application/json

{
  "remarks": "Insufficient experience in government schemes"
}
```

---

### 📝 Application Routes (User → Organizer)

**All routes require `Authorization: Bearer <token>` and `user` role**

#### Submit Organizer Application
```http
POST /application/organizer
Content-Type: application/json

{
  "organization": "Ministry of Rural Development",
  "designation": "Assistant Director",
  "reason": "I have 5 years of experience in government welfare programs and want to contribute by creating schemes for rural development...",
  "contactNumber": "+91-9876543210"
}
```

#### Get My Applications
```http
GET /application/my-applications
```

#### Get Application Status
```http
GET /application/status
```

---

## 🧠 Eligibility Engine

### How It Works

1. **Rule Evaluation**: Each rule is evaluated against user profile
2. **Weight Calculation**: Matched rules contribute their weight
3. **Scoring**: `match % = (matchedWeight / totalWeight) × 100`
4. **Ranking**: Schemes sorted by match percentage

### Supported Operators

- `==` - Equal to
- `!=` - Not equal to
- `<` - Less than
- `<=` - Less than or equal to
- `>` - Greater than
- `>=` - Greater than or equal to
- `in` - Value in array
- `not in` - Value not in array

### Supported Fields

- `age` (Number)
- `income` (Number)
- `category` (String: General, OBC, SC, ST, EWS)
- `education` (String)
- `gender` (String: Male, Female, Other)
- `state` (String)
- `disability` (Boolean)
- `occupation` (String)

---

## 🔒 Security

- **JWT Authentication**: All protected routes require valid JWT token
- **Role-Based Access Control**: 
  - `user` - Can view and match schemes, apply to become organizer
  - `organizer` - Can create and manage schemes
  - `admin` - Can approve/reject schemes and organizer applications
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Express validator middleware
- **Role Promotion**: Users can apply to become organizers; admins approve

---

## 📊 Workflows

### Scheme Lifecycle

```
Draft → Pending → Approved/Rejected
  ↓        ↓           ↓
Organizer  →  Admin  →  Active (visible to users)
```

**Status Flow:**
1. Organizer creates scheme (status: `draft`)
2. Organizer submits for approval (status: `pending`)
3. Admin reviews and approves (status: `approved`, active: `true`)
4. OR Admin rejects with remarks (status: `rejected`)
5. Organizer can edit rejected schemes and resubmit

### Organizer Application Lifecycle

```
User → Application → Admin Review → Organizer
```

**Application Flow:**
1. User submits organizer application with credentials
2. Application status: `pending`
3. Admin reviews application
4. Admin approves → User role changes to `organizer`
5. OR Admin rejects with remarks → User remains `user`
6. User can reapply after rejection

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Create Admin User (via MongoDB)
```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎯 Key Features

✅ **Rule-based eligibility** - No hardcoded logic  
✅ **Approval workflow** - Admin-controlled governance  
✅ **Scoring-based matching** - Probabilistic, not binary  
✅ **Zero redeployments** - Policy changes via UI  
✅ **Role-based access** - User, Organizer, Admin  
✅ **Role promotion system** - Users can apply to become organizers  

---

## 📝 Time Complexity

**Eligibility Matching:** `O(S × R)`
- S = number of approved schemes
- R = average number of rules per scheme

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

### JWT Token Invalid
- Check if token is expired
- Verify `JWT_SECRET` matches

### Role Authorization Failed
- Verify user role in database
- Check if correct token is being sent

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **express-validator** - Input validation

---

## 👨‍💻 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

---

## 📄 License

ISC
