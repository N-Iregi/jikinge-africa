# Jikinge Africa — Cybersecurity Awareness Platform

A full-stack web application for cybersecurity awareness education and incident reporting, designed for students, individuals, and small businesses across Africa.

**Live Demo:** https://jikinge-africa.vercel.app

---

## About the Project

Jikinge Africa addresses the widespread lack of basic cybersecurity knowledge across Africa. Human error — including falling for phishing scams, using weak passwords, and ignoring software updates — is the leading contributor to cyber incidents on the continent. According to Interpol's 2025 report, online scams, phishing, ransomware, and BEC make up over 30% of all crimes in Western and Eastern Africa.

The platform provides:
- Structured cybersecurity learning modules with theory and interactive labs
- Quizzes and self-assessment tools to measure knowledge
- An incident reporting system for real-world threats
- An admin dashboard for oversight and analytics
- Real MFA (TOTP) authentication

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcryptjs + speakeasy (TOTP MFA) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
jikinge-africa/
├── backend/
│   ├── db/
│   │   └── database.js       # DB schema, tables, seed data
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Register, login, MFA verify, /me
│   │   ├── modules.js        # Learning modules CRUD
│   │   ├── progress.js       # User progress tracking
│   │   ├── incidents.js      # Incident reporting
│   │   └── admin.js          # Analytics, users, audit log
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx           # Full React application
    │   ├── api.js            # API service layer
    │   ├── main.jsx          # React entry point
    │   └── index.css         # (empty — styles in App.jsx)
    ├── index.html
    ├── vite.config.js
    ├── .env                  # Points to backend URL
    └── package.json
```

---

## Prerequisites

- **Node.js v18 or higher** — Download from https://nodejs.org (choose LTS version)
- A terminal — Command Prompt, PowerShell, or VS Code terminal

Verify Node is installed:
```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
```

---

## Local Setup (Step by Step)

### Step 1 — Download or Clone the Repository

**Option A — Clone (recommended):**
```bash
git clone https://github.com/YOUR_USERNAME/jikinge-africa.git
cd jikinge-africa
```

**Option B — Download ZIP:**
- Click the green "Code" button on GitHub → Download ZIP
- Extract the folder

---

### Step 2 — Set Up the Backend

Open a terminal and navigate to the backend folder:

```bash
cd jikinge-africa/backend
```

Install dependencies:
```bash
npm install
```

Create the environment file:
```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell) or Mac/Linux
cp .env.example .env
```

Start the backend server:
```bash
node server.js
```

You should see:
```
✅ Database initialised: .../backend/db/jikinge.db
🌱 Seeding initial data...
✅ Seed data inserted.

🛡️  Jikinge Africa API running on http://localhost:5000
📋  Health: http://localhost:5000/api/health
```

The database file (`jikinge.db`) is created automatically — no external database setup is needed.

> **Keep this terminal open.** The backend must remain running.

---

### Step 3 — Set Up the Frontend

Open a **second** terminal window and navigate to the frontend folder:

```bash
cd jikinge-africa/frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 4 — Open the Application

Open your browser and go to: **http://localhost:5173**

The Jikinge Africa platform will load.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Student | demo@alu.edu | Demo1234! |
| Admin | admin@jikinge.africa | Admin1234! |

**MFA Flow:**
1. Enter your email and password → click Authenticate
2. A 6-digit MFA code will appear on screen (this is simulated for prototype purposes — in a real deployment users scan a QR code with Google Authenticator or Authy)
3. Copy and enter the displayed code → click Verify Identity
4. You are logged in

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create a new account |
| POST | /api/auth/login | Step 1: Email + password → pre-auth token |
| POST | /api/auth/verify-mfa | Step 2: TOTP code → full JWT |
| GET | /api/auth/me | Get current user profile |
| GET | /api/modules | List all learning modules |
| GET | /api/modules/:id | Get module with lessons and quiz |
| GET | /api/progress | Get user's learning progress |
| POST | /api/progress/:moduleId | Save/update module progress |
| GET | /api/incidents | List incident reports |
| POST | /api/incidents | Submit a new incident report |
| PATCH | /api/incidents/:id/status | Update report status (admin/IRT) |
| GET | /api/admin/users | List all users (admin only) |
| GET | /api/admin/analytics | Platform analytics (admin only) |
| GET | /api/admin/audit-log | Audit trail (admin only) |
| GET | /api/health | Health check |

---

## Functional Requirements Coverage

| FR | Requirement | Implementation |
|---|---|---|
| FR1 | User Registration | POST /api/auth/register |
| FR2 | User Authentication + MFA | POST /api/auth/login + /verify-mfa (TOTP/RFC 6238) |
| FR3 | User Logout + Auto-expiry | clearToken() + JWT 14-day expiry |
| FR4 | Learning Modules | 4 modules with theory lessons |
| FR5 | Practical Labs | 4 interactive labs (Phishing, MFA, Malware, Scam) |
| FR6 | Quizzes & Self-Assessment | 4-question scored quizzes per module |
| FR7 | Progress Tracking | user_progress table, XP system, completion tracking |
| FR8 | Incident Reporting | POST /api/incidents |
| FR9 | Review of Incidents | Admin status management (Pending → Under Review → Resolved) |
| FR10 | Administrator Privileges | Role-based access control (user / admin / irt) |
| FR11 | Analytical Reports | GET /api/admin/analytics |
| FR12 | Secure Storage | SQLite with bcrypt password hashing + JWT + audit log |

---

## Resetting the Database

To reset all data and start fresh:

1. Stop the backend server (Ctrl+C)
2. Delete the database file:
   ```bash
   # Windows
   del backend\db\jikinge.db
   
   # Mac/Linux
   rm backend/db/jikinge.db
   ```
3. Restart the server — it will recreate and reseed automatically:
   ```bash
   node server.js
   ```

---

## Deployment
**Frontend**: Vercel
**Backend**: Render
- Note: The backend is hosted on Render's free tier and may take up to 50 seconds to wake up on first load after a period of inactivity. Please wait briefly if the login appears slow on the first attempt.


---

## Author

**Neville Iregi**  
African Leadership University  
Summative Project — January 2026
