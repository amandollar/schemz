# Schemz - Government Scheme Eligibility Platform

<div align="center">

**A full-stack platform connecting citizens with government schemes through intelligent eligibility matching.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [User Roles & Workflows](#-user-roles--workflows)
- [Key Features](#-key-features)
- [API Documentation](#-api-documentation)
- [File Storage](#-file-storage)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Schemz** bridges the gap between government schemes and eligible citizens across India. The platform enables:

| Role | Capability |
|------|------------|
| **Citizens** | Discover schemes tailored to their profile, apply with documents, and track status |
| **Organizers** | Create schemes, define eligibility rules, and process citizen applications |
| **Admins** | Approve schemes and organizer applications, manage platform-wide settings |

**Core differentiator:** A rule-based eligibility engine that scores users against schemes—no code changes needed to add new criteria.

---

## ✨ Features

### 👤 Citizen Features

| Feature | Description |
|---------|-------------|
| **Registration & Auth** | Email/password or Google OAuth sign-in |
| **Profile Management** | Demographics, Aadhaar, bank details, common documents (upload once, reuse) |
| **Scheme Discovery** | Browse all schemes or view personalized matches with eligibility scores |
| **Apply to Schemes** | Submit applications with documents; profile docs auto-filled when available |
| **Application Tracking** | View status (pending/approved/rejected) and uploaded documents |
| **Organizer Application** | Request to become an organizer (govt department representative) |

### 🏛️ Organizer Features

| Feature | Description |
|---------|-------------|
| **Scheme Creation** | Create schemes with name, description, benefits, ministry |
| **Visual Rule Builder** | Define eligibility rules (age, income, category, education, state, etc.) with weights |
| **Scheme Lifecycle** | Draft → Submit → Admin approves/rejects → Active |
| **Application Management** | View, approve, or reject citizen applications with document review |
| **Scheme Management** | Edit drafts, delete drafts, resubmit rejected schemes |
| **Support Queries** | Chat with admin for support; create queries, send messages, track status |

### 👨‍💼 Admin Features

| Feature | Description |
|---------|-------------|
| **Scheme Approval** | Review and approve/reject pending schemes |
| **Organizer Approval** | Approve/reject users applying to become organizers |
| **Scheme Toggle** | Activate/deactivate approved schemes |
| **Support Queries** | View all organizer queries, respond in real-time, resolve queries |
| **Dashboard** | Overview of pending items, total schemes, and applications |

### 🔧 Technical Features

- JWT authentication with Google OAuth support
- Role-based access control (user, organizer, admin)
- **Real-time chat** via Socket.io (support queries)
- Profile images via Cloudinary; documents via Backblaze B2
- Responsive UI with Tailwind CSS and Framer Motion
- Protected routes and form validation

---

## ⚡ Quick Start

```bash
# Clone and install
git clone <repository-url>
cd schemz

# Backend
cd server && npm install && cp .env.example .env
# Edit .env with MONGODB_URI, JWT_SECRET, Cloudinary, B2 credentials

# Frontend
cd ../client && npm install
# Create .env with VITE_API_BASE_URL=http://localhost:5000/api

# Run (MongoDB must be running)
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev

# Open http://localhost:5173
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS, Axios, React Toastify, Lucide React, Framer Motion, Socket.io Client |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Socket.io |
| **Auth** | JWT, Bcrypt, Google OAuth |
| **Storage** | Cloudinary (images), Backblaze B2 (documents) |
| **Email** | Nodemailer (optional) |

---

## 📁 Project Structure

```
schemz/
├── client/                     # React 19 + Vite
│   ├── src/
│   │   ├── components/         # ApplySchemeModal, RuleBuilder, Navbar, ProtectedRoute, etc.
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # Landing, Login, user/, organizer/, admin/, shared/
│   │   │   └── shared/         # SupportQueries (organizer + admin)
│   │   ├── services/           # api.js (Axios + endpoints)
│   │   └── utils/              # profileUtils.js
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express + MongoDB + Socket.io
│   ├── config/                 # db.js
│   ├── controllers/           # auth, scheme, schemeApplication, organizer, admin, supportQuery
│   ├── middleware/             # auth.js, validateObjectId.js
│   ├── models/                 # User, Scheme, SchemeApplication, OrganizerApplication, SupportQuery
│   ├── routes/                 # auth, admin, organizer, scheme, schemeApplication, application, supportQuery
│   ├── services/               # eligibilityEngine, cloudinary, backblaze, email
│   ├── server.js               # Express + HTTP server + Socket.io
│   └── .env.example
│
└── tests/                      # Jest tests
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/schemz

# JWT
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRE=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@schemz.com
FRONTEND_URL=http://localhost:5173

# Cloudinary (profile images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Backblaze B2 (documents)
B2_APPLICATION_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_NAME=
B2_ENDPOINT=

# Google AI (Gemini) - for AI Assist when creating schemes
GOOGLE_GENERATIVE_AI_API_KEY=

# Google OAuth (used by backend to verify tokens)
GOOGLE_CLIENT_ID=
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Service Setup

| Service | Purpose |
|---------|---------|
| **MongoDB** | Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| **Cloudinary** | [Sign up](https://cloudinary.com) for profile images |
| **Backblaze B2** | [Sign up](https://www.backblaze.com/b2/) for document storage; see `server/BACKBLAZE_SETUP.md` |
| **Google OAuth** | [Google Cloud Console](https://console.cloud.google.com/) → Create OAuth 2.0 Client ID (Web) |
| **Google AI (Gemini)** | [AI Studio](https://aistudio.google.com/apikey) → Create API key for AI Assist (scheme creation) |

---

## 🏃 Running the Application

### Development

1. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

2. **Backend**
   ```bash
   cd server
   npm run dev
   ```
   → `http://localhost:5000`

3. **Frontend**
   ```bash
   cd client
   npm run dev
   ```
   → `http://localhost:5173`

### Production

```bash
cd client && npm run build
cd ../server && npm start
```

Serve the `client/dist` folder (e.g., via Express static or nginx).

---

## 👥 User Roles & Workflows

### 🔵 Citizen

1. Register / Login (email or Google)
2. Complete profile (demographics, Aadhaar, bank, documents)
3. View matched schemes → Apply → Track in My Applications

### 🟢 Organizer

1. Citizen applies at `/user/apply-organizer`
2. Admin approves → role changes to `organizer`
3. Create scheme → Define rules → Submit for approval
4. Admin approves → Scheme goes live
5. View applications → Approve/reject

### 🔴 Admin

- Approve/reject schemes and organizer applications
- Toggle scheme active/inactive
- View all schemes and applications
- Respond to support queries and resolve them (real-time chat)

**Create admin user:**
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎯 Key Features

### 1. Rule-Based Eligibility Engine

- **Fields:** age, income, category, education, state, gender, marital_status, disability, occupation
- **Operators:** `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`
- **Weights:** Each rule contributes to match percentage (0–100%)

### 2. Scheme Lifecycle

```
Draft → Pending → Approved/Rejected → Active
```

### 3. Profile Documents (Upload Once, Reuse)

- Aadhaar document, income certificate, category certificate stored in profile
- Auto-filled when applying to schemes; user can override per application
- Marksheet remains per-application (scheme-specific)

### 4. Document Storage

| Type | Service | Format |
|------|---------|--------|
| Profile images | Cloudinary | JPG, PNG (max 5MB) |
| Application docs | Backblaze B2 | PDF, JPG, PNG (max 5MB) |

### 5. Support Query Chat (Real-time)

- **Organizers** create support queries and chat with admin
- **Admins** view all queries, respond, and resolve
- **Socket.io** for live message delivery and resolve notifications
- Routes: `/organizer/support-queries`, `/admin/support-queries`

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** `Authorization: Bearer <token>` for protected routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register (returns token) |
| POST | `/auth/login` | Login |
| POST | `/auth/google` | Google OAuth |
| GET | `/auth/me` | Current user |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/upload-profile-image` | Profile image |
| POST | `/auth/upload-profile-documents` | Aadhaar, income cert, category cert |

### Schemes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schemes` | All approved schemes |
| GET | `/schemes/:id` | Scheme details |
| GET | `/schemes/match` | Matched schemes (auth required) |

### Scheme Applications (Citizen → Scheme)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scheme-applications` | Submit application |
| GET | `/scheme-applications/my-applications` | My applications |
| GET | `/scheme-applications/check/:schemeId` | Check if applied |

### Organizer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/organizer/scheme` | Create scheme |
| GET | `/organizer/schemes` | My schemes |
| PUT | `/organizer/scheme/:id` | Update scheme |
| DELETE | `/organizer/scheme/:id` | Delete draft |
| POST | `/organizer/scheme/:id/submit` | Submit for approval |
| GET | `/scheme-applications/scheme/:schemeId` | Applications for scheme |
| PATCH | `/scheme-applications/:id/approve` | Approve application |
| PATCH | `/scheme-applications/:id/reject` | Reject application |

### Organizer Application (User → Organizer Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/application/organizer` | Apply as organizer |
| GET | `/application/status` | My organizer application status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/schemes/pending` | Pending schemes |
| POST | `/admin/scheme/:id/approve` | Approve scheme |
| POST | `/admin/scheme/:id/reject` | Reject scheme |
| PUT | `/admin/scheme/:id/toggle` | Toggle active |
| GET | `/admin/applications/pending` | Pending organizer applications |
| POST | `/admin/application/:id/approve` | Approve organizer |
| POST | `/admin/application/:id/reject` | Reject organizer |

### Support Queries (Organizer & Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/support-queries` | Create query |
| GET | `/support-queries` | List queries (`?status=open\|resolved` for admin) |
| GET | `/support-queries/:id` | Get query with messages |
| POST | `/support-queries/:id/messages` | Send message |
| PATCH | `/support-queries/:id/resolve` | Resolve query (admin only) |

**Real-time:** Socket.io connects to server origin; events: `new-message`, `query-resolved`.

---

## 📦 File Storage

| Service | Purpose | Notes |
|---------|---------|-------|
| **Cloudinary** | Profile images | Direct URLs |
| **Backblaze B2** | Application documents | Signed URLs (7-day validity) |

---

## 🧪 Testing

```bash
cd server
npm test
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check `MONGODB_URI`, ensure MongoDB is running |
| JWT expired | Re-login |
| File upload fails | Verify Cloudinary/B2 credentials, 5MB limit |
| Google OAuth fails | Check `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client) |
| PDFs not loading | B2 signed URLs expire in 7 days; regenerate on fetch |
| Support chat not real-time | Ensure `FRONTEND_URL` matches client origin (e.g. `http://localhost:5173`); Socket.io CORS must allow it |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License

---

**Made with ❤️ for better government-citizen connectivity**
