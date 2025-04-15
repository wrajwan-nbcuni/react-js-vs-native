#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print info message
print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# Print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

print_header "Capacitor Implementation for React Native Features Comparison"
echo -e "This script will implement Capacitor in the React Native Features Comparison project."
echo -e "It performs the following steps:"
echo -e "1. Set up Capacitor framework and dependencies"
echo -e "2. Create Capacitor services for native functionality"
echo -e "3. Update React components to use Capacitor capabilities"
echo -e "4. Create build scripts for native platforms"

# Ensure script is run from project root
if [ ! -f "package.json" ]; then
  print_error "Error: Cannot find package.json. Please run this script from the project root directory."
  exit 1
fi

# Check prerequisites
print_header "Checking Prerequisites"

# Check for Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  print_success "Node.js is installed ($NODE_VERSION)"
else
  print_error "Node.js is not installed. Please install Node.js 14 or later."
  exit 1
fi

# Check for npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  print_success "npm is installed ($NPM_VERSION)"
else
  print_error "npm is not installed."
  exit 1
fi

# Check for Git
if command_exists git; then
  GIT_VERSION=$(git --version)
  print_success "Git is installed ($GIT_VERSION)"
else
  print_info "Git not found. Not critical but recommended for version control."
fi

# Confirm with user
echo
echo -e "${YELLOW}This script will modify your project files to implement Capacitor.${NC}"
echo -e "${YELLOW}Original files will be backed up with .backup extension.${NC}"
read -p "Do you want to continue? (y/n): " CONTINUE

if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
  print_error "Aborted by user."
  exit 1
fi

# Run Setup Capacitor script
print_header "Running Capacitor Setup"
if [ -f "./setup-capacitor.sh" ]; then
  chmod +x ./setup-capacitor.sh
  ./setup-capacitor.sh
  if [ $? -ne 0 ]; then
    print_error "Error in setup-capacitor.sh. Please check the logs."
    exit 1
  fi
  print_success "Capacitor setup completed successfully."
else
  print_error "setup-capacitor.sh script not found."
  exit 1
fi

# Install dependencies
print_header "Installing Dependencies"
npm install
if [ $? -ne 0 ]; then
  print_error "Error installing dependencies. Please check npm logs."
  exit 1
fi
print_success "Dependencies installed successfully."

# Update components
print_header "Updating Components with Capacitor Integration"
if [ -f "./install-capacitor-components.sh" ]; then
  chmod +x ./install-capacitor-components.sh
  ./install-capacitor-components.sh
  if [ $? -ne 0 ]; then
    print_error "Error in install-capacitor-components.sh. Please check the logs."
    exit 1
  fi
  print_success "Components updated successfully."
else
  print_error "install-capacitor-components.sh script not found."
  exit 1
fi

# Build the web app
print_header "Building Web App"
npm run build
if [ $? -ne 0 ]; then
  print_error "Error building web app. Please check build logs."
  exit 1
fi
print_success "Web app built successfully."

# Add Android platform if desired
print_header "Add Android Platform"
echo -e "${YELLOW}Would you like to add the Android platform?${NC}"
echo -e "${YELLOW}This requires Android Studio and JDK to be installed.${NC}"
read -p "Add Android platform? (y/n): " ADD_ANDROID

if [[ "$ADD_ANDROID" =~ ^[Yy]$ ]]; then
  npx cap add android
  if [ $? -ne 0 ]; then
    print_error "Error adding Android platform. Please check logs."
  else
    print_success "Android platform added successfully."
  fi
else
  print_info "Skipped adding Android platform."
fi

# Add iOS platform if desired
print_header "Add iOS Platform"
echo -e "${YELLOW}Would you like to add the iOS platform?${NC}"
echo -e "${YELLOW}This requires Xcode and macOS to be installed.${NC}"
read -p "Add iOS platform? (y/n): " ADD_IOS

if [[ "$ADD_IOS" =~ ^[Yy]$ ]]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    npx cap add ios
    if [ $? -ne 0 ]; then
      print_error "Error adding iOS platform. Please check logs."
    else
      print_success "iOS platform added successfully."
    fi
  else
    print_error "iOS platform can only be added on macOS. Skipping."
  fi
else
  print_info "Skipped adding iOS platform."
fi

# Copy web assets to native platforms
print_header "Copying Web Assets to Native Platforms"
if [[ "$ADD_ANDROID" =~ ^[Yy]$ ]] || [[ "$ADD_IOS" =~ ^[Yy]$ && "$OSTYPE" == "darwin"* ]]; then
  npx cap copy
  if [ $? -ne 0 ]; then
    print_error "Error copying web assets. Please check logs."
  else
    print_success "Web assets copied successfully."
  fi
else
  print_info "No platforms to copy assets to. Skipping."
fi

# Final instructions
print_header "Implementation Complete!"
echo -e "${GREEN}Capacitor has been successfully implemented in your project.${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"

if [[ "$ADD_ANDROID" =~ ^[Yy]$ ]]; then
  echo -e "1. To open the Android project in Android Studio:"
  echo -e "   ${YELLOW}npx cap open android${NC}"
fi

if [[ "$ADD_IOS" =~ ^[Yy]$ && "$OSTYPE" == "darwin"* ]]; then
  echo -e "1. To open the iOS project in Xcode:"
  echo -e "   ${YELLOW}npx cap open ios${NC}"
fi

echo -e "2. To update native platforms after making changes:"
echo -e "   ${YELLOW}npm run build && npx cap copy${NC}"
echo
echo -e "3. To run on web with hot reload:"
echo -e "   ${YELLOW}npm start${NC}"
echo
echo -e "4. Review ${YELLOW}CAPACITOR.md${NC} for more information on Capacitor integration."
echo
echo -e "5. If needed, you can restore original components with:"
echo -e "   ${YELLOW}./restore-original-components.sh${NC}"
echo
echo -e "${GREEN}Happy developing with Capacitor!${NC}"
