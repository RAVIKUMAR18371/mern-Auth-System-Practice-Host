# MERN Authentication & Authorization System

A production-style authentication and authorization backend built using the MERN stack.

I built this project step-by-step to understand how authentication actually works in a real backend application instead of only implementing a simple login and signup page.

The main focus of this project is:

- User Registration
- Password Hashing using bcrypt
- Email OTP Verification
- Login Authentication
- JWT Access Tokens
- JWT Refresh Tokens
- Session Management
- Protected Routes
- Role-Based Authorization
- Logout and Session Revocation
- Resend OTP
- REST API architecture
- Modular backend structure
- Validation and error handling


# 1. Project Overview

This project is a backend authentication system developed using Node.js, Express.js and MongoDB.

The main purpose of building this project was to understand how a real authentication system works internally.

A user can:

1. Register an account.
2. Enter a password.
3. Password gets hashed using bcrypt.
4. An OTP is generated.
5. OTP is stored in MongoDB.
6. OTP is sent to the user's email.
7. User verifies the OTP.
8. Account becomes verified.
9. User can login.
10. Server generates an Access Token and Refresh Token.
11. Access Token is used to access protected APIs.
12. Refresh Token is used to generate a new Access Token.
13. Sessions are stored in MongoDB.
14. User can logout.
15. Logout revokes the refresh-token session.
16. User can resend OTP if required.
17. Role-based authorization protects admin-only routes.

---

# 2. Technology Stack

## Backend

- Node.js
- Express.js
- JavaScript
- REST APIs

## Database

- MongoDB
- Mongoose

## Authentication & Security

- JWT
- bcryptjs
- HTTP-only Cookies
- OTP Verification
- Role-Based Authorization

## Development Tools

- Postman
- Nodemon
- dotenv
- Git

---

3. Main Features

User Registration

A new user can register using:

- Name
- Email
- Password

Before saving the password into MongoDB, the password is hashed using bcrypt.

The original password is never stored directly.

Example:

User Password
      ↓
bcrypt
      ↓
Hashed Password
      ↓
MongoDB


