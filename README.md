# MLM Website - Binary Tree Referral System

A comprehensive Multi-Level Marketing (MLM) website with binary tree structure, referral system, and automated commission calculations.

## Features

### Core MLM Features
- **Binary Tree Structure**: Each user can have maximum 2 direct referrals (left and right)
- **Automated Commissions**: Earn $100 when both left and right positions are filled
- **Referral System**: Unique referral links for each user
- **Position Placement**: Smart placement in left or right position
- **Tree Visualization**: Interactive visual representation of your downline

### Dashboard Features
- Real-time earnings overview
- Total commission tracker
- Downline statistics (left/right leg counts)
- Recent transactions
- Referral link management
- Binary tree visualization
- Rank and achievement system

### MLM Calculations
- **Direct Referral Bonus**: Earn when you directly refer someone
- **Matching Bonus**: $100 when both left and right positions have at least 1 person
- **Level Commissions**: Earnings from multiple levels deep
- **Rank Achievements**: Advance through ranks based on network size

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks
- **Charts**: Recharts for analytics

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Caching**: Redis
- **Authentication**: JWT (Access + Refresh Tokens)

## Database Schema

### Users
- Profile information (name, email, phone)
- Authentication credentials
- Wallet balance
- Referral code (unique)
- Upline reference
- Rank/level

### BinaryTree
- User relationships (parent, left child, right child)
- Position tracking
- Leg volume calculations

### Transactions
- Commission payments
- Withdrawals
- Bonuses
- Transaction history

### Commissions
- Commission types (matching, direct, level)
- Payout records
- Pending commissions

## Installation

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15 (or use Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd mlm

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed initial data (optional)
docker-compose exec backend npm run seed

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Manual Installation

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with backend API URL

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://mlm_user:mlm_password@localhost:5432/mlm_database
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with referral code
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Get dashboard data
- `GET /api/user/referral-link` - Get referral link

### Tree
- `GET /api/tree/my-tree` - Get binary tree structure
- `GET /api/tree/stats` - Get tree statistics
- `GET /api/tree/downline` - Get all downline members

### Transactions
- `GET /api/transactions` - Get transaction history
- `POST /api/transactions/withdraw` - Request withdrawal
- `GET /api/transactions/commissions` - Get commission history

### Admin (Protected)
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - System-wide statistics
- `POST /api/admin/approve-withdrawal` - Approve withdrawal

## Commission Structure

### 1. Matching Bonus - $100
- Triggered when BOTH left and right positions have at least 1 person
- Paid immediately upon condition being met
- One-time payment per pair completion

### 2. Direct Referral Bonus
- Earn when someone joins using your referral link
- Configurable percentage or fixed amount

### 3. Level Commissions
- Earn from multiple levels in your downline
- Decreasing percentage as levels go deeper

### 4. Rank Bonuses
- Advance through ranks based on:
  - Total downline size
  - Left/Right leg balance
  - Personal sales volume

## Development

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management
```bash
# Create new migration
cd backend
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio
```

### Build for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Project Structure

```
mlm/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (App Router)
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Refresh token rotation
- Input validation and sanitization
- SQL injection protection (Prisma ORM)
- XSS protection
- Rate limiting on API endpoints
- Secure HTTP headers

## Performance Optimizations

- Redis caching for frequently accessed data
- Database query optimization with indexes
- Lazy loading of tree data
- Pagination for large datasets
- Image optimization (Next.js)
- API response caching

## Deployment

### Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-specific Deployment
- Configure production environment variables
- Set up SSL certificates
- Configure reverse proxy (Nginx)
- Set up database backups
- Configure monitoring and logging

## Support

For issues, questions, or contributions, please open an issue in the repository.

## License

MIT License - feel free to use this for your projects.
