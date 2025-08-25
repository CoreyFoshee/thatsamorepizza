#!/bin/bash

echo "🍽️  Starting That's Amore Catering Website..."
echo "📁 Directory: $(pwd)"
echo "🚀 Installing dependencies..."

# Install dependencies
npm install

echo "✅ Dependencies installed successfully!"
echo "🌐 Starting server on port 3001..."
echo "📱 Website will be available at: http://localhost:3001"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
