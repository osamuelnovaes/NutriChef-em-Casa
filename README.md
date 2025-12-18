# NutriChef em Casa 🍽️

A comprehensive nutrition and meal planning application designed to help users manage their dietary goals, discover recipes, and plan personalized meals with nutritional tracking.

## Overview

NutriChef em Casa is a full-stack web application that combines nutrition science with practical meal planning. The platform enables users to:
- Track nutritional intake and dietary goals
- Discover recipes tailored to their preferences and dietary restrictions
- Plan meals with automated nutritional calculations
- Manage shopping lists
- Monitor progress toward health objectives

Whether you're a fitness enthusiast, managing a specific diet, or simply looking to eat healthier, NutriChef em Casa provides the tools and guidance you need.

## Features

### 🎯 Core Features
- **Personalized Meal Planning**: Create custom meal plans based on dietary preferences and nutritional goals
- **Recipe Discovery**: Browse thousands of recipes filtered by cuisine, ingredients, allergens, and dietary restrictions
- **Nutritional Tracking**: Real-time calculation of calories, macronutrients (protein, carbs, fats), and micronutrients
- **Shopping List Management**: Auto-generated shopping lists from meal plans with quantity calculations
- **Dietary Preferences**: Support for various diets (keto, vegan, vegetarian, gluten-free, etc.)
- **Progress Monitoring**: Visual analytics and progress tracking toward nutritional goals
- **User Profiles**: Customizable user preferences and dietary restrictions
- **Favorite Recipes**: Save and organize favorite recipes for quick access

### 📊 Analytics & Insights
- Nutritional breakdown visualization
- Weekly and monthly consumption reports
- Goal achievement tracking
- Macro ratio analysis

### 🔍 Advanced Search
- Filter recipes by ingredients, prep time, difficulty level
- Allergen and dietary restriction filtering
- Cuisine and dish type categorization

## Tech Stack

### Frontend
- **React** - UI library for building interactive components
- **Redux** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Material-UI / Bootstrap** - UI component framework
- **Chart.js / Recharts** - Data visualization
- **CSS3 / SCSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Primary relational database
- **MongoDB** (optional) - Document store for recipe data
- **JWT** - Authentication and authorization
- **Bcrypt** - Password hashing
- **Dotenv** - Environment variable management

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control
- **ESLint** - Code linting
- **Jest / Mocha** - Testing frameworks
- **Postman** - API testing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Docker and Docker Compose (optional, for containerized setup)
- Git

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/osamuelnovaes/NutriChef-em-Casa.git
cd NutriChef-em-Casa
```

#### 2. Install Dependencies

**Backend Setup:**
```bash
cd backend
npm install
```

**Frontend Setup:**
```bash
cd ../frontend
npm install
```

#### 3. Configure Environment Variables

**Backend (.env):**
```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nutrichef
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
API_URL=http://localhost:5000
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

#### 4. Database Setup

```bash
# Create PostgreSQL database
createdb nutrichef

# Run migrations
cd backend
npm run migrate

# (Optional) Seed database with sample data
npm run seed
```

#### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Docker Setup (Recommended)

```bash
# Build and run all services
docker-compose up --build

# Run migrations
docker-compose exec backend npm run migrate

# (Optional) Seed database
docker-compose exec backend npm run seed
```

Access the application at `http://localhost:3000`

## Project Structure

```
NutriChef-em-Casa/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── validators/        # Input validation
│   │   └── config/            # Configuration files
│   ├── tests/                 # Test files
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Database seeds
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/                  # React frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── meal-plan/    # Meal planning components
│   │   │   ├── recipes/      # Recipe components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── common/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store, actions, reducers
│   │   ├── services/         # API services
│   │   ├── styles/           # Global styles
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── tests/                # Test files
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml        # Docker Compose configuration
├── .gitignore
├── README.md                 # This file
└── CONTRIBUTING.md           # Contribution guidelines
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh authentication token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update dietary preferences

### Recipes
- `GET /api/recipes` - List all recipes
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes` - Create new recipe (admin)
- `PUT /api/recipes/:id` - Update recipe (admin)
- `DELETE /api/recipes/:id` - Delete recipe (admin)
- `GET /api/recipes/search` - Search recipes

### Meal Plans
- `GET /api/meal-plans` - List user meal plans
- `POST /api/meal-plans` - Create meal plan
- `GET /api/meal-plans/:id` - Get meal plan details
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Shopping Lists
- `GET /api/shopping-lists` - List shopping lists
- `POST /api/shopping-lists` - Create shopping list
- `PUT /api/shopping-lists/:id` - Update shopping list
- `DELETE /api/shopping-lists/:id` - Delete shopping list

## Deployment Guide

### Heroku Deployment

#### 1. Prerequisites
- Heroku CLI installed
- Heroku account

#### 2. Create Heroku Apps
```bash
# Create backend app
heroku create nutrichef-backend

# Create frontend app
heroku create nutrichef-frontend
```

#### 3. Configure Environment Variables
```bash
# Backend
heroku config:set -a nutrichef-backend DATABASE_URL=postgresql://...
heroku config:set -a nutrichef-backend JWT_SECRET=your_secret_key
heroku config:set -a nutrichef-backend NODE_ENV=production

# Frontend
heroku config:set -a nutrichef-frontend REACT_APP_API_URL=https://nutrichef-backend.herokuapp.com
```

#### 4. Deploy Backend
```bash
git subtree push --prefix backend heroku main
```

#### 5. Deploy Frontend
```bash
git subtree push --prefix frontend heroku-frontend main
```

### AWS Deployment

#### 1. RDS Database Setup
- Create PostgreSQL RDS instance
- Configure security groups
- Update DATABASE_URL in backend environment

#### 2. EC2 Backend Deployment
```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-instance-ip

# Clone repository
git clone https://github.com/osamuelnovaes/NutriChef-em-Casa.git

# Install Node.js and dependencies
cd backend
npm install

# Start application with PM2
npm install -g pm2
pm2 start server.js
```

#### 3. S3 + CloudFront Frontend Deployment
```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name/

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Docker Compose Production Deployment

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Environment Configuration for Production

**Backend (.env production):**
```
PORT=5000
DATABASE_URL=postgresql://user:password@db-host:5432/nutrichef_prod
JWT_SECRET=very_secure_secret_key_here
NODE_ENV=production
API_URL=https://api.nutrichef.com
ALLOWED_ORIGINS=https://nutrichef.com
LOG_LEVEL=error
```

**Frontend (.env production):**
```
REACT_APP_API_URL=https://api.nutrichef.com
REACT_APP_ENV=production
```

### Monitoring & Maintenance

- Monitor application logs using ELK Stack or CloudWatch
- Set up automated backups for PostgreSQL
- Configure CDN for frontend assets
- Implement error tracking with Sentry
- Set up health checks and alerts

## Development Workflow

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/issue-name` - Production hotfixes
- `docs/documentation-name` - Documentation updates

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Coverage report
npm test -- --coverage
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Open an issue on GitHub
- Contact: support@nutrichef.com
- Visit our documentation: [docs.nutrichef.com](https://docs.nutrichef.com)

## Roadmap

- [ ] Mobile application (React Native)
- [ ] AI-powered meal recommendations
- [ ] Barcode scanning for nutritional data
- [ ] Integration with fitness trackers
- [ ] Social features and meal sharing
- [ ] Multi-language support
- [ ] Offline mode for mobile app

## Acknowledgments

- Community contributors
- Open-source projects and libraries
- Nutritional data sources and APIs
- Design inspiration and best practices

---

**Last Updated**: 2025-12-18

For the latest updates, please visit our [GitHub repository](https://github.com/osamuelnovaes/NutriChef-em-Casa).
