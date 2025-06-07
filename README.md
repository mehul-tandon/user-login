# User Authentication System

A production-ready authentication system built with Node.js, Express, MySQL, and JWT. This project demonstrates industry-standard security practices, clean architecture, and professional-grade code organization.

## 🚀 Features

- **User Registration & Login** - Secure user authentication with email/password
- **JWT Authentication** - Stateless authentication with access and refresh tokens
- **Password Security** - Bcrypt hashing with configurable rounds
- **Session Management** - Refresh token rotation and secure logout
- **Input Validation** - Comprehensive request validation using Joi
- **Error Handling** - Centralized error handling with detailed logging
- **Security Headers** - Helmet.js for security headers and CORS protection
- **Rate Limiting** - Built-in rate limiting to prevent abuse
- **Database Integration** - MySQL with connection pooling
- **Logging** - Winston-based logging with file rotation
- **Environment Configuration** - Secure environment variable management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 💻 Local Development

### 1. Install Dependencies

```bash
git clone <your-repo-url>
cd user-auth-system
npm install
```

### 2. Set up Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Set up Database

```bash
mysql -u root -p < scripts/setup-database.sql
```

### 4. Start the Server

```bash
npm start
# or for development
npm run dev
```

### 5. Open Your Browser

```
http://localhost:3000
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Health Check
- `GET /health` - Server health status

## 🎯 Demo Account

Try with:
- **Email**: `john@example.com`
- **Password**: `Password123!`

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting protection
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- SQL injection prevention

## 📄 License

MIT License - feel free to use this project!
