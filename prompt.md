# Personal Expense Tracker – Full-Stack Development Task

## Overview

The goal here is to build a Personal Expense Tracker, a straightforward web app that helps people stay on top of their finances. Users should be able to log expenses, bucket them into categories, set monthly budgets, and actually see where their money is going through charts and summaries.

This isn't a prototype. Think of it as something that could actually go live, built with security, clean code, and real performance in mind. It needs to hold up on any screen size, whether that's a phone on the go or a desktop at home.

---

## What We're Building

Here's what users should be able to do:

- Sign up and log into their account securely
- Add, edit, and delete personal expenses
- Group expenses under standard spending categories
- Set up and manage monthly budgets
- Keep tabs on spending through visual reports
- Get warned the moment they go over budget

---

## Core Functionality

### User Accounts

People should be able to register, log in, log out, and pick up where they left off across different sessions. Above all, every user should only ever see their own data, with no crossover.

**Hard requirements:**

- Passwords get hashed before touching the database. No exceptions.
- All routes that touch user data need session verification before anything else runs.
- Failed logins should return a message descriptive enough for the user to understand what went wrong.
- Each user's data must be fully isolated — no account should have visibility into another's records.

---

### Expense Management

Users own their expense history, including adding new ones, fixing mistakes, removing old entries, and browsing everything they've logged.

**Each expense needs:**

- Title
- Amount
- Category
- Date
- Notes *(optional)*

**Available categories:**

- Food
- Transportation
- Shopping
- Bills
- Entertainment
- Healthcare
- Other

**What to enforce:**

- Amounts must be greater than zero. No free lunches.
- Dates in the future shouldn't be accepted.
- Category must be one of the options above, not a freeform field.
- Required fields get validated on both ends, client and server.
- Bad input should produce clear, helpful error messages, not silent failures.

---

### Budget Management

Users can set a monthly budget, adjust it whenever they want, and watch how their spending stacks up against it in real time.

**These get handled automatically:**

- Total spending calculation
- Remaining budget display
- Overspending detection
- Budget alert triggering

**Rules:**

- Budget values can't go negative.
- Budget totals should recalculate on the spot whenever an expense is created, modified, or deleted.
- If spending tips over the budget threshold, the alert needs to fire instantly — no page reload required.

---

### Reporting & Insights

The dashboard is where it all comes together. It should give users a real look at their financial habits, not just raw numbers.

**Dashboard should show:**

- Total spending for the current month
- Breakdown of spending by category
- Spending trend over recent months
- Budget usage as a percentage
- The category they spend on most

**Visuals to include:**

- Pie chart for category distribution
- Line chart for spending trends over time
- Summary cards for the key numbers

**What to keep in mind:**

- Everything on the dashboard pulls from actual database records, no hardcoded values.
- The dashboard should reflect changes as soon as expenses are modified.
- It should hold up fine even with up to 10,000 expense records in the database without getting sluggish.

---

## User Interface

### Pages

#### Dashboard
- Spending overview
- Budget summary
- Reports and charts

#### Expenses
- Full expense history
- Search
- Filter by category
- Filter by date range
- Filter by amount range

#### Budgets
- Create a new budget
- Edit existing budgets
- Track progress

#### Profile
- User info
- Account settings

---

### UI Standards

- Works properly on mobile, tablet, and desktop
- Uses semantic HTML throughout
- Keyboard navigation should work end to end
- Form fields need visible, descriptive labels
- The experience should feel consistent from page to page, with no jarring layout shifts or inconsistent patterns

---

## Backend Requirements

### API Endpoints

#### Auth
- `POST /register` – create account
- `POST /login` – sign in
- `POST /logout` – sign out

#### Expenses
- `POST` – add expense
- `GET` – fetch expense list
- `PUT` – update expense
- `DELETE` – remove expense

#### Budgets
- `POST` – create budget
- `GET` – fetch budget info
- `PUT` – update budget

#### Analytics
- Spending summary
- Category breakdown
- Trend data over time

### Requirements

- Every endpoint returns JSON and nothing else.
- All responses should look the same across the API.
- Database queries should be lean, meaning no pulling more data than needed.
- Protected endpoints verify the user's identity before doing anything.

---

## Security

The app needs to get the basics right:

- Validate everything coming in from the outside
- Sanitize user inputs before they go anywhere near the database
- Cover at least XSS, SQL injection, and unauthorized data access

**A few more things:**

- Secrets, DB credentials, and config values live in environment variables and never hardcoded.
- Users are locked to their own data.
- Failed login attempts get logged.
- Server-side validation runs regardless of what the client already checked.

---

## API Response Format

All responses use one of these two formats:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Failure:**
```json
{
  "success": false,
  "message": "Request failed",
  "errors": []
}
```

---

## Performance

The app should handle at least 100 concurrent users without slowing down. Large datasets, like thousands of expenses, shouldn't make the UI crawl.

**To be more specific:**

- Expense history must be paginated.
- Users pick how many records to show per page.
- Things shouldn't get laggy as data grows.
- Analytics queries should be efficient enough to run repeatedly without slowing things down.

---

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| React | Component-based UI covering expense management, budgeting, and reports |
| TypeScript | Typed components, API responses, and application logic |
| Tailwind CSS | Responsive layouts and consistent visual design |
| Recharts | Spending trends, category breakdowns, and budget visuals |

### Backend

| Tool | Purpose |
|------|---------|
| Node.js | API request handling and concurrent user support |
| Express.js | REST API structure covering auth, expenses, budgets, and reporting |
| TypeScript | Shared data models and consistent validation |

### Database

| Tool | Purpose |
|------|---------|
| PostgreSQL | Relational storage for users, expenses, and budgets; supports constraints, indexing, and aggregations |

### Auth & Config

| Tool | Purpose |
|------|---------|
| JWT | Session tokens for protected routes |
| bcrypt | Password hashing |
| dotenv | Environment variable management |

---

## What to Submit

Here's what needs to be turned in:

- Project folder structure
- Database schema with relationships clearly defined
- Full frontend implementation
- Full backend implementation
- Authentication flow walkthrough
- API documentation
- Validation strategy
- Security implementation details
- Environment variable setup
- Local setup instructions
- Deployment instructions

---

## Completion Criteria

The build is done when all of this holds:

- Users can register and sign in securely
- Passwords are hashed in storage
- Expense amounts enforce the greater-than-zero rule
- Full CRUD works for expenses
- Monthly budgets can be created and managed
- Budget alerts fire as soon as the limit is crossed
- Dashboard data comes from the database
- No user can access or modify someone else's data
- Expense history is paginated
- API responses match the specified format
- Sensitive config is in environment variables
- App works correctly on desktop, tablet, and mobile
- The full required tech stack is used throughout