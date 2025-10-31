#!/bin/bash

# MLM Website Setup Script
# This script helps you set up the MLM platform quickly

set -e  # Exit on error

echo "=================================="
echo "MLM Website Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Setup environment files
echo "Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env already exists, skipping${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✓ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env.local already exists, skipping${NC}"
fi

echo ""

# Ask if user wants to start services
read -p "Do you want to start all services with Docker? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting services with Docker Compose..."
    docker-compose up -d

    echo ""
    echo "Waiting for services to be ready..."
    sleep 10

    echo ""
    echo "Running database migrations..."
    docker-compose exec -T backend npx prisma migrate deploy || true
    docker-compose exec -T backend npx prisma generate || true

    echo ""
    echo -e "${GREEN}=================================="
    echo "Setup Complete! 🎉"
    echo "==================================${NC}"
    echo ""
    echo "Your MLM platform is now running:"
    echo ""
    echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend:   ${GREEN}http://localhost:5000${NC}"
    echo -e "  API Health: ${GREEN}http://localhost:5000/health${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Register your first account (this will be the root user)"
    echo "  3. Start building your network!"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    echo ""
    echo "To open Prisma Studio (Database GUI):"
    echo "  docker-compose exec backend npx prisma studio"
    echo ""
else
    echo ""
    echo -e "${YELLOW}Skipped starting services.${NC}"
    echo ""
    echo "To start services manually, run:"
    echo "  docker-compose up -d"
    echo ""
    echo "Then run migrations:"
    echo "  docker-compose exec backend npx prisma migrate deploy"
    echo "  docker-compose exec backend npx prisma generate"
fi

echo ""
echo "For more detailed instructions, see SETUP.md"
echo ""
