# Personal Finance Budget Tracking Application

A full-stack application for tracking personal finances and budgets, built with React, Node.js, Express, MongoDB Atlas, and Chart.js.

## Tech Stack

- **Frontend**: React with Vite, plain CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Charts**: Chart.js with react-chartjs-2

## Project Structure

```
personal-finance-budget-tracking-application/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-finance-budget-tracking-application
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update the MongoDB URI with your Atlas connection string
   - Get your MongoDB Atlas connection string from the Atlas dashboard

4. Start the backend server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### 4. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or 0.0.0.0/0 for all)
5. Get the connection string and update it in `backend/.env`

## Development

- Frontend: `npm run dev` in `frontend/` directory
- Backend: `npm run dev` in `backend/` directory
- Build frontend: `npm run build` in `frontend/` directory

## Features

- Track income and expenses
- Create and manage budgets
- Visualize financial data with charts
- User authentication (to be implemented)
- Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.