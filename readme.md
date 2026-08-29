# MERN Authentication System

A production-style authentication and authorization backend built using the MERN stack.

## Project Structure

- `frontend/` - React/Vite frontend application
- `mern-Auth-System/` - Node.js/Express backend application

## Deployment

This application is designed to be deployed with:
- Frontend: Vercel
- Backend: Render (or similar Node.js hosting)
- Database: MongoDB Atlas

## Environment Variables

### Backend (Render)
- `PORT` - Auto-assigned by Render
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for JWT signing
- `REFRESH_TOKEN_SECRET` - Secret for refresh token signing
- `NODEMAILER_EMAIL` - Email for sending OTPs
- `NODEMAILER_PASS` - Email password or app password
- `TWILIO_ACCOUNT_SID` - Twilio account SID (optional)
- `TWILIO_AUTH_TOKEN` - Twilio auth token (optional)
- `TWILIO_PHONE_NUMBER` - Twilio phone number (optional)
- `FRONTEND_URL` - URL of your deployed frontend

### Frontend (Vercel)
- `VITE_API_URL` - URL of your deployed backend

## Local Development

1. Install dependencies:
   ```bash
   # Backend
   cd mern-Auth-System
   npm install

   # Frontend
   cd frontend
   npm install

2. Set up environment variables in .env files

3. Start development servers:

# Backend (in mern-Auth-System)
npm run dev

# Frontend (in frontend)
npm run dev
