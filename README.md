## Personal Expense Tracker

### Project overview
This repository contains a full-stack Personal Expense Tracker application built with a React + TypeScript frontend and a Node.js/Express + TypeScript backend. It supports secure authentication, expense tracking with categories, monthly budgeting, and analytics dashboards. The implementation lives in the `Golden Response` folder.

### Repository structure
```
personal-expense-tracker/
├─ Golden Response/           # Full-stack app (client + server)
│  ├─ client/                 # React + Vite frontend
│  ├─ server/                 # Express + TypeScript API
│  ├─ docker-compose.yml      # Local Postgres for development
│  └─ .env.example            # Server environment template
├─ prompt.md                  # Original task requirements
└─ justification.md           # Evaluation rationale
```

### Running the code
1. Start Postgres (optional, but recommended):
   ```powershell
   cd "Golden Response"
   docker-compose up -d
   ```
2. Configure environment variables:
   ```powershell
   Copy-Item .env.example server\.env
   ```
   Then update `server\.env` as needed.
3. Install dependencies and start the app:
   ```powershell
   npm run install:all
   npm run dev
   ```
   The client runs at `http://localhost:5173` and the API at `http://localhost:3001`.

### Testing
No automated test scripts are included in this repository. Manual verification can be done by running the app and exercising the core flows (auth, expenses, budgets, analytics) via the UI.

### Evaluation methodology
The evaluation focuses on correctness and completeness against the requirements in `prompt.md`, with particular attention to secure authentication, input validation, data isolation, budgeting logic, and real-time analytics updates. Code quality and error handling are also reviewed to ensure the server won’t fail silently under typical usage.
