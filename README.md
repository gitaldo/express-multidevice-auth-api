# Express.js Authentication & Device Management API

API ini menggunakan Express.js, Prisma, PostgreSQL, Redis, JWT, dan Swagger untuk mendukung sistem login, refresh token, logout, dan manajemen perangkat.  

## Fitur

- Register dan login user
- Access Token & Refresh Token (rotating)
- Refresh token disimpan di PostgreSQL & Redis
- Logout & revoke refresh token
- Middleware auth untuk proteksi route
- Device management: hanya 1 device aktif atau verifikasi device baru
- Notifikasi email ke perangkat lama saat device baru diverifikasi
- Rate limiter berbasis IP + Device ID
- Swagger/OpenAPI documentation

## Teknologi

- Node.js + Express.js
- Prisma ORM + PostgreSQL
- Redis
- JWT (jsonwebtoken)
- bcrypt
- Nodemailer
- Zod / Joi untuk validasi
- Swagger-jsdoc + Swagger-UI

## Instalasi

1. Clone repo

```bash
git clone <repo-url>
cd <project-folder>
