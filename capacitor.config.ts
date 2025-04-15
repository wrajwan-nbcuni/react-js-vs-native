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
