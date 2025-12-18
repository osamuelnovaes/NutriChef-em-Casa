# NutriChef-em-Casa - Development Setup Guide

Welcome to the NutriChef-em-Casa project! This guide will walk you through the step-by-step process to set up both the backend and frontend development environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Git**: [Download and install Git](https://git-scm.com/)
- **Node.js** (v16.x or higher): [Download and install Node.js](https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js installation
- **Python** (v3.8 or higher): [Download and install Python](https://www.python.org/)
- **pip**: Comes with Python installation

### Recommended Tools

- **Visual Studio Code**: [Download VS Code](https://code.visualstudio.com/)
- **Postman**: For API testing ([Download](https://www.postman.com/downloads/))
- **Git GUI client** (optional): GitHub Desktop or SourceTree

### Verify Installation

Run the following commands to verify your installations:

```bash
git --version
node --version
npm --version
python --version
pip --version
```

---

## Project Structure

```
NutriChef-em-Casa/
├── backend/              # Backend API (Node.js/Python)
├── frontend/             # Frontend application (React/Vue)
├── docs/                 # Documentation
├── README.md
├── SETUP.md
└── .gitignore
```

---

## Backend Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/osamuelnovaes/NutriChef-em-Casa.git
cd NutriChef-em-Casa
```

### Step 2: Set Up Backend Environment

Navigate to the backend directory:

```bash
cd backend
```

#### For Node.js Backend:

1. **Install Dependencies**
   ```bash
   npm install
   ```
   or if using yarn:
   ```bash
   yarn install
   ```

2. **Create Environment Configuration**
   
   Create a `.env` file in the `backend` directory:
   ```bash
   cp .env.example .env
   ```
   
   If no `.env.example` exists, create `.env` with the following variables:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=nutrichef_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # API Configuration
   API_BASE_URL=http://localhost:5000
   
   # JWT/Authentication
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   
   # CORS Settings
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Set Up Database**
   
   - Ensure your database is running
   - Run migrations (if applicable):
     ```bash
     npm run migrate
     ```
   - Seed database (if applicable):
     ```bash
     npm run seed
     ```

4. **Start the Backend Server**
   ```bash
   npm run dev
   ```
   
   The backend should now be running on `http://localhost:5000`

#### For Python Backend:

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   ```

2. **Activate Virtual Environment**
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create Environment Configuration**
   
   Create a `.env` file in the `backend` directory with necessary variables (see Node.js section above for reference)

5. **Set Up Database**
   
   ```bash
   python manage.py migrate
   python manage.py seed
   ```

6. **Start the Backend Server**
   ```bash
   python manage.py runserver
   ```
   
   The backend should now be running on `http://localhost:8000`

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

From the project root:

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

or if using yarn:

```bash
yarn install
```

### Step 3: Create Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

If no `.env.example` exists, create `.env` with:

```
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000

# Application Settings
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# External Services
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
```

### Step 4: Start the Frontend Development Server

```bash
npm start
```

The frontend should now be running on `http://localhost:3000`

---

## Running the Application

### Option 1: Run Backend and Frontend in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev    # or 'python manage.py runserver' for Python
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Run Using Docker (if available)

If Docker is configured in your project:

```bash
docker-compose up
```

### Option 3: Run Both Concurrently

From the project root (if configured):

```bash
npm run dev
```

---

## Development Workflow

### Creating a Feature Branch

1. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate directory (backend or frontend)

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: description of your feature"
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

### Running Tests

#### Backend Tests:

```bash
# Node.js
npm test

# Python
python manage.py test
```

#### Frontend Tests:

```bash
npm test
```

### Linting and Formatting

#### Backend:

```bash
npm run lint
npm run format
```

#### Frontend:

```bash
npm run lint
npm run format
```

### Building for Production

#### Backend:

```bash
npm run build
```

#### Frontend:

```bash
npm run build
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Port Already in Use**

If port 5000 (backend) or 3000 (frontend) is already in use:

**On macOS/Linux:**
```bash
lsof -i :5000        # Find process using port 5000
kill -9 <PID>        # Kill the process
```

**On Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or change the port in `.env` file.

#### 2. **Module Not Found Error**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. **Database Connection Error**

- Verify database service is running
- Check `.env` file for correct credentials
- Ensure database user has proper permissions
- Try connecting manually: `psql -h localhost -U your_db_user -d nutrichef_db`

#### 4. **Python Virtual Environment Issues**

```bash
# Deactivate current environment
deactivate

# Remove virtual environment
rm -rf venv

# Create fresh virtual environment
python -m venv venv
source venv/bin/activate    # macOS/Linux
# or
venv\Scripts\activate       # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### 5. **CORS Errors**

- Ensure frontend URL is listed in backend CORS settings
- Verify `.env` files have correct `CORS_ORIGIN` and `API_BASE_URL`
- Check backend is running before frontend

#### 6. **Node Version Mismatch**

If you're using NVM (Node Version Manager):

```bash
nvm install 16
nvm use 16
```

Check `.nvmrc` file for specific version requirements.

### Getting Help

If you encounter issues:

1. **Check existing GitHub Issues**: Look for similar problems
2. **Read the error messages carefully**: They often contain helpful information
3. **Check logs**: Look at browser console (F12) and terminal output
4. **Ask the team**: Reach out to project maintainers or the development team

---

## Additional Resources

- [Backend Documentation](./docs/BACKEND.md)
- [Frontend Documentation](./docs/FRONTEND.md)
- [API Documentation](./docs/API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## Questions?

If you have any questions about the setup process, please open an issue on GitHub or contact the development team.

Happy coding! 🚀
