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

# Check for required tools
check_prerequisites() {
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
    print_error "Git is not installed. Please install Git."
    exit 1
  fi
}

# Install Capacitor dependencies
install_capacitor() {
  print_header "Installing Capacitor and Dependencies"

  # Install Capacitor core and CLI
  npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
  print_success "Installed Capacitor core and platform dependencies"

  # Install Capacitor plugins (correct set, no deprecated storage)
  npm install @capacitor/camera @capacitor/geolocation @capacitor/device @capacitor/preferences @capacitor/haptics
  print_success "Installed Capacitor plugins"
}

# Create capacitor configuration file
create_capacitor_config() {
  print_header "Configuring Capacitor"

  # Initialize capacitor config
  npx cap init "React Native Features Comparison" "com.example.reactfeatures" --web-dir "dist"

  # Update capacitor.config.ts with custom configuration
  cat > capacitor.config.ts << EOL
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.reactfeatures',
  appName: 'React Native Features Comparison',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0070f3",
      showSpinner: true,
      spinnerColor: "#ffffff",
    },
    Haptics: {
      // No specific configuration needed
    },
    Camera: {
      // Permission handling
    },
    Geolocation: {
      // Permission handling
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
EOL

  print_success "Created capacitor.config.ts"
}

# Update vite configuration to work with Capacitor
update_vite_config() {
  print_header "Updating Vite Configuration"

  # Backup the original vite.config.js
  cp vite.config.js vite.config.js.backup
  print_info "Backed up original vite.config.js to vite.config.js.backup"

  # Create new vite.config.js with Capacitor support
  cat > vite.config.js << EOL
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', '@use-gesture/react', 'framer-motion', 'react-spring']
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  build: {
    outDir: 'dist',
    // Ensure source maps for better debugging in Capacitor
    sourcemap: true,
  }
});
EOL

  print_success "Updated vite.config.js for Capacitor compatibility"
}

# Create service for Capacitor integration
create_capacitor_service() {
  print_header "Creating Capacitor Service"

  # Create services directory if it doesn't exist
  mkdir -p src/services

  # Create Capacitor service file
  cat > src/services/CapacitorService.js << EOL
// Capacitor service for integrating native functionality
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Check if running on native platform
const isNative = () => Capacitor.isNativePlatform();
const getPlatform = () => Capacitor.getPlatform();

// Camera services
const cameraService = {
  async requestPermissions() {
    if (!isNative()) return true;
    return await Camera.requestPermissions();
  },

  async getPhoto() {
    if (!isNative()) return null;

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri'
      });
      return image;
    } catch (e) {
      console.error('Error taking photo', e);
      return null;
    }
  }
};

// Geolocation services
const locationService = {
  async requestPermissions() {
    if (!isNative()) return true;
    return await Geolocation.requestPermissions();
  },

  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      return position;
    } catch (e) {
      console.error('Error getting location', e);
      return null;
    }
  },

  watchPosition(callback) {
    if (!isNative()) return null;

    const watchId = Geolocation.watchPosition({
      enableHighAccuracy: true
    }, position => {
      callback(position);
    });

    return watchId;
  },

  clearWatch(watchId) {
    if (!isNative() || !watchId) return;
    Geolocation.clearWatch({ id: watchId });
  }
};

// Device information services
const deviceService = {
  async getDeviceInfo() {
    try {
      const info = await Device.getInfo();
      return info;
    } catch (e) {
      console.error('Error getting device info', e);
      return null;
    }
  },

  async getBatteryInfo() {
    if (!isNative()) return null;

    try {
      const battery = await Device.getBatteryInfo();
      return battery;
    } catch (e) {
      console.error('Error getting battery info', e);
      return null;
    }
  }
};

// Storage services
const storageService = {
  async setItem(key, value) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    await Preferences.set({
      key,
      value
    });
  },

  async getItem(key) {
    const { value } = await Preferences.get({ key });

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },

  async removeItem(key) {
    await Preferences.remove({ key });
  },

  async clear() {
    await Preferences.clear();
  },

  async keys() {
    const { keys } = await Preferences.keys();
    return keys;
  }
};

// Haptic feedback services
const hapticService = {
  vibrate(pattern) {
    if (!isNative()) {
      // Fallback to Web Vibration API if available
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
      return;
    }

    // Map common pattern names to Capacitor Haptics
    switch (pattern) {
      case 'selection':
        Haptics.selectionStart();
        setTimeout(() => Haptics.selectionEnd(), 50);
        break;
      case 'light':
      case 'lightImpact':
        Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
      case 'mediumImpact':
        Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
      case 'heavyImpact':
        Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        Haptics.notification({ type: NotificationType.Error });
        break;
      default:
        // For custom patterns, use the vibrate method
        if (Array.isArray(pattern) || typeof pattern === 'number') {
          if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
          }
        } else {
          Haptics.impact({ style: ImpactStyle.Medium });
        }
    }
  }
};

// Export all services
export {
  isNative,
  getPlatform,
  cameraService,
  locationService,
  deviceService,
  storageService,
  hapticService
};
EOL

  print_success "Created Capacitor service at src/services/CapacitorService.js"
}

# Update HapticFeedback component to use Capacitor
update_haptic_component() {
  print_header "Updating HapticFeedback Component"

  # Create a backup of the original file
  cp src/components/device/HapticFeedback.jsx src/components/device/HapticFeedback.jsx.backup
  print_info "Backed up original HapticFeedback.jsx"

  # Create updated HapticFeedback component
  cat > src/components/device/HapticFeedback.jsx << EOL
import React, { useEffect, useState } from 'react';
import { hapticService, isNative, getPlatform } from '../../services/CapacitorService';

const HapticFeedback = () => {
  // State management remains similar to original
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState('none');
  const [customPattern, setCustomPattern] = useState('100,50,200,50,300');
  const [patternPlaying, setPatternPlaying] = useState(false);
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const [platform, setPlatform] = useState('web');

  // Check for vibration support
  useEffect(() => {
    // Check for native platform
    setIsNativePlatform(isNative());
    setPlatform(getPlatform());

    // Check for web vibration support
    if ('vibrate' in navigator) {
      setVibrationSupported(true);
    } else if (isNative()) {
      // If running on native, Capacitor Haptics is available
      setVibrationSupported(true);
    }
  }, []);

  // Predefined patterns that simulate various native haptic feedback types
  const hapticPatterns = {
    // iOS-inspired patterns
    selection: [10],
    lightImpact: [20],
    mediumImpact: [40],
    heavyImpact: [60],
    success: [40, 30, 100],
    warning: [30, 40, 30, 40],
    error: [60, 50, 100, 30],

    // Android-inspired patterns
    androidLight: [20],
    androidMedium: [50],
    androidHeavy: [80],
    androidClick: [10, 10],
    androidDoubleClick: [10, 100, 10],
    androidTick: [5],
    androidLongPress: [20, 30, 60, 30],

    // UI feedback patterns
    buttonPress: [15],
    toggleSwitch: [10, 20],
    sliderTick: [5],
    keyboardTap: [10],
    scrollStop: [30],
    pullToRefresh: [20, 30, 100],

    // Notification patterns
    notificationGentle: [50, 100, 50],
    notificationImportant: [100, 50, 100, 50, 100],
    messageReceived: [30, 50, 30],
    callIncoming: [100, 200, 100, 200, 100, 200],
    callEnded: [80, 50, 40],

    // Game and interactive patterns
    collision: [80],
    explosion: [100, 50, 150, 50, 200],
    achievement: [30, 50, 100, 50, 30],
    countdownTick: [20],
    countdownFinish: [100, 50, 200],
    lowEnergy: [20, 300, 20, 300, 20],
    healthCritical: [100, 100, 100, 100, 100, 100]
  };

  // Trigger vibration pattern - now using Capacitor service
  const triggerHapticFeedback = (pattern) => {
    if (!vibrationSupported) return;

    setSelectedPattern(pattern);
    setPatternPlaying(true);

    if (pattern === 'custom') {
      const parsedPattern = customPattern.split(',').map(num => parseInt(num.trim(), 10));
      hapticService.vibrate(parsedPattern);
    } else if (pattern === 'stop') {
      // Stop any ongoing vibration - only works with Web API
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    } else {
      // Use the haptic service for predefined patterns
      if (hapticPatterns[pattern]) {
        hapticService.vibrate(pattern);
      }
    }

    // Auto-reset the pattern display after vibration is complete
    const duration = pattern === 'custom'
      ? customPattern.split(',').reduce((sum, num) => sum + parseInt(num.trim(), 10), 0) + 500
      : hapticPatterns[pattern] ? hapticPatterns[pattern].reduce((sum, num) => sum + num, 0) + 500 : 0;

    setTimeout(() => {
      setPatternPlaying(false);
    }, duration);
  };

  return (
    <div>
      <h2>Haptic Feedback Capabilities</h2>
      <p>
        Haptic feedback provides tactile responses to user interactions, enhancing the user experience.
        {isNativePlatform ?
          ' This demo is running on a native platform with Capacitor, providing enhanced haptic feedback.' :
          ' Web browsers offer basic vibration capabilities, while native apps provide fine-tuned haptic patterns.'}
      </p>

      <div className="card">
        <div className="card-header">
          <h3>Device Vibration Status</h3>
        </div>

        {vibrationSupported ? (
          <div style={{
            backgroundColor: '#f6ffed',
            borderRadius: '8px',
            padding: '15px',
            borderLeft: '4px solid #52c41a',
            marginBottom: '15px'
          }}>
            <p style={{ margin: 0 }}>✓ Your device supports vibration/haptics</p>
            {isNativePlatform && (
              <p style={{ margin: '5px 0 0 0', color: '#52c41a' }}>
                Enhanced haptics available via Capacitor on {platform}
              </p>
            )}
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#555' }}>
              Try the patterns below to experience different haptic feedback types
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff2f0',
            borderRadius: '8px',
            padding: '15px',
            borderLeft: '4px solid #f5222d',
            marginBottom: '15px'
          }}>
            <p style={{ margin: 0 }}>✗ Your device does not support vibration</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#555' }}>
              The Vibration API is not supported in this browser or requires a secure context (HTTPS).
              Mobile devices typically offer better support than desktops.
            </p>
          </div>
        )}

        {/* Rest of the component remains similar to original */}
        {vibrationSupported && (
          <div className="current-pattern" style={{
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: patternPlaying ? '#e6f7ff' : '#f0f0f0',
            padding: '15px',
            textAlign: 'center',
            transition: 'background-color 0.3s',
            border: patternPlaying ? '1px solid #1890ff' : '1px solid #d9d9d9'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>
              {patternPlaying ? 'Playing Pattern: ' : 'Selected Pattern: '}
              <span style={{ fontWeight: 'bold', color: patternPlaying ? '#1890ff' : '#666' }}>
                {selectedPattern === 'none' ? 'None' :
                 selectedPattern === 'custom' ? 'Custom Pattern' :
                 selectedPattern}
              </span>
            </h4>
            {selectedPattern !== 'none' && patternPlaying && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px'
              }}>
                {(selectedPattern === 'custom' ?
                  customPattern.split(',') :
                  hapticPatterns[selectedPattern] || []
                ).map((duration, index) => (
                  <div key={index} style={{
                    width: typeof duration === 'string' ? `${Math.min(parseInt(duration.trim(), 10) / 5, 50)}px` : `${Math.min(duration / 5, 50)}px`,
                    height: '20px',
                    backgroundColor: index % 2 === 0 ? '#1890ff' : '#f0f0f0',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}></div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="haptic-categories">
          {/* Categories and buttons remain the same */}
          {/* Only include iOS-inspired patterns example for brevity */}
          <div className="card" style={{ marginBottom: '15px' }}>
            <div className="card-header">
              <h3>iOS-Inspired Haptic Patterns</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
              <button onClick={() => triggerHapticFeedback('selection')}>Selection</button>
              <button onClick={() => triggerHapticFeedback('lightImpact')}>Light Impact</button>
              <button onClick={() => triggerHapticFeedback('mediumImpact')}>Medium Impact</button>
              <button onClick={() => triggerHapticFeedback('heavyImpact')}>Heavy Impact</button>
              <button onClick={() => triggerHapticFeedback('success')}>Success</button>
              <button onClick={() => triggerHapticFeedback('warning')}>Warning</button>
              <button onClick={() => triggerHapticFeedback('error')}>Error</button>
            </div>
            <p>
              iOS provides a refined haptic engine with precise feedback types.
              {isNativePlatform && platform === 'ios' ?
                ' Capacitor provides direct access to these native haptics.' :
                ' Web can only approximate these experiences.'}
            </p>
          </div>

          {/* Custom pattern section */}
          <div className="card" style={{ marginBottom: '15px' }}>
            <div className="card-header">
              <h3>Custom Vibration Pattern</h3>
            </div>
            <div style={{ margin: '15px 0' }}>
              <p>Create a custom pattern using comma-separated durations in milliseconds:</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                  }}
                  placeholder="Format: vibration,pause,vibration,..."
                />
                <button onClick={() => triggerHapticFeedback('custom')}>Test Pattern</button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Example: "100,50,200" means vibrate for 100ms, pause for 50ms, then vibrate for 200ms
              </p>
            </div>
          </div>
        </div>

        {vibrationSupported && (
          <button
            onClick={() => triggerHapticFeedback('stop')}
            style={{
              backgroundColor: '#f5222d',
              marginTop: '10px',
              display: 'block',
              width: '100%'
            }}
          >
            Stop All Vibrations
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Web vs Native Haptic Feedback</h3>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>React.js Web</th>
              <th>Capacitor</th>
              <th>React Native</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API Access</td>
              <td>Web Vibration API only</td>
              <td>Native Haptic APIs with web fallback</td>
              <td>Native Haptic APIs (iOS, Android)</td>
            </tr>
            <tr>
              <td>Pattern Types</td>
              <td>Basic timing patterns</td>
              <td>Complex patterns on native, timing on web</td>
              <td>Complex patterns with intensity control</td>
            </tr>
            <tr>
              <td>Device Support</td>
              <td>Limited browser support</td>
              <td>Full support on native, fallback on web</td>
              <td>Full support on compatible devices</td>
            </tr>
            <tr>
              <td>iOS Support</td>
              <td>Poor (limited Safari support)</td>
              <td>Excellent (using UIFeedbackGenerator)</td>
              <td>Excellent (using UIFeedbackGenerator)</td>
            </tr>
            <tr>
              <td>Precision</td>
              <td>Low (timing can be inconsistent)</td>
              <td>High on native, low on web</td>
              <td>High (native precision)</td>
            </tr>
            <tr>
              <td>Development</td>
              <td>Simple web development</td>
              <td>Web + native bridge</td>
              <td>Pure native development</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HapticFeedback;
EOL

  print_success "Updated HapticFeedback component with Capacitor integration"
}

# Create build script for Capacitor
create_build_script() {
  print_header "Creating Build Script"

  cat > build-capacitor.sh << EOL
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
EOL

  # Make the script executable
  chmod +x build-capacitor.sh
  print_success "Created build-capacitor.sh script"
}

# Update package.json with Capacitor scripts
update_package_json() {
  print_header "Updating package.json"

  # Create a backup of the original file
  cp package.json package.json.backup
  print_info "Backed up original package.json"

  # Update package.json with jq if available
  if command_exists jq; then
    jq '.scripts += {
      "capacitor:add:android": "cap add android",
      "capacitor:add:ios": "cap add ios",
      "capacitor:build": "vite build && cap copy",
      "capacitor:sync": "cap sync",
      "capacitor:open:android": "cap open android",
      "capacitor:open:ios": "cap open ios",
      "capacitor:serve": "vite build && cap copy && cap serve"
    }' package.json > package.json.new
    mv package.json.new package.json
    print_success "Updated package.json with Capacitor scripts using jq"
  else
    print_info "jq not found, adding scripts manually..."
    # For simplicity in a script, we'll just inform the user
    echo '{
  "name": "react-native-features-comparison",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "capacitor:add:android": "cap add android",
    "capacitor:add:ios": "cap add ios",
    "capacitor:build": "vite build && cap copy",
    "capacitor:sync": "cap sync",
    "capacitor:open:android": "cap open android",
    "capacitor:open:ios": "cap open ios",
    "capacitor:serve": "vite build && cap copy && cap serve"
  }
}' > package.json.example
    print_info "Created package.json.example with Capacitor scripts"
    print_info "Please manually merge these scripts into your package.json"
  fi
}

# Create a README section about Capacitor
create_readme_addition() {
  print_header "Adding Capacitor Documentation"

  cat > CAPACITOR.md << EOL
# Capacitor Integration

This project has been enhanced with [Capacitor](https://capacitorjs.com/) to bridge the gap between web and native platform capabilities.

## What is Capacitor?

Capacitor is a cross-platform native runtime that makes it easy to build web apps that run natively on iOS, Android, and the web. Capacitor provides a consistent, web-focused set of APIs that enable a web app to access native device features without requiring platform-specific native code.

## Benefits Over Pure Web

Capacitor provides several advantages over pure web applications:

1. **Native API Access**: Direct access to device APIs like Camera, Geolocation, and Haptic Feedback
2. **Enhanced Performance**: Better animation performance through native UI components
3. **Offline Capability**: Improved offline storage capabilities
4. **App Store Distribution**: Package your web app as a native app for distribution through app stores
5. **Single Codebase**: Maintain one codebase that works across web and native platforms

## Benefits Compared to React Native

Compared to React Native, Capacitor offers:

1. **Web-First Development**: Use standard web technologies (HTML, CSS, JS) rather than platform-specific components
2. **Progressive Enhancement**: Start with a web app and gradually add native features
3. **Easier Web Compatibility**: Your app works on the web without additional work
4. **Simpler Learning Curve**: Web developers can leverage existing skills

## Available Capacitor Plugins

This project uses the following Capacitor plugins:

- **@capacitor/camera**: Native camera access
- **@capacitor/geolocation**: Device location services
- **@capacitor/device**: Device information
- **@capacitor/storage**: Native storage capabilities
- **@capacitor/haptics**: Native haptic feedback

## Building for Native Platforms

To build and run this project on native platforms:

### Android

```bash
# Build the web app and sync with Capacitor
npm run capacitor:build

# Open in Android Studio
npm run capacitor:open:android

# From Android Studio, click the Run button to build and run on a device or emulator
```

### iOS

```bash
# Build the web app and sync with Capacitor
npm run capacitor:build

# Open in Xcode
npm run capacitor:open:ios

# From Xcode, click the Run button to build and run on a device or simulator
```

## Development Workflow

1. Develop your app as usual using React and web technologies
2. Use the Capacitor service (`src/services/CapacitorService.js`) to access native functionality
3. The app will use native APIs when running on a native platform and gracefully fall back to web APIs when running in a browser

## When to Choose Capacitor vs React Native

- **Choose Capacitor** when you want to start with a web app and gradually add native features, or when your team is primarily web-focused
- **Choose React Native** when you need the best possible native performance and deep integration with native UI components

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/apis)
- [Community Plugins](https://capacitorjs.com/community/plugins)
EOL

  print_success "Created CAPACITOR.md documentation"
}

# Entry point to the script
main() {
  echo -e "${BLUE}==================================================${NC}"
  echo -e "${BLUE}      Capacitor Setup for React Features Demo      ${NC}"
  echo -e "${BLUE}==================================================${NC}"

  # Check if running from the correct directory
  if [ ! -f "package.json" ]; then
    print_error "Error: Cannot find package.json. Please run this script from the project root directory."
    exit 1
  fi

  # Run the installation and setup steps
  check_prerequisites
  install_capacitor
  create_capacitor_config
  update_vite_config
  create_capacitor_service
  update_haptic_component
  create_build_script
  update_package_json
  create_readme_addition

  # Final instructions
  print_header "Setup Complete!"
  echo -e "${GREEN}Capacitor has been successfully integrated into your project.${NC}"
  echo -e "Next steps:"
  echo -e "1. Review the changes made to your project files"
  echo -e "2. Run '${YELLOW}npm install${NC}' to install the new dependencies"
  echo -e "3. Run '${YELLOW}npm run build${NC}' to build your web app"
  echo -e "4. Run '${YELLOW}npx cap add android${NC}' to add Android platform"
  echo -e "5. Run '${YELLOW}npx cap add ios${NC}' to add iOS platform"
  echo -e "6. Run '${YELLOW}./build-capacitor.sh${NC}' to build for native platforms"
  echo -e "7. Read ${YELLOW}CAPACITOR.md${NC} for more information on using Capacitor"
  echo
  echo -e "${BLUE}Happy coding with Capacitor!${NC}"
}

# Run the main function
main
