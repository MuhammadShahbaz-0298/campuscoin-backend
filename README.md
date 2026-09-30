# Campus Coin — Backend API

Node.js / Express REST API for **Campus Coin**, a student budgeting and expense-tracking platform. Data is stored in MongoDB via Mongoose. The React client lives in [`../client`](../client).

## Features

- JWT authentication (7-day tokens) with bcrypt password hashing
- Role-based access: `student` and `admin`
- Income/expense transactions with pagination and keyword-based category suggestion
- Default and per-user custom categories
- Monthly budgets per category
- Dashboard aggregation, savings progress, and saving tips
- Reports: category breakdown and income vs. expense
- Generated monthly insights (with bookmarking)
- Admin endpoints for platform stats, user management, and default categories
- Security basics: Helmet, CORS restricted to the client origin, rate-limited auth routes, Zod request validation

## Tech Stack

Node.js (ES modules) · Express 4 · MongoDB + Mongoose 8 · JSON Web Tokens · bcryptjs · Zod · Helmet · CORS · express-rate-limit · Nodemon (dev)

## Prerequisites

- Node.js 18+ and npm
- A running MongoDB instance (local or Atlas)

## Getting Started

```bash
cd server
npm install
cp .env.example .env     # then edit the values
npm run seed             # default categories + demo users
npm run dev              # http://localhost:5000
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with Nodemon (auto-restart) |
| `npm start` | Start with Node |
| `npm run seed` | Reset default categories and create demo/admin users |

> `npm run seed` **deletes all existing categories** before inserting the defaults. Don't run it against a database with real data you want to keep.

## Environment Variables

Create `server/.env`:

| Variable | Required | Example | Description |
|---|---|---|---|
| `MONGO_URI` | Yes | `mongodb://127.0.0.1:27017/campus_coin` | MongoDB connection string |
| `JWT_SECRET` | Yes | *(long random string)* | Secret used to sign JWTs |
| `CLIENT_URL` | Yes | `http://localhost:5173` | Allowed CORS origin (the frontend URL) |
| `PORT` | No | `5000` | Server port (defaults to 5000) |

The server refuses to start if a required variable is missing. Never commit your real `.env` — only `.env.example`.

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Student | `demo@campuscoin.app` | `Demo123!` |
| Admin | `admin@campuscoin.app` | `Admin123!` |

Change these credentials before any real deployment.

Default categories — income: Allowance, Part-time Job, Scholarship, Gift, Other Income. Expense: Food, Transport, Hostel/Rent, Academics, Subscriptions, Entertainment, Miscellaneous.

## API Reference

Base URL: `http://localhost:5000/api`

Protected routes require the header `Authorization: Bearer <token>`. Responses use the shape `{ "success": true|false, ... }`.

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |

### Auth (rate limited: 60 requests / 15 min)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account (`name`, `email`, `password`) |
| POST | `/auth/login` | Log in (`email`, `password`) |
| POST | `/auth/admin-login` | Log in via the admin entry point |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get current profile |
| PUT | `/users/me` | Update profile (academic year, allowance baseline, savings goal) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Aggregated dashboard data |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List default + own categories |
| POST | `/categories` | Create a custom category |
| PUT | `/categories/:id` | Update a category |
| DELETE | `/categories/:id` | Delete a category |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/transactions` | List (query: `page`, `limit` ≤ 100, `type`) |
| GET | `/transactions/savings` | Savings progress |
| POST | `/transactions` | Create (`categoryId`, `amount`, `type`, optional `description`, `date`, `isRecurring`, `recurrenceInterval`) |
| PUT | `/transactions/:id` | Update (partial) |
| DELETE | `/transactions/:id` | Delete |
| POST | `/transactions/suggest-category` | Suggest a category from a `description` |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | List budgets |
| POST / PUT | `/budgets` | Create or update (upsert) a monthly category budget |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/category-breakdown` | Spending by category |
| GET | `/reports/income-vs-expense` | Income vs. expense over time |

### Insights
| Method | Endpoint | Description |
|---|---|---|
| GET | `/insights` | List insights |
| POST | `/insights/generate` | Generate an insight for a month |
| PUT | `/insights/:id/bookmark` | Toggle bookmark |
| DELETE | `/insights/clear-all` | Delete all of the user's insights |

### Admin (admin role required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | Platform statistics |
| GET | `/admin/users` | List users |
| PUT | `/admin/users/:id` | Update a user (e.g., disable) |
| GET | `/admin/categories` | List default categories |
| PUT | `/admin/categories/:id` | Update a default category |

## Data Models

- **User** — name, email (unique), passwordHash, academicYear, monthlyAllowanceBaseline, savingsGoal, role (`student`/`admin`), isDisabled
- **Category** — name, type (`income`/`expense`), isDefault, userId (null for defaults), icon
- **Transaction** — userId, categoryId, amount, type, description, aiSuggestedCategory, isRecurring, recurrenceInterval, date
- **Budget** — userId, categoryId, month (`YYYY-MM`), limitAmount
- **Insight** — userId, month, headline, summaryText, tipText, footerText, metrics, isBookmarked

## Project Structure

```
server/
├── server.js                # entry: connect DB, start listening
├── app.js                   # Express app, middleware, route mounting
├── seed.js                  # default categories + demo users
├── config/                  # env validation, DB connection
├── controllers/             # request handlers
├── middleware/              # auth, admin, validation, error handling
├── models/                  # Mongoose schemas
├── routes/                  # route definitions + Zod schemas
├── services/                # category suggestion, insight generator, saving tips
└── utils/                   # token, async handler, currency and month helpers
```

## How the "AI" Features Work

- **Category suggestion** — a rule-based keyword matcher (e.g., "uber" → Transport, "netflix" → Subscriptions). Falls back to Miscellaneous.
- **Insights** — generated from the month's transactions and budgets by `insightGeneratorService.js`.
- **Saving tips** — `savingTipsEngine.js` flags categories over budget and suggests reviewing high-spend ones.

No external AI API is called by the current code.

## Notes

- `package.json` lists `openai`, `multer`, `csv-parser`, `pdfkit`, and `nodemailer`, but none are imported yet. They're reserved for planned features (AI, CSV import, PDF export, password-reset email) and can be removed if unused.
- The `User` model has `resetToken` fields, but no password-reset endpoint exists yet.

## Troubleshooting

- **`MONGO_URI is required in server/.env`** — create `.env` from `.env.example`.
- **MongoDB connection refused** — start MongoDB or use an Atlas URI.
- **CORS errors** — `CLIENT_URL` must exactly match the frontend origin.
- **401 responses** — token missing, invalid, or expired (7 days).
