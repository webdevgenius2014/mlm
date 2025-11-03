#!/bin/bash

# Local Setup Script (Without Docker)
# This script helps you set up the MLM platform to run locally

set -e

echo "=================================="
echo "MLM Website - Local Setup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) is installed${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version) is installed${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL is not installed or not in PATH${NC}"
    echo "Please install PostgreSQL 15+ from https://www.postgresql.org/download/"
    echo "After installation, you may need to add it to your PATH"
else
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
fi

echo ""
echo "=================================="
echo "Step 1: Database Setup"
echo "=================================="
echo ""

echo "Please create a PostgreSQL database for the MLM platform."
echo ""
echo "Run these commands in your PostgreSQL terminal:"
echo ""
echo -e "${YELLOW}  CREATE DATABASE mlm_database;"
echo "  CREATE USER mlm_user WITH PASSWORD 'mlm_password';"
echo "  GRANT ALL PRIVILEGES ON DATABASE mlm_database TO mlm_user;"
echo "  \\q${NC}"
echo ""

read -p "Have you created the database? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please create the database first, then run this script again.${NC}"
    exit 0
fi

echo ""
echo "=================================="
echo "Step 2: Backend Setup"
echo "=================================="
echo ""

# Setup backend environment
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠ Please review and update backend/.env with your database credentials${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env already exists${NC}"
fi

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Run migrations
echo ""
echo "Running database migrations..."
npx prisma generate
npx prisma migrate deploy
echo -e "${GREEN}✓ Database migrations completed${NC}"

cd ..

echo ""
echo "=================================="
echo "Step 3: Frontend Setup"
echo "=================================="
echo ""

# Setup frontend environment
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✓ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env.local already exists${NC}"
fi

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo -e "${GREEN}=================================="
echo "Setup Complete! 🎉"
echo "==================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo -e "   ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo "2. Start the frontend (in another terminal):"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "3. Open your browser:"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Or use the provided start script:"
echo -e "   ${GREEN}./start-local.sh${NC}"
echo ""
