// Capacitor service for integrating native functionality
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

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

// Motion services
const motionService = {
  addOrientationListener(callback) {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', callback);
      return true;
    }
    return false;
  },

  removeOrientationListener(callback) {
    window.removeEventListener('deviceorientation', callback);
  },

  requestPermissions() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      return DeviceOrientationEvent.requestPermission();
    }
    return Promise.resolve('granted'); // Auto-granted on Android/other platforms
  }
};

// Geolocation services
const locationService = {
  async requestPermissions() {
    if (!isNative()) return true;
    return await Geolocation.requestPermissions();
  },

  async checkPermissions() {
    if (!isNative()) return { location: 'granted' };
    return Geolocation.checkPermissions();
  },

  async getCurrentPosition() {
    if (!isNative()) return null;

    try {
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
    } catch (error) {
      console.error('Error getting location', error);
      throw error;
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
// Updated hapticService in CapacitorService.js
const hapticService = {
  vibrate: function(patternOrName) {
    if (!isNative()) {
      // Web fallback
      if ('vibrate' in navigator) {
        navigator.vibrate(patternOrName);
      }
      return;
    }

    try {
      // For string pattern names
      if (typeof patternOrName === 'string') {
        switch (patternOrName) {
        case 'selection':
          Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'lightImpact':
        case 'light':
          Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'mediumImpact':
        case 'medium':
          Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavyImpact':
        case 'heavy':
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
        case 'custom':
          // For custom patterns, attempt a sequence of impacts
          this._playCustomPattern();
          break;
        default:
          // For other named patterns from the original component
          this._playPatternFallback(pattern);
      }
          }else if (Array.isArray(patternOrName)) {
        // Simple fallback for array patterns
        Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch (error) {
      console.error('Haptic error:', error);
    }
  },

  _playCustomPattern() {
    // Play a sequence of different haptics to simulate custom pattern
    Haptics.impact({ style: ImpactStyle.Light });
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Medium }), 100);
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 250);
  },

  _playPatternFallback(patternName) {
    // Map additional pattern names to sequences of haptic feedback
    const hapticSequences = {
      'androidClick': () => Haptics.impact({ style: ImpactStyle.Light }),
      'buttonPress': () => Haptics.impact({ style: ImpactStyle.Light }),
      'toggleSwitch': () => Haptics.impact({ style: ImpactStyle.Light }),
      'notificationGentle': () => Haptics.notification({ type: NotificationType.Success }),
      'notificationImportant': () => Haptics.notification({ type: NotificationType.Warning }),
      // Add mappings for all remaining patterns
    };

    if (hapticSequences[patternName]) {
      hapticSequences[patternName]();
    } else {
      // Default fallback
      Haptics.impact({ style: ImpactStyle.Medium });
    }
  }
};

// Export all services
export {
  cameraService, deviceService, getPlatform, hapticService, isNative, locationService, motionService, storageService
};

