<h1 align="center">📄 ResumeRefiner</h1>

<p align="center">
  <b>AI-powered ATS Resume Checker</b><br/>
  Upload your resume, get an ATS score, section-wise feedback, missing keywords and improvement tips in seconds.
</p>

<p align="center">
  <a href="https://resume-refiner-chi.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Visit%20App-6366f1?style=for-the-badge&logo=vercel&logoColor=white" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

---

## ✨ Features

- 🔐 **Authentication**: Email + password signup with **OTP email verification**, plus **Google OAuth** login (JWT based)
- 📤 **Two input modes**: Upload a **PDF** (max 5 MB) or paste resume text
- 🤖 **AI analysis** (Groq LLM) against a 100-point ATS rubric
- 📊 **Detailed report**:
  - Overall score + letter grade (A–F)
  - Score breakdown (keywords, experience, achievements, formatting, skills, education)
  - Strengths, weaknesses and actionable suggestions
  - Missing keywords
  - Section checklist (contact, summary, experience, education, skills, certifications, projects)
  - 2–3 line overall feedback
- 🕘 **History**: Every analysis is saved, so you can reopen or delete old reports
- 🛡️ **Secure and robust**: Helmet, CORS allow-list, rate limiting, input validation, AI retry logic


## 🧮 Scoring Rubric

| Category | Points |
|---|---|
| Keyword Density & Relevance | 25 |
| Work Experience Quality | 20 |
| Quantified Achievements | 20 |
| Formatting & ATS Parseability | 15 |
| Skills Section Completeness | 10 |
| Education & Certifications | 10 |
| **Total** | **100** |

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS, Axios, Lucide Icons |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| AI | Groq SDK |
| Auth | JWT, Passport (Google OAuth 2.0), bcryptjs |
| Email | Resend (OTP verification) |
| File handling | Multer (memory storage), pdf-parse |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Vercel (client), Render (server) |

## 📁 Project Structure

```
ResumeRefiner/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios API calls (auth, resume)
│       ├── components/      # ui/, layout/, resume/ (ScoreRing, Breakdown, ...)
│       ├── context/         # AuthContext
│       ├── hooks/           # useResumeUpload, useResumeHistory
│       ├── pages/           # Home, Result, History, Login, Signup, VerifyEmail
│       └── utils/           # validators, formatters
└── server/                  # Express backend
    ├── server.js            # Entry point (DB connect, graceful shutdown)
    └── src/
        ├── app.js           # Middleware + routes
        ├── config/          # db.js, passport.js
        ├── controllers/     # auth, resume
        ├── middleware/      # JWT protect
        ├── models/          # user, resume
        ├── routes/          # auth.routes, resume.routes
        ├── services/        # ai.service (Groq), email.service
        └── utils/           # generateToken
```

## 🔌 API Endpoints

**Auth** (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account, send OTP |
| POST | `/verify-email` | Verify OTP |
| POST | `/resend-otp` | Resend OTP |
| POST | `/login` | Login, returns JWT |
| GET | `/google` | Start Google OAuth |
| GET | `/google/callback` | Google OAuth callback |
| GET | `/me` | Current user (protected) |

**Resumes** (`/api/resumes`, all protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Analyze pasted resume text (10 per 15 min) |
| POST | `/upload-pdf` | Analyze uploaded PDF (field name: `resume`) |
| GET | `/` | Paginated history |
| GET | `/:id` | Full report |
| DELETE | `/:id` | Delete a report |

Health check: `GET /health`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- [Groq API key](https://console.groq.com/)
- Google OAuth credentials and a [Resend](https://resend.com/) API key

### 1. Clone
```bash
git clone https://github.com/thinkersolver100/ResumeRefiner.git
cd ResumeRefiner
```

### 2. Backend
```bash
cd server
npm install
```
Create `server/.env`:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```
Run:
```bash
npm start
```

### 3. Frontend
```bash
cd client
npm install
```
Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
Run:
```bash
npm run dev
```
Open **http://localhost:5173**

## 🌐 Live Demo

👉 **[resume-refiner-chi.vercel.app](https://resume-refiner-chi.vercel.app/)**

> The backend runs on Render's free tier, so the first request may take ~30–60 seconds to wake up.

## 🔮 Future Improvements
- Job description matching (tailor the score to a specific role)
- Resume rewrite suggestions
- Downloadable PDF report
- OCR support for scanned PDFs

## 👨‍💻 Author

**Shikhar**
[LinkedIn](https://www.linkedin.com/in/shikhar-gupta-b5730630b/) · [GitHub](https://github.com/thinkersolver100) · mr.shikhar100@gmail.com

---

<p align="center">⭐ If you found this useful, give the repo a star!</p>
