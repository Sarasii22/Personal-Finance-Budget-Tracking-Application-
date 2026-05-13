# Personal Finance Budget Tracking Application

A full-stack application for tracking personal finances and budgets (frontend built with React + Vite; backend with Node.js + Express; MongoDB for data persistence).

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB (Atlas or local)
- Charts: Chart.js, react-chartjs-2

## Project Layout

```
frontend/   # React app (Vite)
backend/    # Express API server
README.md   # Project setup and run instructions
```

## Prerequisites

- Node.js v16+ and npm (or yarn)
- MongoDB Atlas account or a local MongoDB server / Docker

---

## Setup: Installing dependencies

1. Clone the repo and open the project root:

```bash
git clone <repository-url>
cd Personal-Finance-Budget-Tracking-Application-
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies (in a separate terminal):

```bash
cd ../frontend
npm install
```

---

## Running the frontend

From the `frontend` folder, start the dev server:

```bash
cd frontend
npm run dev
```

By default Vite serves the app at `http://localhost:5173`.

To create a production build:

```bash
npm run build
npm run preview  # serve the production build locally
```

---

## Running the backend

1. Create a `.env` file in the `backend` folder with at minimum:

```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-strong-secret-for-jwt>
PORT=5000  # optional
```

2. Start the backend in development (uses `nodemon`):

```bash
cd backend
node server.js
```

3. Or start in production mode:

```bash
npm start
```

The backend listens on `http://localhost:5000` by default and exposes the API under `/api` (e.g. `/api/auth`, `/api/transactions`).

---

## Running the database

Options:

- MongoDB Atlas (recommended for quick cloud setup):
  1. Create a free cluster at https://www.mongodb.com/atlas
  2. Create a database user and allow your IP (or 0.0.0.0/0 while developing)
  3. Copy the connection string and set `MONGO_URI` in `backend/.env`

- Local MongoDB (native install):
  - Start MongoDB (`mongod`) and point `MONGO_URI` to `mongodb://localhost:27017/<dbname>`

- Docker (quick local instance):

```bash
docker run -d --name mongo -p 27017:27017 -v mongo_data:/data/db mongo:latest
# then use mongodb://localhost:27017/<dbname> as MONGO_URI
```

Note: the backend expects a `MONGO_URI` environment variable (see `server.js`).

---

## Environment variables

- `MONGO_URI` : MongoDB connection string (required)
- `JWT_SECRET`: secret used to sign/verify JWT tokens (required for auth-protected routes)
- `PORT`      : optional port for backend (default 5000)

Place these in `backend/.env` (do not commit `.env` to version control).

---

## Useful scripts

- Frontend (from `frontend`): `npm run dev`, `npm run build`, `npm run preview`
- Backend (from `backend`): `npm run dev` (nodemon), `npm start`

---

## Troubleshooting

- If the frontend cannot reach the backend, check `backend` is running on port 5000 and CORS origin (`http://localhost:5173`) is allowed in `server.js`.
- If MongoDB connection fails, verify `MONGO_URI`, network access, and user credentials.

---
