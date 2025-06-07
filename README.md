# User Authentication System

A production-ready authentication system built with Node.js and JWT. This project demonstrates industry-standard security practices, clean architecture, and modern deployment patterns with file-based storage - **no database required!**

## 🚀 Features

- **User Registration & Login** - Secure user authentication with email/password
- **JWT Authentication** - Stateless authentication with access and refresh tokens
- **Password Security** - Bcrypt hashing with configurable rounds
- **Session Management** - Refresh token rotation and secure logout
- **Input Validation** - Comprehensive request validation using Joi
- **Error Handling** - Centralized error handling with detailed logging
- **Security Headers** - Helmet.js for security headers and CORS protection
- **File-based Storage** - JSON file storage for users and tokens (no database needed)
- **Cloud Ready** - Deploy to Vercel, Netlify, or any cloud platform
- **Logging** - Winston-based logging with file rotation
- **Environment Configuration** - Secure environment variable management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js with function-based endpoints
- **Storage**: File-based JSON storage
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- **No database required!** 🎉

## 💻 Local Development

### 1. Install Dependencies

```bash
git clone <your-repo-url>
cd user-auth-system-serverless
npm install
```

### 2. Set up Environment

```bash
cp .env.example .env
# Edit .env with your JWT secrets (no database config needed!)
```

⚠️ **SECURITY WARNING**: Never commit `.env` files or `data/` directory to version control!

### 3. Start the Development Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 4. Open Your Browser

```
http://localhost:3000
```

Visit the URL to see the authentication system in action!

## 🚀 Cloud Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`

### Deploy to Netlify

1. Build for Netlify:
```bash
npm run build
```

2. Deploy using Netlify CLI or drag & drop the project folder

### File Storage

- User data is stored in `data/users.json`
- Refresh tokens are stored in `data/refresh_tokens.json`
- Files are automatically created on first run
- **No database setup required!**

⚠️ **SECURITY**: The `data/` directory is excluded from git to prevent exposing sensitive user data and JWT tokens.

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/profile` - Get user profile

### Health Check
- `GET /api/health` - Server health status

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- File-based storage (no SQL injection possible)
- Modern architecture for enhanced security

### 🚨 Security Best Practices

**NEVER commit sensitive data to version control:**
- ❌ Don't commit `.env` files
- ❌ Don't commit `data/` directory
- ❌ Don't commit JWT tokens or user data
- ✅ Use `.gitignore` to exclude sensitive files
- ✅ Use environment variables for secrets
- ✅ Rotate JWT secrets regularly in production

## 🧪 Testing

Run the comprehensive API test suite:

```bash
# Test local development server
npm test

# Test production deployment
npm run test:prod
```

## 🔄 Data Migration

When moving to production with a database:

```bash
# Create migration files and backup
npm run migrate
```

This generates:
- SQL migration file for relational databases
- JSON export for NoSQL databases
- Backup of current data

## 📁 Project Structure

```
├── api/                    # Function endpoints
│   ├── auth/              # Authentication endpoints
│   └── users/             # User management endpoints
├── data/                  # File-based storage (auto-created)
├── public/                # Frontend static files
├── scripts/               # Utility scripts
├── src/                   # Core application logic
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── index.js              # Local development server
├── vercel.json           # Deployment config
└── DEPLOYMENT.md         # Detailed deployment guide
```

## 🎯 Key Features Implemented

✅ **Modern Architecture** - No server required, deploy anywhere
✅ **File-based Storage** - No database setup needed
✅ **JWT Authentication** - Secure token-based auth
✅ **Password Security** - Bcrypt hashing
✅ **Input Validation** - Joi schema validation
✅ **Error Handling** - Comprehensive error management
✅ **CORS Support** - Cross-origin resource sharing
✅ **Security Headers** - Helmet.js protection
✅ **Logging** - Winston-based logging
✅ **Migration Tools** - Easy database migration
✅ **Testing Suite** - Automated API testing
✅ **Deployment Ready** - Vercel/Netlify compatible

## 📄 License

MIT License - feel free to use this project!
