# Local Setup Guide (Without Docker)

This guide will help you set up and run the MLM platform locally without Docker.

## Prerequisites

Install the following software on your machine:

### 1. Node.js and npm
- **Version Required**: Node.js 18 or higher
- **Download**: https://nodejs.org/
- **Verify installation**:
  ```bash
  node --version  # Should show v18.x.x or higher
  npm --version   # Should show 9.x.x or higher
  ```

### 2. PostgreSQL
- **Version Required**: PostgreSQL 15 or higher
- **Download**: https://www.postgresql.org/download/
  - **Windows**: Use the installer from EDB
  - **macOS**: `brew install postgresql@15` (if using Homebrew)
  - **Linux**: `sudo apt-get install postgresql-15` (Ubuntu/Debian)

- **Verify installation**:
  ```bash
  psql --version  # Should show 15.x or higher
  ```

### 3. Redis (Optional but Recommended)
- **Download**: https://redis.io/download/
  - **Windows**: Use Redis for Windows or WSL
  - **macOS**: `brew install redis`
  - **Linux**: `sudo apt-get install redis-server`

- **Verify installation**:
  ```bash
  redis-cli --version
  ```

## Step-by-Step Setup

### Step 1: Create PostgreSQL Database

1. **Start PostgreSQL service**:
   - **Windows**: Should start automatically after installation
   - **macOS**: `brew services start postgresql@15`
   - **Linux**: `sudo systemctl start postgresql`

2. **Access PostgreSQL**:
   ```bash
   # Use the postgres superuser
   psql -U postgres
   ```

3. **Create database and user**:
   ```sql
   -- Create the database
   CREATE DATABASE mlm_database;

   -- Create user with password
   CREATE USER mlm_user WITH PASSWORD 'mlm_password';

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE mlm_database TO mlm_user;

   -- Grant schema privileges (PostgreSQL 15+)
   \c mlm_database
   GRANT ALL ON SCHEMA public TO mlm_user;

   -- Exit
   \q
   ```

4. **Test connection**:
   ```bash
   psql -U mlm_user -d mlm_database -h localhost
   # Enter password: mlm_password
   # If successful, you'll see the psql prompt
   \q
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** with your settings:
   ```env
   # Database - Update if you used different credentials
   DATABASE_URL=postgresql://mlm_user:mlm_password@localhost:5432/mlm_database

   # Redis - Optional, comment out if not using
   REDIS_URL=redis://localhost:6379

   # JWT Secrets - CHANGE THESE IN PRODUCTION
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d

   # Server
   PORT=5000
   NODE_ENV=development

   # MLM Configuration
   MATCHING_BONUS_AMOUNT=100
   DIRECT_REFERRAL_BONUS=50
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run database migrations**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations to create tables
   npx prisma migrate deploy
   ```

   If you encounter issues, try:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Verify database setup** (Optional):
   ```bash
   # Open Prisma Studio to view your database
   npx prisma studio
   # Opens at http://localhost:5555
   ```

7. **Start the backend server**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 MLM Backend API running on http://localhost:5000
   📊 Environment: development
   💾 Database: Connected
   ```

8. **Test the API**:
   ```bash
   # In a new terminal
   curl http://localhost:5000/health
   # Should return: {"status":"ok","message":"MLM API is running"}
   ```

### Step 3: Frontend Setup

1. **Open a NEW terminal** (keep backend running)

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` file**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Start the frontend**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   ```

7. **Open your browser**:
   - Go to http://localhost:3000
   - You should see the login page

## Quick Start Scripts

I've created scripts to make this easier:

### Setup Script (One-time)
```bash
chmod +x setup-local.sh
./setup-local.sh
```

### Start Script (Every time)
```bash
chmod +x start-local.sh
./start-local.sh
```

This will start both backend and frontend in one terminal.

## Manual Start (Without Scripts)

If you prefer to start services manually:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Redis (if using):**
```bash
redis-server
```

## Testing the Application

### 1. Register Your First User
1. Go to http://localhost:3000
2. Click "Sign up"
3. Fill in the registration form
4. Leave referral code empty (this will be your root user)
5. Click "Create Account"

### 2. Test the Dashboard
- After login, you should see your dashboard
- Balance should be $0.00
- No downline yet

### 3. Test Referral System
1. Go to "Referral" page
2. Copy your referral link
3. Open an incognito/private browser window
4. Paste the referral link
5. Register a new user
6. Check your main account's dashboard - you should see:
   - +1 direct referral
   - +$50 direct referral bonus

### 4. Test Matching Bonus
1. Register another user with your referral code
2. Check your dashboard
3. When both left and right positions are filled, you'll receive $100

## Troubleshooting

### Database Connection Issues

**Error: "Cannot connect to database"**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list

# Linux:
sudo systemctl status postgresql

# Start if not running:
# macOS:
brew services start postgresql@15

# Linux:
sudo systemctl start postgresql
```

**Error: "password authentication failed"**
- Check your DATABASE_URL in backend/.env
- Verify credentials in PostgreSQL:
  ```bash
  psql -U mlm_user -d mlm_database -h localhost
  ```

**Error: "database does not exist"**
- Recreate the database following Step 1

### Port Already in Use

**Error: "Port 5000 is already in use"**
```bash
# Find what's using the port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change the port in backend/.env
PORT=5001
```

**Error: "Port 3000 is already in use"**
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or Next.js will offer to use port 3001
```

### Prisma Migration Issues

**Error: "P1001: Can't reach database server"**
```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL format in backend/.env
# Should be: postgresql://USER:PASSWORD@localhost:5432/DATABASE
```

**Error: "Migration failed"**
```bash
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# Then run migrations again
npx prisma migrate deploy
```

### Module Not Found Errors

**Error: "Cannot find module..."**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Not Connecting to Backend

1. **Check backend is running**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check NEXT_PUBLIC_API_URL in frontend/.env.local**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Clear browser cache and restart frontend**:
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

### Redis Connection Issues (Optional)

If you're not using Redis, comment it out in backend/.env:
```env
# REDIS_URL=redis://localhost:6379
```

If you want to use Redis:
```bash
# Start Redis
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis

# Test connection
redis-cli ping
# Should return: PONG
```

## Production Build

When ready for production:

### Backend:
```bash
cd backend
npm run build
npm start
```

### Frontend:
```bash
cd frontend
npm run build
npm start
```

## Database Management

### View Database Contents
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

### Backup Database
```bash
pg_dump -U mlm_user -d mlm_database > backup.sql
```

### Restore Database
```bash
psql -U mlm_user -d mlm_database < backup.sql
```

### Reset Database (WARNING: Deletes all data)
```bash
cd backend
npx prisma migrate reset
```

## Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL              # PostgreSQL connection string
REDIS_URL                 # Redis connection (optional)
JWT_SECRET               # Secret for access tokens
JWT_REFRESH_SECRET       # Secret for refresh tokens
JWT_EXPIRES_IN          # Access token expiry (e.g., "1h")
JWT_REFRESH_EXPIRES_IN  # Refresh token expiry (e.g., "7d")
PORT                    # Server port (default: 5000)
NODE_ENV                # Environment (development/production)
MATCHING_BONUS_AMOUNT   # Matching bonus amount (default: 100)
DIRECT_REFERRAL_BONUS   # Direct referral bonus (default: 50)
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL     # Backend API URL
```

## Useful Commands

```bash
# Backend
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create and apply migration

# Frontend
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter

# Database
psql -U mlm_user -d mlm_database    # Connect to database
pg_dump -U mlm_user mlm_database    # Backup database
```

## Performance Tips

1. **Use Redis for caching** - Significantly improves performance
2. **Enable PostgreSQL query logging** during development
3. **Use environment variables** for different configurations
4. **Monitor database connections** in production

## Next Steps

1. ✅ Complete local setup
2. ✅ Test all features
3. ✅ Customize branding and colors
4. ✅ Add your logo and company info
5. ✅ Configure email notifications (optional)
6. ✅ Set up production environment
7. ✅ Deploy to production server

## Support

- Check the main README.md for features
- See SETUP.md for Docker setup
- Review this guide for local setup issues

Happy building! 🚀
