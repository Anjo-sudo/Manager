# Team Task Management Web Application

A full-stack collaborative task management application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration.
- **Project Management**: Create projects and manage team members.
- **Task Management**: Create, assign, and update tasks with priority and due dates.
- **Role-Based Access**: 
  - **Admins** (Project Creators): Can manage team members, create tasks, and delete tasks.
  - **Members**: Can view assigned projects and update the status of their assigned tasks.
- **Dashboard**: Real-time overview of task statistics (total, done, overdue, and assigned to you).
- **Modern UI**: Fully responsive, dark-mode premium interface.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, Lucide-React, CSS (Vanilla with custom variables)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

## 📦 Local Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas Account (or local MongoDB)

### 1. Clone the repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd Manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the development server:
```bash
npm run dev
```

## 🌐 Deployment on Railway (One Command)

This project includes a PowerShell script that handles **everything automatically**:
provisions PostgreSQL, sets all environment variables, and deploys both services.

### Prerequisites
- [Node.js](https://nodejs.org) installed
- A free [Railway account](https://railway.app) (sign up, no credit card needed)

### Deploy
Open PowerShell in the project root and run:

```powershell
.\deploy.ps1
```

**That's it.** The script will:
1. Install the Railway CLI
2. Open a browser tab for Railway login (one click)
3. Create a Railway project
4. Provision a PostgreSQL database (auto-sets `DATABASE_URL`)
5. Generate a secure `JWT_SECRET`
6. Deploy the backend and frontend
7. Print your live URLs

Your full-stack application is now publicly accessible!


## 🔗 Links
- **Live Application URL:** [Add your Railway Frontend URL here]
- **GitHub Repository:** [Add your GitHub Repo URL here]
- **Demo Video:** [Add link to your 2-5 min demo video here]
