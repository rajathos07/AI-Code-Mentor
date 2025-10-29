# 🧠 AI Code Mentor

### 🚀 Intelligent Coding & Learning Platform

AI Code Mentor is a **developer-focused interactive platform** that integrates **AI-assisted code review**, **learning challenges**, **quiz generation**, and **progress tracking** — helping learners become better programmers with personalized feedback.

---

## 📋 Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Folder Structure](#folder-structure)
* [Setup Instructions](#setup-instructions)
* [Environment Variables](#environment-variables)
* [API Overview](#api-overview)
* [Backend Overview](#backend-overview)
* [Frontend Overview](#frontend-overview)
* [Contributing](#contributing)
* [License](#license)

---

## 🧩 Overview

AI Code Mentor is a **full-stack MERN application** that provides an all-in-one platform for programmers to:

* Learn coding concepts through interactive challenges.
* Generate and solve quizzes powered by **Groq AI models**.
* Receive **AI-driven code reviews** with suggestions, complexity analysis, and cross-language conversion.
* Track progress, XP, and badges.
* Log all activities in real-time.

---

## ✨ Key Features

✅ **AI Code Review** – Analyze and improve your code instantly.
✅ **Quiz Panel** – Generate Groq-based quizzes for Python, Java, or C++.
✅ **Learning Challenges** – Attempt structured problems and run real test cases.
✅ **XP & Badge System** – Gain XP and unlock badges for completed challenges.
✅ **Activity Logger** – Prevents duplicate logs and maintains user history.
✅ **Secure Auth System** – Login, register, session tracking with bcrypt + express-session.
✅ **MongoDB Models** – Activity, User, and Progress schemas for persistent tracking.

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios, Framer Motion
**Backend:** Node.js, Express.js, MongoDB, Mongoose
**AI Integration:** Groq SDK (LLaMA 3.1 / 3.3 models)
**Other:** VM2 sandbox, OpenAI-compatible Groq API, bcrypt, express-rate-limit

---

## 📂 Folder Structure

```
AI-Code-Mentor/
│
├── backend/
│   ├── controllers/         # Controller logic (ai.controllers.js)
│   ├── routes/              # API routes (auth, ai, learning, progress, etc.)
│   ├── services/            # AI interaction services (ai.services.js)
│   ├── models/              # Mongoose Schemas (User, Progress, Activity)
│   ├── data/                # Local fallback challenges (challenges.js)
│   ├── app.js               # Express app config
│   ├── server.js            # Server entry point
│   └── .env.example         # Sample environment variables
│
├── frontend/
│   ├── public/              # Static assets (favicon, logos, etc.)
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuizPanel.jsx          # Quiz interface
│   │   │   ├── LearningPanel.jsx      # Interactive learning panel
│   │   │   ├── Editor/                # Code editor module
│   │   │   ├── Auth/                  # Login & Register UI
│   │   │   └── Common/                # Shared UI components (Sidebar, Navbar, etc.)
│   │   ├── data/                      # Challenge and quiz data
│   │   ├── App.jsx                    # Main app router
│   │   ├── main.jsx                   # Entry file for React
│   │   └── styles/                    # Tailwind/global styles
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite configuration
│
├── .gitignore
├── package.json                        # Backend dependencies
├── README.md
└── LICENSE
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/AI-Code-Mentor.git
cd AI-Code-Mentor
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend` with:

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai-code-mentor
SESSION_SECRET=your_secret
GROQ_API_KEY=your_groq_key
GROQ_API_KEY_LEARNING=your_learning_key
```

Run the backend:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

| Variable                | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `PORT`                  | Port to run backend                                |
| `MONGO_URI`             | MongoDB connection string                          |
| `SESSION_SECRET`        | Secret key for session cookies                     |
| `GROQ_API_KEY`          | For quiz generation using Groq SDK                 |
| `GROQ_API_KEY_LEARNING` | For challenge generation via Groq/OpenAI interface |

---

## 🧠 API Overview

### **Auth Routes (`/api/auth`)**

* `POST /register` → Register new user
* `POST /login` → Login existing user
* `POST /logout` → Logout
* `GET /me` → Fetch current session

### **AI Routes (`/ai`)**

* `POST /get-review` → AI-powered code review (Python/Java/C++)
* `POST /generate-quiz` → Generate quiz set
* `POST /generate-challenge` → Create AI coding challenge
* `POST /run-tests` → Execute user code in sandbox

### **Progress Routes (`/api/progress`)**

* `GET /:username` → Fetch XP and badges
* `POST /award` → Add XP after successful challenge

### **Learning Routes (`/api/learning`)**

* `GET /challenge` → Get a random challenge
* `POST /run-tests` → Run user’s code on predefined test cases

### **Activity Routes (`/api/activity`)**

* `POST /log` → Log user activity (idempotent)

---

## 🧩 Backend Overview

Key backend files:

* **ai.controllers.js** → Handles AI review responses.
* **ai.services.js** → Calls Groq API for code review.
* **activity.routes.js** → Smart idempotent activity logger.
* **groq.routes.js** → Challenge generation & test runner.
* **learning.routes.js** → VM2-powered JS challenge evaluator.
* **progress.routes.js** → XP & badge management.
* **auth.routes.js** → Secure authentication flow.

---

## 🎨 Frontend Overview

Core React components:

* **App.jsx** → Handles routing between panels.
* **QuizPanel.jsx** → Fetches AI quizzes.
* **LearningPanel.jsx** → Displays challenges and runs tests.
* **Activity Log UI** → Shows logs and achievements.

---

## 💡 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push branch: `git push origin feature/new-feature`
5. Open a Pull Request 🎉

---

## 📜 License

This project is licensed under the **MIT License** — free for personal and commercial use.

---

> 💬 *Developed with ❤️ to make learning code intelligent, interactive, and impactful.*
