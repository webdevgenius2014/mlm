# MLM Website Setup Guide

This guide will help you set up the complete MLM website with binary tree structure and referral system.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm
- **Docker** and Docker Compose (recommended)
- **PostgreSQL** 15+ (if not using Docker)
- **Git**

## Quick Start with Docker (Recommended)

This is the easiest way to get started. Docker will handle all dependencies automatically.

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mlm
```

### 2. Set Up Environment Variables

Create backend environment file:
```bash
cp backend/.env.example backend/.env
```

Create frontend environment file:
```bash
cp frontend/.env.example frontend/.env.local
```

The default values should work for Docker setup. No changes needed unless you want to customize.

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 5000)
- Frontend website (port 3000)

### 4. Run Database Migrations

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### 6. Create Your First Admin Account

Go to http://localhost:3000/register and create an account. The first user you create will be the root of the binary tree.

## Manual Installation (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   DATABASE_URL=postgresql://mlm_user:mlm_password@localhost:5432/mlm_database
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret
   PORT=5000
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   psql -U postgres
   CREATE DATABASE mlm_database;
   CREATE USER mlm_user WITH PASSWORD 'mlm_password';
   GRANT ALL PRIVILEGES ON DATABASE mlm_database TO mlm_user;
   \q
   ```

5. **Run migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. **Start the backend**
   ```bash
   npm run dev
   ```

   Backend should now be running on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend**
   ```bash
   npm run dev
   ```

   Frontend should now be running on http://localhost:3000

## Testing the System

### 1. Register First User (Root)

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. Leave referral code empty (this will be your root user)
4. Click "Create Account"

### 2. Test Referral System

1. Log in to your account
2. Go to "Referral" page
3. Copy your referral link
4. Open the link in an incognito window
5. Register a new user with your referral code

### 3. Test Binary Tree

1. Register at least 2 users under your account
2. Go to "Binary Tree" page
3. You should see your downline structure

### 4. Test Matching Bonus

1. Register one user on the left position
2. Register one user on the right position
3. Check your dashboard - you should receive $100 matching bonus

### 5. Test Withdrawal

1. Go to "Transactions" page
2. Enter an amount (minimum $10)
3. Click "Withdraw"
4. Your withdrawal request will be pending until approved by admin

## Database Management

### Prisma Studio (Database GUI)

View and manage your database with Prisma Studio:

```bash
# If using Docker
docker-compose exec backend npx prisma studio

# If running locally
cd backend
npx prisma studio
```

This will open a web interface at http://localhost:5555

### Reset Database

If you need to reset the database:

```bash
# If using Docker
docker-compose exec backend npx prisma migrate reset

# If running locally
cd backend
npx prisma migrate reset
```

## Troubleshooting

### Port Already in Use

If you get an error that a port is already in use:

```bash
# Check what's using the port (example for port 3000)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Docker Issues

If Docker services won't start:

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Database Connection Issues

1. Check that PostgreSQL is running:
   ```bash
   # Docker
   docker-compose ps

   # Local
   pg_isready -h localhost -p 5432
   ```

2. Verify DATABASE_URL in backend/.env

3. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Frontend Can't Connect to Backend

1. Check backend is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Verify NEXT_PUBLIC_API_URL in frontend/.env.local

3. Check for CORS errors in browser console

## Production Deployment

### Environment Variables

For production, update these environment variables:

**Backend (.env)**
```env
NODE_ENV=production
DATABASE_URL=<your-production-database-url>
JWT_SECRET=<generate-a-strong-secret>
JWT_REFRESH_SECRET=<generate-another-strong-secret>
REDIS_URL=<your-redis-url>
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up proper firewall rules
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Review and update CORS settings
- [ ] Implement proper input validation
- [ ] Set up error tracking (Sentry, etc.)

## Configuration

### MLM Settings

You can customize MLM settings in backend/.env:

```env
MATCHING_BONUS_AMOUNT=100        # Amount paid when both positions filled
DIRECT_REFERRAL_BONUS=50         # Amount paid for direct referrals
```

### Email Notifications (Optional)

To add email notifications, you'll need to:

1. Install nodemailer:
   ```bash
   cd backend
   npm install nodemailer
   ```

2. Add email configuration to backend/.env:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

3. Implement email service in backend/src/services/emailService.ts

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Endpoints (Authenticated)

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Get dashboard stats
- `GET /api/user/referral-link` - Get referral link
- `GET /api/user/downline` - Get direct referrals

### Tree Endpoints (Authenticated)

- `GET /api/tree/my-tree?depth=5` - Get binary tree structure
- `GET /api/tree/stats` - Get tree statistics

### Transaction Endpoints (Authenticated)

- `GET /api/transactions` - Get transaction history
- `POST /api/transactions/withdraw` - Request withdrawal
- `GET /api/transactions/withdrawals` - Get withdrawals
- `GET /api/transactions/commissions` - Get commissions
- `GET /api/transactions/commission-stats` - Get commission stats

### Admin Endpoints (Admin Only)

- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/withdrawals/pending` - Pending withdrawals
- `POST /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `POST /api/admin/withdrawals/:id/reject` - Reject withdrawal
- `PUT /api/admin/users/:id/status` - Update user status

## Support

For issues or questions:
1. Check this setup guide
2. Review the main README.md
3. Check Docker logs: `docker-compose logs`
4. Open an issue in the repository

## Next Steps

After successful setup:

1. ✅ Register your first user (root)
2. ✅ Test the referral system
3. ✅ Add some test users
4. ✅ Verify binary tree structure
5. ✅ Test commission calculations
6. ✅ Try withdrawal requests
7. ✅ Explore the dashboard features
8. ✅ Customize branding and colors
9. ✅ Set up production environment
10. ✅ Deploy to production

Congratulations! Your MLM platform is now up and running! 🎉
