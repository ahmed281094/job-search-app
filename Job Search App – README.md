# Job Search App (Backend)

A backend service for a job marketplace connecting companies and job seekers.

## Core Features

- User & company registration/login
- Role-based access: admin, HR, user
- Job CRUD (with ownership & approval checks)
- Admin dashboard (GraphQL)
- Company approval / ban
- Real-time chat between HR and users (via Socket.IO)

## Technologies

- Node.js
- Express
- MongoDB + Mongoose
- GraphQL for Admin Dashboard
- REST + GraphQL hybrid API design
- JWT Auth & Role-based permissions

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Set up `.env` with DB connection, JWT secret, etc.
4. Run the server: `npm run dev`

## Planned Enhancements

- Resume upload & matching
- Notification system
- Full frontend dashboard

