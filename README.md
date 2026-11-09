# Online Examination & AI-Proctoring System

A modern, full-stack online examination and proctoring suite supporting **Students**, **Faculty**, and **Administrators**, complete with automated grading, live test telemetry, and real-time AI security proctoring.

---

## 🚀 Default Demo Accounts

Pre-configured credentials ready for testing:

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@exam.com` | `student123` | Take exams, live timer, camera monitor, auto-grading, view history |
| **Faculty** | `faculty@exam.com` | `faculty123` | Create question banks, schedule exams, live monitor, review security flags |
| **Admin** | `admin@exam.com` | `admin123` | Analytics dashboard, manage users & exams, attempt reports, CSV export |

> **Tip:** You can also use the **1-Click Demo Login** buttons on the login screen or the role switcher in the navigation bar to rapidly jump between Student, Faculty, and Admin views.

---

## 📋 Feature Breakdown

### 1. Student Module
- **Registration & Authentication**: Sign up with name, email, password, and class/batch.
- **Student Dashboard**: Overview of available assessments, completion status, and scores.
- **Exam Taking Engine**:
  - Fullscreen lock request on start.
  - Displays questions one-by-one with MCQ choices (A, B, C, D) and navigation palette.
  - Real-time countdown timer with auto-submission at `00:00`.
  - Instant background persistence of student selections to the database.
- **AI-Proctoring Monitor**:
  - WebCam video feed with visual face tracking crosshair.
  - Automatic detection of tab switches and window unfocus (`visibilitychange` / `blur`).
  - Fullscreen exit alert and re-entry enforcement.
  - Real-time warning banners on screen with automatic violation logging to the backend.
- **Results & History**:
  - Instant automated grading comparing student choices with answer keys.
  - Detailed score reports, pass/fail status, and question-by-question explanations (when released).
  - Attempt history log with dates, marks, and violation count.

### 2. Faculty Module
- **Question Banks**:
  - Create and manage question banks by subject.
  - Add, edit, and delete multiple-choice questions with marks and explanations.
- **Exam Scheduler**:
  - Schedule assessments for specific classes (e.g. `CS-2026-A`) or all batches.
  - Set duration, total marks, passing criteria, and time windows.
  - Pull and select questions directly from Question Banks.
- **Live Exam Monitor (Radar)**:
  - Real-time live dashboard tracking students currently taking the exam.
  - Shows questions answered so far, started time, and live violation counter.
  - Auto-refreshes every 3 seconds with one-click security log inspection.
- **Proctoring Flag Review**:
  - Audit all flags raised during tests (tab switches, camera disruptions).
  - One-click review and incident dismissal.
- **Result Publishing**:
  - Toggle result publication so students can review answer keys once exams conclude.

### 3. Admin Module
- **Admin Dashboard**:
  - Global metrics: Total Students, Total Faculty, Active Exams, Global Pass Rate, and Violation counts.
- **User Directory**:
  - View and filter registered candidates and faculty; manage accounts.
- **Exam Oversight**:
  - Modify passing marks, durations, class assignments, and manage all exams.
- **Attempt Reports & Analytics**:
  - Searchable attempt reports with score breakdowns and security flag audits.
  - 1-click **Export to CSV** for university records.
- **System-Wide AI Violations Log**:
  - Filterable security event log by violation type (`TAB_SWITCH`, `FULLSCREEN_EXIT`, `NO_FACE_DETECTED`, etc.).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Lucide Icons + React Router + Axios
- **Backend**: Node.js + Express + TypeScript + JWT + bcryptjs
- **Database Layer**: High-performance persistent JSON storage (`backend/data/db.json`)
- **Proctoring Engine**: HTML5 MediaDevices (WebCam API), Page Visibility API, and Fullscreen API

---

## 💻 Running the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5001
```

### 2. Start Frontend App
```bash
cd frontend
npm run dev
# Application opens at http://localhost:3000
```

### 3. Run Automated Integration Test Suite
```bash
node test-e2e.js
```