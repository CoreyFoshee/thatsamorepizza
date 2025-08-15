#!/bin/bash

# That's Amore Pizzeria Website Deployment Script
# This script helps with common deployment tasks

echo "🍕 That's Amore Pizzeria Website Deployment"
echo "=========================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Function to show current status
show_status() {
    echo ""
    echo "📊 Current Git Status:"
    echo "----------------------"
    git status --short
    echo ""
    echo "📝 Recent Commits:"
    echo "------------------"
    git log --oneline -5
}

# Function to build and test
build_test() {
    echo ""
    echo "🔨 Building and Testing..."
    echo "-------------------------"
    
    # Check if all HTML files exist
    required_files=("index.html" "menu.html" "catering.html" "franchise.html" "contact.html")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "✅ All required HTML files present"
    else
        echo "❌ Missing files: ${missing_files[*]}"
        return 1
    fi
    
    # Check if CSS and JS files exist
    if [ -f "styles.css" ] && [ -f "script.js" ]; then
        echo "✅ CSS and JavaScript files present"
    else
        echo "❌ Missing CSS or JavaScript files"
        return 1
    fi
    
    # Check if logo directory exists
    if [ -d "Logo" ]; then
        echo "✅ Logo directory present"
    else
        echo "❌ Logo directory missing"
        return 1
    fi
    
    echo "✅ Build check completed successfully"
}

# Function to create production build
create_production() {
    echo ""
    echo "🚀 Creating Production Build..."
    echo "-------------------------------"
    
    # Create production directory
    if [ -d "production" ]; then
        rm -rf production
    fi
    
    mkdir production
    
    # Copy all necessary files
    cp *.html production/
    cp *.css production/
    cp *.js production/
    cp -r Logo production/
    cp README.md production/
    
    # Remove development files
    rm -f production/.gitignore
    rm -f production/deploy.sh
    rm -f production/thats_amore_design.json
    
    echo "✅ Production build created in 'production/' directory"
    echo "📁 Files ready for deployment:"
    ls -la production/
}

# Function to deploy to local server
local_server() {
    echo ""
    echo "🌐 Starting Local Development Server..."
    echo "-------------------------------------"
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        echo "🚀 Starting server with Python 3..."
        echo "📍 Server will be available at: http://localhost:8000"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        echo "🚀 Starting server with Python..."
        echo "📍 Server will be available at: http://localhost:8000"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python -m http.server 8000
    else
        echo "❌ Python not found. Please install Python to use the local server."
        echo "💡 Alternative: Use any local web server or open index.html directly in your browser."
    fi
}

# Function to show help
show_help() {
    echo ""
    echo "📖 Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  status     - Show current git status and recent commits"
    echo "  build      - Check if all required files are present"
    echo "  production - Create a production-ready build"
    echo "  serve      - Start a local development server"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh status"
    echo "  ./deploy.sh build"
    echo "  ./deploy.sh production"
    echo "  ./deploy.sh serve"
}

# Main script logic
case "${1:-help}" in
    "status")
        show_status
        ;;
    "build")
        build_test
        ;;
    "production")
        build_test && create_production
        ;;
    "serve")
        local_server
        ;;
    "help"|*)
        show_help
        ;;
esac

echo ""
echo "🍕 That's Amore Pizzeria - Ready to serve amazing pizza!"
