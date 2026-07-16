# Product Analytics
 
A full-stack analytics platform for visualising and reporting on product order data. Built with FastAPI and React.
 
## What it does
 
- Admins upload CSV order data which is cleaned, validated, and stored in a database
- Users create reports by filtering orders by date range, model range, and SKU
- Reports render interactive charts by daily, weekly, monthly, or yearly trends for order volume and quantity sold
- Role-based access: admins manage data and users, standard users create and view reports
---
 
## Stack
 
**Backend** — FastAPI, SQLModel, PostgreSQL, Alembic, PyJWT, pandas
 
**Frontend** — React 19, TypeScript, Vite, TanStack Router, TanStack Query, Recharts, Tailwind CSS
 
---
 
## Project Structure
 
```
/
├── backend/       # FastAPI application
├── frontend/      # React application
└── docker-compose.yml
```
 
---
 
## Getting Started
 
### Prerequisites
 
- Python 3.12+
- Node.js 18+
- PostgreSQL
### Backend
 
```bash
cd backend
uv sync
cp .env.example .env   # fill in your values
uv run alembic upgrade head
uv run python -m app.initial_data   # creates first superuser
uv run uvicorn app.main:app --reload
```
 
### Frontend
 
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```
 
---
 
## Environment Variables
 
### Backend `.env`
 
```
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=
FIRST_SUPERUSER=
FIRST_SUPERUSER_PASSWORD=
```
 
### Frontend `.env`
 
```
VITE_API_URL=http://localhost:8000
```
 
---
 
## Documentation
 
- [Frontend](frontend/FRONTEND.md) — architecture, hooks, routing, charting
- [Backend](backend/README.md) — API routes, data models, upload pipeline
---
 
## Deployment
 
> Documentation to be completed once cloud deployment is configured.
 
---

## Licence

MIT — free to use, modify, and distribute with attribution.
