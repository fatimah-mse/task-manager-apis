# Team Work Task Management System

> README file for Graduation Project — REST API built with Node.js, Express, and MongoDB

## 🧩 Project Overview

A system to manage team projects and tasks where the manager can create projects and assign tasks to team members, while team members can track their assigned tasks, add notes, update progress, participate in group chat, and export reports. The system includes authentication & authorization, activity logging, and a note history for each task.

## ✨ Key Features

- Authentication with **JWT** and password hashing with **Argon2**.
- Role-based access: **Manager** and **Team Member** with different permissions.
- Full CRUD for projects, tasks, and notes.
- Tasks linked to projects and assigned to specific members.
- Notes system linked to each task with timestamps and author records.
- Activity Logs to track important actions (create/update/delete, logins, etc.).
- Real-time notifications (WebSocket) for new task assignments and important updates.
- Advanced task filtering and searching (by status, project, assignee, due date).
- PDF export for project or task lists.
- Security measures: Helmet, CORS, rate-limiting, and input validation.
- Group chat functionality for team communication.

## 🛠️ Tech Stack & Libraries

- Language: **Node.js**
- Framework: **Express.js**
- Database: **MongoDB** (with Mongoose)
- Hosting: MongoDB Atlas
- Authentication: **JWT**
- Password Hashing: **argon2**
- Security: `helmet`, `cors`, `express-rate-limit`
- WebSocket: `socket.io`
- PDF generation: `pdfkit`
- API Documentation: **Postman**

## 📦 Suggested Project Structure

```
project-root/
├─ src/
│  ├─ config/
│  ├─ controllers/
│  ├─ fonts/
│  ├─ helpers/
│  ├─ middlewares/
│  ├─ models/
│  ├─ reports/
│  ├─ routes/
│  ├─ validation/
│  ├─ app.js/
│  ├─ server.js/
│  └─ socket.js
├─ .env
├─ .gitignore
├─ package.json
└─ README.md
```

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd project-root
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` file (see next section)
4. Run the app in development mode:
   ```bash
   npm run dev
   ```

## 📚 Database Design

### User
- _id
- name
- email
- passwordHash
- role: `admin` | `user`
- timestamp

### Project
- _id
- name
- description
- startDate
- endDate
- totalTasks
- completedTasks
- timestamp

### Task
- _id
- title
- description
- dueDate
- priority: `low` | `medium` | `high` | `urgent`
- status: `pending` | `in progress` | `completed` | `postponed`
- assignedTo (User)
- project (Project)
- timestamp

### Note
- _id
- task (Task)
- author (User)
- content
- timestamp

### Message
- _id
- user (User)
- text 
- timestamp

### OTP
- _id
- user (User)
- password 
- secretKey 
- timestamp

### ActivityLog
- _id
- user (User)
- type: `login` | `create project` | `update task` | `add note`
- description
- project (Project)
- task (Task)
- note (Note)
- timestamp

## 📡 Auth & Authorization

- Registration/Login:
  - Registration: hash password with `argon2.hash()` before saving.
  - Login: verify password with `argon2.verify()` and issue JWT containing `userId` and `role`.
- `authenticate` middleware: validates JWT.
- `authorize(roles...)` middleware: restricts route access based on role.
- Logout:
    - Invalidate JWT on the client side (e.g., remove from local storage or cookies).
    - Optionally maintain a server-side blacklist of revoked tokens until expiry.
- Forgot/Reset Password:
    - Forgot Password: generate secure reset token, store hash in DB with expiry, send token link to user’s email.
    - Reset Password: verify token, hash new password with argon2.hash(), update DB, and invalidate the reset token.

**Rules:**
- Manager: full CRUD for all entities + PDF export.
- Team Member: create notes, view own tasks, update own task status.
- All important actions are logged in ActivityLog.

## 🔁 Example Routes

- Auth:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/send-otp`
  - `POST /api/auth/check-otp`
  - `PUT /api/auth/update-password`

- Users:
  - `GET /api/users/` (Manager)
  - `GET /api/users/me`
  - `PUT /api/users/me`
  - `DELETE /api/users/user/:id` (Manager)

- Projects:
  - `GET /api/projects/`
  - `GET /api/projects/:id`
  - `GET /api/projects/status` (Manager)
  - `POST /api/projects/` (Manager)
  - `PUT /api/projects/:id` (Manager)
  - `DELETE /api/projects/:id` (Manager)

- Tasks:
  - `GET /api/tasks/`
  - `GET /api/tasks/:id`
  - `GET /api/tasks/status` (Manager)
  - `POST /api/tasks/` (Manager)
  - `PUT /api/tasks/:id`
  - `DELETE /api/tasks/:id` (Manager)

- Notes:
  - `GET /api/notes/`
  - `GET /api/notes/task/:taskId`
  - `GET /api/notes/:id`
  - `POST /api/notes/`
  - `PUT /api/notes/:id`
  - `DELETE /api/notes/:id`

- Messages:
  - `GET /api/messages/` (Manager)

- Activity:
  - `GET /api/activityLogs/` (Manager)

- Reports:
  - `GET /api/report/projects/:projectId` (Manager)

## 🔔 Real-time Notifications

- On task creation/update: notify assigned user.
- On important task status change or note addition: notify managers or relevant users.
- Suggested implementation with `socket.io` rooms per user/project.

## 🛡️ Security

- `helmet()` for secure HTTP headers.
- `cors()` with origin restrictions.
- `express-rate-limit` for sensitive routes.
- Input validation with `express-validator`.
- Field whitelisting to prevent injection.

## 🚀 Deployment

- Configure environment variables in hosting platform (Heroku / Render / AWS).
- Use MongoDB Atlas.
- Enable HTTPS and secure CORS.

## ✅ Requirements Checklist

- [x] DB: Users, Projects, Tasks, Notes, ActivityLogs
- [x] Auth: JWT
- [x] Password hashing: argon2
- [x] Role-based authorization
- [x] CRUD for projects, tasks, notes
- [x] Entity relationships
- [x] WebSocket notifications
- [x] Activity logs
- [x] PDF export
- [x] Security and validation