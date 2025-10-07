# 🔐 Express MultiDevice Auth API

A robust, production-ready authentication and device management system built with Express.js. Features secure JWT-based authentication, multi-device session management, and comprehensive security measures.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure access and refresh token implementation
- **Password Hashing** - bcrypt with salt rounds for maximum security
- **Rotating Refresh Tokens** - Enhanced security with token rotation
- **Rate Limiting** - IP + Device ID based request throttling
- **CORS Protection** - Configurable cross-origin resource sharing

### 📱 Multi-Device Management
- **Device Tracking** - Monitor active devices and sessions
- **Device Verification** - Email validation for new device logins
- **Concurrent Session Control** - Configurable device limits per user
- **Session Management** - Real-time device and session oversight
- **Automatic Logout Notifications** - Email alerts for suspicious activity

### 🛡️ Security Features
- **Helmet.js** - Security headers protection
- **Input Validation** - Zod/Joi request validation
- **SQL Injection Prevention** - Prisma ORM with parameterized queries
- **XSS Protection** - Data sanitization and encoding
- **CSRF Protection** - Built-in cross-site request forgery prevention


## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/express-multidevice-auth-api.git
cd express-multidevice-auth-api

npm install

cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Development
npm run dev

# Production
npm start