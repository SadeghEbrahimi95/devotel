#!/bin/bash

set -e

echo "🚀 Setting up Job Data Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ npm $(npm --version) detected"

# Install NestJS CLI if not present
if ! command -v nest &> /dev/null; then
    echo "📦 Installing NestJS CLI..."
    npm install -g @nestjs/cli
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update as needed."
else
    echo "✅ .env file already exists."
fi

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker detected. Starting PostgreSQL..."
    docker-compose up -d postgres
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    # Check if database is ready
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U jobuser -d jobsdb > /dev/null 2>&1; then
            echo "✅ Database is ready!"
            break
        fi
        echo "🔄 Attempt $attempt/$max_attempts - Database not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo "⚠️  Database startup timeout. Please check Docker logs."
    fi
else
    echo "⚠️  Docker not found. Please ensure PostgreSQL is running manually."
    echo "   Create database: jobsdb"
    echo "   Create user: jobuser with password: jobpass"
fi

# Build the application
echo "🔧 Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review the .env file and update configuration as needed"
echo "2. Start the application in development mode: npm run start:dev"
echo "3. Visit http://localhost:3000/api/docs for API documentation"
echo "4. Test the API endpoints with the examples in README.md"
echo ""
echo "Quick test commands:"
echo "• curl http://localhost:3000/api/job-offers"
echo "• curl -X POST http://localhost:3000/api/job-offers/fetch"
echo "• curl http://localhost:3000/api/job-offers/stats"