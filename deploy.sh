#!/bin/bash

# Manual deployment script for LD11 Dashboard
# This can be used as an alternative to GitHub Actions

set -e

echo "🚀 Starting LD11 Dashboard Deployment..."

# Configuration
SERVER_HOST="your-server-ip-or-domain"
SERVER_USER="your-username"
SERVER_PATH="/sunbeltsolutions.org/ld11"
LOCAL_BUILD_DIR="build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    if [ ! -f "index.php" ]; then
        print_error "index.php not found!"
        exit 1
    fi
    
    if [ ! -f "voters_api.php" ]; then
        print_error "voters_api.php not found!"
        exit 1
    fi
    
    if [ ! -d "public" ]; then
        print_error "public directory not found!"
        exit 1
    fi
    
    print_status "All required files found ✓"
}

# Build React application
build_react() {
    print_status "Building React application..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found!"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build the application
    print_status "Building for production..."
    npm run build
    
    if [ ! -d "$LOCAL_BUILD_DIR" ]; then
        print_error "Build failed - build directory not created!"
        exit 1
    fi
    
    print_status "React build completed ✓"
}

# Deploy to server
deploy_to_server() {
    print_status "Deploying to server..."
    
    # Create deployment package
    print_status "Creating deployment package..."
    tar -czf ld11-deployment.tar.gz \
        index.php \
        voters_api.php \
        package.json \
        README.md \
        public/ \
        build/
    
    # Upload to server
    print_status "Uploading files to server..."
    scp ld11-deployment.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/
    
    # Extract and setup on server
    print_status "Setting up on server..."
    ssh $SERVER_USER@$SERVER_HOST << EOF
        # Create directory if it doesn't exist
        mkdir -p $SERVER_PATH
        
        # Backup current deployment
        if [ -d "$SERVER_PATH/live" ]; then
            rm -rf $SERVER_PATH/backup
            mv $SERVER_PATH/live $SERVER_PATH/backup
        fi
        
        # Create new deployment directory
        mkdir -p $SERVER_PATH/current
        
        # Extract files
        cd $SERVER_PATH/current
        tar -xzf /tmp/ld11-deployment.tar.gz
        
        # Set permissions
        chmod -R 755 .
        chmod 644 *.php *.json
        
        # Create .htaccess for Apache
        cat > .htaccess << 'HTACCESS_EOF'
RewriteEngine On
RewriteBase /ld11/

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /ld11/index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
HTACCESS_EOF
        
        # Activate new deployment
        cd $SERVER_PATH
        mv current live
        
        # Clean up
        rm -f /tmp/ld11-deployment.tar.gz
        
        echo "Deployment completed successfully!"
        echo "Dashboard available at: https://sunbeltsolutions.org/ld11/"
EOF
    
    # Clean up local files
    rm -f ld11-deployment.tar.gz
    
    print_status "Deployment completed ✓"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test if the main page loads
    if curl -s -o /dev/null -w "%{http_code}" https://sunbeltsolutions.org/ld11/ | grep -q "200"; then
        print_status "Deployment test successful ✓"
    else
        print_warning "Deployment test failed - please check manually"
    fi
}

# Main deployment process
main() {
    echo "=========================================="
    echo "  LD11 Dashboard Deployment Script"
    echo "=========================================="
    
    # Check if server configuration is set
    if [ "$SERVER_HOST" = "your-server-ip-or-domain" ]; then
        print_error "Please update SERVER_HOST in this script with your actual server details"
        exit 1
    fi
    
    if [ "$SERVER_USER" = "your-username" ]; then
        print_error "Please update SERVER_USER in this script with your actual username"
        exit 1
    fi
    
    check_files
    build_react
    deploy_to_server
    test_deployment
    
    echo "=========================================="
    print_status "🎉 Deployment completed successfully!"
    print_status "Dashboard URL: https://sunbeltsolutions.org/ld11/"
    echo "=========================================="
}

# Run main function
main "$@"
