# Schemz - Government Scheme Eligibility Platform

<div align="center">

**A comprehensive platform for managing government schemes, matching citizens with eligible schemes, and streamlining the application process.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [User Roles & Workflows](#user-roles--workflows)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [File Storage](#file-storage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Schemz** is a full-stack web application designed to bridge the gap between government schemes and eligible citizens. The platform enables:

- **Citizens** to discover schemes they're eligible for based on their profile
- **Organizers** (government departments) to create and manage schemes
- **Admins** to review and approve schemes and organizer applications
- **Dynamic eligibility matching** using a rule-based engine (no code changes needed)

The platform uses a sophisticated scoring algorithm to match users with schemes based on their profile data, making it easy for citizens to find relevant government benefits.

---

## ✨ Features

### 👤 User Features
- ✅ User registration
- ✅ Complete profile management
- ✅ View all available schemes
- ✅ Get personalized scheme matches based on profile
- ✅ Apply to schemes with document upload
- ✅ Track application status
- ✅ Apply to become an organizer

### 🏛️ Organizer Features
- ✅ Create and manage government schemes
- ✅ Define eligibility rules using visual rule builder
- ✅ Submit schemes for admin approval
- ✅ View and manage scheme applications
- ✅ Approve/reject citizen applications
- ✅ View application documents (PDFs)
- ✅ Edit and delete draft schemes

### 👨‍💼 Admin Features
- ✅ Review and approve/reject schemes
- ✅ Review and approve/reject organizer applications
- ✅ Toggle scheme active/inactive status
- ✅ View all schemes and applications
- ✅ Comprehensive dashboard with statistics

### 🔧 Technical Features
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ File upload (profile images via Cloudinary, documents via Backblaze B2)
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time notifications with toast messages
- ✅ Protected routes
- ✅ Form validation

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM** - Routing
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Lucide React** - Icons
- **React Hook Form** - Form management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Cloudinary** - Image storage (profile images)
- **Backblaze B2** - Document storage (PDFs)

### Development Tools
- **Nodemon** - Auto-reload for development
- **ESLint** - Code linting
- **Jest** - Testing framework

---

## 📁 Project Structure

```
schemz/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ApplySchemeModal.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RuleBuilder.jsx
│   │   ├── context/        # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── organizer/  # Organizer pages
│   │   │   └── user/       # User pages
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   └── utils/          # Utility functions
│   │       └── profileUtils.js
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend Express application
│   ├── config/             # Configuration
│   │   └── db.js           # MongoDB connection
│   ├── controllers/        # Route controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── organizerController.js
│   │   ├── schemeApplicationController.js
│   │   └── schemeController.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # JWT & authorization
│   ├── models/             # Mongoose models
│   │   ├── Scheme.js
│   │   ├── SchemeApplication.js
│   │   ├── User.js
│   │   └── OrganizerApplication.js
│   ├── routes/             # API routes
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── organizerRoutes.js
│   │   ├── schemeApplicationRoutes.js
│   │   └── schemeRoutes.js
│   ├── services/           # Business logic
│   │   ├── backblazeService.js    # PDF/document storage
│   │   ├── cloudinaryService.js    # Image storage
│   │   ├── eligibilityEngine.js   # Matching algorithm
│   │   └── emailService.js        # Email sending
│   ├── server.js           # Entry point
│   ├── package.json
│   └── .env.example
│
└── tests/                  # Test files
    ├── auth.test.js
    └── scheme.test.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd schemz
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   Copy the example environment files and configure them:
   
   ```bash
   # Backend
   cd ../server
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend (if needed)
   cd ../client
   # Create .env file if needed
   ```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/schemz

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (optional - not currently used)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@schemz.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary (for profile image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Backblaze B2 (for PDF/document storage)
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_app_key
B2_BUCKET_NAME=your_bucket_name
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

### Setting Up Services

#### MongoDB
- **Local**: Install MongoDB locally or use Docker
- **Cloud**: Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

#### Cloudinary (Profile Images)
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Add to `.env` file

#### Backblaze B2 (Documents)
1. Sign up at [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)
2. Create a bucket (public or private)
3. Create application keys with read/write permissions
4. Get bucket name and endpoint
5. Add to `.env` file

See `server/BACKBLAZE_SETUP.md` for detailed Backblaze setup instructions.

#### Email Service
- **Gmail**: Use an [App Password](https://support.google.com/accounts/answer/185833)
- **Production**: Use SendGrid, AWS SES, or similar service

---

## 🏃 Running the Application

### Development Mode

1. **Start MongoDB** (if running locally)
   ```bash
   # Windows
   mongod

   # macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on `http://localhost:3000` (or the port Vite assigns)

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Mode

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd server
   npm start
   ```

3. **Serve the frontend** (using a static file server or integrate with Express)

---

## 👥 User Roles & Workflows

### 🔵 User Role
**Default role for all registered citizens**

**Capabilities:**
- View all approved and active schemes
- Complete profile with personal information
- Get matched schemes based on eligibility
- Apply to schemes with document upload
- Track application status
- Apply to become an organizer

**Workflow:**
1. Register → Login (automatic)
2. Complete profile → View matched schemes
3. Apply to schemes → Track applications

---

### 🟢 Organizer Role
**Government department representatives who create schemes**

**Capabilities:**
- Create new schemes with eligibility rules
- Edit draft/rejected schemes
- Delete draft schemes
- Submit schemes for admin approval
- View applications for their schemes
- Approve/reject citizen applications
- View uploaded documents (PDFs)

**Workflow:**
1. User applies to become organizer
2. Admin approves → Role changes to `organizer`
3. Create scheme → Define rules → Submit for approval
4. Admin approves → Scheme becomes active
5. View applications → Approve/reject applications

---

### 🔴 Admin Role
**Platform administrators**

**Capabilities:**
- Review and approve/reject schemes
- Review and approve/reject organizer applications
- Toggle scheme active/inactive status
- View all schemes and applications
- Access comprehensive dashboard

**Workflow:**
1. Review pending schemes → Approve/Reject
2. Review organizer applications → Approve/Reject
3. Manage scheme status (active/inactive)

**Note:** To create an admin user, update the user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎯 Key Features

### 1. Rule-Based Eligibility Matching

The platform uses a sophisticated eligibility engine that evaluates schemes based on user profiles:

- **Dynamic Rules**: Organizers define eligibility criteria using a visual rule builder
- **Weighted Scoring**: Each rule has a weight, contributing to match percentage
- **Multiple Operators**: Supports `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`
- **No Code Changes**: Add new eligibility criteria without backend modifications

**Example Rule:**
```json
{
  "field": "age",
  "operator": "<=",
  "value": 25,
  "weight": 30
}
```

### 2. Scheme Lifecycle Management

```
Draft → Pending → Approved/Rejected → Active
```

- **Draft**: Organizer creates and edits scheme
- **Pending**: Submitted for admin review
- **Approved**: Admin approves, scheme becomes active
- **Rejected**: Admin rejects with feedback, organizer can resubmit
- **Active**: Visible to users, can receive applications

### 3. Document Management

- **Profile Images**: Stored on Cloudinary
- **Application Documents**: Stored on Backblaze B2
  - Marksheets
  - Income certificates
  - Category certificates
  - Other supporting documents
- **Signed URLs**: Private bucket support with time-limited access

### 4. Application Management

- **Citizens** can apply to schemes with required documents
- **Organizers** can view, approve, or reject applications
- **Document Review**: View PDFs inline or download
- **Status Tracking**: Real-time application status updates

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require `Authorization: Bearer <token>` header.

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user (returns token for auto-login)
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/upload-profile-image` - Upload profile image

#### Schemes (Public)
- `GET /schemes` - Get all approved schemes
- `GET /schemes/:id` - Get scheme details
- `GET /schemes/match` - Get matched schemes for user

#### Organizer Routes
- `POST /organizer/scheme` - Create scheme
- `GET /organizer/schemes` - Get my schemes
- `PUT /organizer/scheme/:id` - Update scheme
- `DELETE /organizer/scheme/:id` - Delete scheme
- `POST /organizer/scheme/:id/submit` - Submit for approval

#### Scheme Applications
- `POST /scheme-applications` - Submit application
- `GET /scheme-applications/my-applications` - Get my applications
- `GET /scheme-applications/scheme/:schemeId` - Get applications for scheme
- `PATCH /scheme-applications/:id/approve` - Approve application
- `PATCH /scheme-applications/:id/reject` - Reject application

#### Admin Routes
- `GET /admin/schemes/pending` - Get pending schemes
- `POST /admin/scheme/:id/approve` - Approve scheme
- `POST /admin/scheme/:id/reject` - Reject scheme
- `PUT /admin/scheme/:id/toggle` - Toggle scheme status
- `GET /admin/applications/pending` - Get pending organizer applications
- `POST /admin/application/:id/approve` - Approve organizer application
- `POST /admin/application/:id/reject` - Reject organizer application

For detailed API documentation, see `server/README.md`.

---

## 📦 File Storage

### Profile Images (Cloudinary)
- **Service**: Cloudinary
- **Purpose**: User profile pictures
- **Format**: Images (JPG, PNG)
- **Max Size**: 5MB
- **Storage**: Cloudinary cloud storage

### Documents (Backblaze B2)
- **Service**: Backblaze B2
- **Purpose**: Application documents (PDFs, images)
- **Format**: PDF, JPG, JPEG, PNG
- **Max Size**: 5MB per file
- **Storage**: Backblaze B2 private bucket with signed URLs
- **Validity**: Signed URLs valid for 7 days

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

---

## 🎨 UI Components

### Reusable Components
- **ConfirmationModal** - Custom confirmation dialogs (replaces `alert()` and `prompt()`)
- **ApplySchemeModal** - Modal for applying to schemes
- **RuleBuilder** - Visual rule builder for eligibility criteria
- **ProtectedRoute** - Route protection based on roles
- **Navbar** - Navigation bar with role-based menu

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **Role-Based Access Control** - User, Organizer, Admin roles
- ✅ **Input Validation** - Server-side validation
- ✅ **Protected Routes** - Frontend route protection
- ✅ **File Upload Validation** - Type and size checks
- ✅ **CORS Configuration** - Cross-origin request handling

---

## 📝 Common Tasks

### Create Admin User
```javascript
// Connect to MongoDB
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Reset Password (via MongoDB)
```javascript
// You'll need to hash the password first using bcrypt
// Or use the forgot password feature (if implemented)
```

### View All Users
```javascript
db.users.find({})
```

### View All Schemes
```javascript
db.schemes.find({})
```

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

**2. JWT Token Expired**
- Login again to get a new token
- Check `JWT_EXPIRE` setting

**3. File Upload Fails**
- Verify Cloudinary/Backblaze credentials
- Check file size limits (5MB)
- Ensure correct file types

**4. Email Not Sending**
- Check email service credentials
- For Gmail, use App Password
- Verify SMTP settings

**5. PDFs Not Loading**
- Ensure Backblaze bucket is configured correctly
- Check signed URL generation
- Verify bucket permissions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Development

### Code Style
- Follow ESLint rules
- Use consistent naming conventions
- Add comments for complex logic
- Keep components modular and reusable

### Best Practices
- ✅ Use async/await for async operations
- ✅ Handle errors gracefully
- ✅ Validate inputs on both client and server
- ✅ Use environment variables for sensitive data
- ✅ Keep components small and focused
- ✅ Use TypeScript (if migrating) for type safety

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review `server/README.md` for backend details

---

## 🎉 Acknowledgments

- Built with React, Express, and MongoDB
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for better government-citizen connectivity**
