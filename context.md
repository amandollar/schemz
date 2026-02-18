# Schemz Project Context

## 1. Project Overview

**Schemz** is a full-stack government scheme eligibility platform designed to bridge the gap between citizens and government benefits.

- **Purpose**: Enables citizens to discover schemes they are eligible for using a rule-based engine, and allows organizers (government depts) to manage schemes and applications.
- **Target Users**:
  - **Citizens (User)**: Browse, match, and apply for schemes.
  - **Organizers**: Create schemes, define eligibility rules, process applications.
  - **Admins**: Oversee platform, approve schemes/organizers.

## 2. Tech Stack

### Frontend

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: React Context API (`AuthContext`)
- **Routing**: `react-router-dom` v7
- **HTTP Client**: `axios` (with interceptors)
- **Forms**: `react-hook-form`
- **Notifications**: `react-toastify`
- **Icons**: `lucide-react`
- **Animations**: `framer-motion`

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: `express-validator` (dependency listed but manual validation seen in controllers)
- **File Upload**: `multer` (memory storage)

### External Services

- **Image Storage**: Cloudinary (Profile images)
- **Document Storage**: Backblaze B2 (Application documents - PDFs, etc.)
- **Email**: `nodemailer` (referenced in dependencies/env, usage to be confirmed)

### Dev Tools

- **Build**: Vite
- **Hot Reload**: Nodemon (backend)
- **Linting**: ESLint

## 3. Folder Structure

```
d:\college\projects\schemz\
├── client/                     # Frontend Vite + React
│   ├── public/
│   ├── src/
│   │   ├── components/         # Shared components (Navbar, ProtectedRoute, etc.)
│   │   ├── context/            # AuthContext.jsx
│   │   ├── pages/              # Views
│   │   │   ├── admin/          # Admin-specific pages
│   │   │   ├── organizer/      # Organizer-specific pages
│   │   │   └── user/           # Citizen/User pages
│   │   ├── services/           # api.js (Axios instance & endpoint methods)
│   │   ├── utils/
│   │   ├── App.jsx             # Main routing logic
│   │   └── main.jsx
│   ├── .env                    # Frontend env vars
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend Express
│   ├── config/                 # db.js
│   ├── controllers/            # Logic for routes
│   ├── middleware/             # auth.js, error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Endpoint definitions
│   ├── services/               # External integrations (Backblaze, Cloudinary)
│   ├── .env                    # Backend secrets
│   └── server.js               # Entry point
└── README.md
```

## 4. Backend Architecture

- **Entry Point**: `server/server.js`. Connects to DB, applies global middleware (`cors`, `express.json`), and mounts routes.
- **Architecture Pattern**: MVC (Model-View-Controller) / Service Layer pattern (separating `services/` logic).
- **Environment**: Loads variables via `dotenv` from `server/.env`.
- **Error Handling**: Global error handler middleware in `server.js`.

### Authentication Logic

1.  **Register/Login**: `authController` creates a user and generates a signed JWT.
2.  **Verification**: `middleware/auth.js` (`protect` function) extracts Bearer token, verifies signature, and attaches `req.user`.
3.  **Role Checks**: `authorize(...roles)` middleware restricts access based on `user.role`.

## 5. Frontend Architecture

- **Routing**: Defined in `App.jsx`. Uses `react-router-dom`.
  - **Wrappers**: `ProtectedRoute` component checks auth state and redirects unauthenticated or unauthorized users.
- **Auth State**:
  - Manage via `AuthContext.jsx`.
  - Persists token in `localStorage`.
  - Initializes user state by calling `/api/auth/me` on mount if token exists.
- **API Communication**:
  - Centralized in `client/src/services/api.js`.
  - **Interceptors**: Automatically attaches `Authorization: Bearer <token>` to requests.
  - **Auto-Logout**: Redirects to `/login` on 401 Unauthorized response.

## 6. Current Authentication Flow

1.  **Login**: User submits credentials to `/api/auth/login`.
2.  **Response**: Server returns `{ token, user }`.
3.  **Client Storage**: `AuthContext` saves `token` to `localStorage`.
4.  **Request Authorization**: Subsequent Axios requests read `token` from `localStorage` and set `Authorization` header.
5.  **Protection**: `ProtectedRoute` checks `isAuthenticated` context flag. If false, redirects to `/login`.

## 7. Database Design

**MongoDB Schemas** (in `server/models/`):

1.  **User (`User.js`)**
    - Fields: `name`, `email`, `password` (hashed), `role` (user/organizer/admin).
    - Profile Data: `age`, `income`, `category`, `education`, `state`, etc. (Used for scheme matching).
    - `profileImage` (Cloudinary URL).

2.  **Scheme (`Scheme.js`)**
    - Metadata: `name`, `description`, `ministry`, `benefits`.
    - Status: `status` (draft/pending/approved/rejected), `active` (boolean).
    - **Rules**: Array of objects `{ field, operator, value, weight }` for the eligibility engine.
    - Owners: `createdBy`, `approvedBy`.

3.  **SchemeApplication (`SchemeApplication.js`)**
    - Links `User` and `Scheme`.
    - Snapshot: `applicantDetails` (copies user profile at time of application).
    - Data: `purpose`, `bankDetails`, `aadhaarNumber`.
    - Documents: `marksheet`, `incomeCertificate` (Stored as URLs).
    - Status: `status` (pending/approved/rejected).

4.  **OrganizerApplication (`OrganizerApplication.js`)**
    - Not fully analyzed deeply, but implies a flow for users to request `organizer` role.

## 8. API Endpoints Summary

**Base URL**: `/api`

### Auth (`/auth`)

- `POST /register`: Create account.
- `POST /login`: Get token.
- `GET /me`: Get current user profile (Protected).
- `PUT /profile`: Update profile fields (Protected).

### Schemes (`/schemes`, `/organizer`, `/admin`)

- `GET /schemes`: Public/User list of active schemes.
- `GET /schemes/match`: Get schemes matching user profile.
- `POST /organizer/scheme`: Create new scheme (Organizer).
- `POST /organizer/scheme/:id/submit`: Submit for approval.
- `POST /admin/scheme/:id/approve`: Approve scheme (Admin).

### Applications (`/scheme-applications`)

- `POST /`: Submit application (User). Documents uploaded here.
- `GET /my-applications`: List user's applications.
- `GET /scheme/:id`: List applications for a specific scheme (Organizer).

## 9. Known Issues / TODO

1.  **Document URL Expiration**:
    - The backend (`backblazeService.js`) generates a signed URL valid for **7 days** upon upload.
    - These URLs are stored directly in the `SchemeApplication` documents.
    - **Risk**: After 7 days, the links in the DB will expire and documents will become inaccessible ("401 Unauthorized" from B2).
    - **Fix Needed**: Store the _file name/ID_ in the DB, and generate a _fresh_ signed URL on demand when the application details are fetched.
2.  **Environment Variables**:
    - In `server.js`, the comment `// Load env vars` appears _after_ imports that might depend on them (though `dotenv.config()` is called early enough in the actual file, the comment placement is slightly misleading).
    - Ensure `.env` is present in both client and server in production.

## 10. How to Run the Project

**Prerequisites**: Node.js, MongoDB (Local or Atlas).

1.  **Setup Backend**:

    ```bash
    cd server
    # Create .env file with PORT, MONGODB_URI, JWT_SECRET, CLOUDINARY_*, B2_* credentials
    npm install
    npm run dev
    ```

    Runs on `http://localhost:5000`.

2.  **Setup Frontend**:

    ```bash
    cd client
    # Create .env with VITE_API_BASE_URL=http://localhost:5000/api
    npm install
    npm run dev
    ```

    Runs on `http://localhost:5173` (or similar).

3.  **Access**:
    Open the frontend URL.
