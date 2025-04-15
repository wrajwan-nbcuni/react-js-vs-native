#!/bin/bash

# Build the web app
echo "Building web app..."
npm run build

# Add platforms
echo "Adding Capacitor platforms..."
npx cap add android
npx cap add ios

# Copy web assets
echo "Copying web assets to native platforms..."
npx cap copy

# Update native platforms with any plugin changes
echo "Updating native plugins..."
npx cap update

echo "Capacitor build completed!"
echo "To open in Android Studio: npx cap open android"
echo "To open in Xcode: npx cap open ios"
