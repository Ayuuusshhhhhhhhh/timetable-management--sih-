# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack Timetable Management System for educational institutions built with Node.js/Express backend and React frontend. The system generates clash-free schedules using a rule-based scheduling engine with SQLite database storage.

## Common Development Commands

### Initial Setup
```powershell
# Full project setup (run once)
node scripts/setup.js
```

### Backend Development
```powershell
# Install dependencies
cd backend
npm install

# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Run tests
npm test
```

### Frontend Development
```powershell
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database Operations
```powershell
# From backend directory
cd backend

# Create new migration
npx knex migrate:make migration_name

# Rollback last migration
npx knex migrate:rollback

# Check migration status
npx knex migrate:status

# Create new seed file
npx knex seed:make seed_name
```

### Running Single Tests
```powershell
# Backend - specific test file
cd backend
npm test -- --testPathPattern=controllers/timetable

# Frontend - specific component test
cd frontend
npm test -- --testNamePattern="Login component"
```

## Architecture Overview

### High-Level System Design

The application follows a 3-tier architecture with clear separation between presentation, business logic, and data layers:

1. **Frontend (React)**: Material-UI based SPA with role-based routing
2. **Backend (Express)**: RESTful API with JWT authentication 
3. **Database (SQLite)**: Relational schema with Knex.js ORM

### Core Business Logic

**Scheduling Engine (`backend/src/services/schedulingService.js`)**
- Implements constraint-based timetable generation
- Handles resource conflicts (faculty, classrooms, batches)
- Uses greedy algorithm with backtracking for optimization
- Key methods: `generateTimetable()`, `scheduleSession()`, `validateTimetable()`

**Conflict Detection**
- Database-level unique constraints prevent double bookings
- Application-level validation in `Timetable.checkConflicts()`
- Real-time conflict checking during manual schedule updates

**Export Services (`backend/src/services/exportService.js`)**
- PDF generation using PDFKit
- Excel export using excel4node
- Supports both full timetables and batch-specific views

### Data Model Relationships

**Core Entities:**
- `users` → faculty, admin, students
- `batches` → student groups by year/department
- `subjects` → courses with credits and type (lecture/lab/practical)
- `classrooms` → rooms with type and capacity constraints
- `time_slots` → available scheduling periods
- `faculty_subjects` → many-to-many faculty assignments
- `timetable_entries` → scheduled classes (the main scheduling result)

**Key Relationships:**
- One timetable entry links: batch + subject + faculty + classroom + time_slot
- Faculty can teach multiple subjects to multiple batches
- Classrooms are typed (lecture/lab/seminar) and matched to subject requirements
- Unique constraints prevent scheduling conflicts at database level

### Frontend Architecture

**Route Structure:**
- Public: `/login`  
- Protected (All): `/`, `/timetable`
- Admin Only: `/classrooms`, `/subjects`, `/faculty`, `/batches`, `/generate`

**Key Components:**
- `Layout.js` - Main app shell with navigation
- `pages/TimetableGeneration.js` - Core scheduling interface
- `services/authService.js` - API authentication layer
- Material-UI theme and component integration

### Authentication Flow

JWT-based authentication with role-based access control:
1. Login → JWT token stored in localStorage
2. `authenticateToken` middleware validates all protected routes
3. Frontend axios interceptors handle token attachment
4. Role-based component rendering (`user.role === 'admin'`)

## Development Notes

### Environment Configuration
- Copy `.env.example` to `.env` and configure
- Default ports: Backend (5000), Frontend (3000)
- SQLite database created at `./database/timetable.db`

### Database Schema Changes
Always use migrations for schema changes:
1. Create migration: `npx knex migrate:make description`
2. Implement `up()` and `down()` functions
3. Test with `npm run migrate` and rollback

### Debugging Timetable Generation
The scheduling engine logs extensively. Common issues:
- Insufficient classrooms of correct type
- Over-allocated faculty (too many subjects)
- Time slot constraints (breaks, unavailable periods)
- Check `SchedulingService.validateTimetable()` for conflicts

### API Testing
Default admin credentials: `admin@example.com` / `admin123`
Health check available at: `GET /health`
All API routes under `/api/` require authentication except `/api/auth/login`

### Performance Considerations
- Timetable generation complexity grows with batch/subject count
- Large institutions may need algorithm optimization
- Consider database indexing for production deployments
- Frontend pagination recommended for large datasets
