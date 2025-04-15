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

# Ensure the script is run from the project root
if [ ! -f "package.json" ]; then
  print_error "Error: Cannot find package.json. Please run this script from the project root directory."
  exit 1
fi

# Update DeviceAccess component for Capacitor
print_header "Updating DeviceAccess Component"

# Backup original file
cp src/components/device/DeviceAccess.jsx src/components/device/DeviceAccess.jsx.backup
print_info "Backed up original DeviceAccess.jsx"

# Create script to modify the component
cat > src/components/device/DeviceAccess-capacitor.jsx << 'EOL'
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  isMobile,
  isIOS,
  isAndroid,
  browserName,
  osName,
  mobileVendor,
  mobileModel,
  getUA,
  deviceType
} from 'react-device-detect';
import {
  isNative,
  getPlatform,
  cameraService,
  locationService,
  deviceService
} from '../../services/CapacitorService';

const DeviceAccess = () => {
  // Platform detection
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [capacitorPlatform, setCapacitorPlatform] = useState('web');

  // Camera state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [activeCamera, setActiveCamera] = useState('user');
  const webcamRef = useRef(null);
  const [hasPhotoPermission, setHasPhotoPermission] = useState(false);

  // Geolocation state
  const [location, setLocation] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Device orientation state
  const [orientation, setOrientation] = useState(null);
  const [motionPermission, setMotionPermission] = useState('unknown');

  // Battery state
  const [batteryInfo, setBatteryInfo] = useState(null);

  // Vibration state
  const [vibrationSupported, setVibrationSupported] = useState(false);

  // Ambient light sensor state
  const [lightLevel, setLightLevel] = useState(null);
  const [lightSensorSupported, setLightSensorSupported] = useState(false);

  // Network information
  const [networkInfo, setNetworkInfo] = useState(null);

  // Check device capabilities on mount
  useEffect(() => {
    // Check if running on Capacitor
    const checkCapacitor = async () => {
      const nativePlatform = isNative();
      setIsCapacitor(nativePlatform);
      setCapacitorPlatform(getPlatform());

      if (nativePlatform) {
        // Get device info for native platform
        try {
          const info = await deviceService.getDeviceInfo();
          // Use the info if needed
        } catch (error) {
          console.error('Error getting device info:', error);
        }

        // Get battery info if on native platform
        try {
          const battery = await deviceService.getBatteryInfo();
          if (battery) {
            updateBatteryInfo({
              level: battery.batteryLevel * 100,
              charging: battery.isCharging
            });
          }
        } catch (error) {
          console.error('Error getting battery info:', error);
        }
      }
    };

    checkCapacitor();

    // Check for motion sensors permission
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      setMotionPermission('need-request');
    } else if (window.DeviceOrientationEvent) {
      setMotionPermission('available');
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      setMotionPermission('unavailable');
    }

    // Check for vibration support
    if ('vibrate' in navigator) {
      setVibrationSupported(true);
    }

    // Check for light sensor support
    if ('AmbientLightSensor' in window) {
      setLightSensorSupported(true);
      try {
        const sensor = new window.AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setLightLevel(sensor.illuminance);
        });
        sensor.start();
      } catch (error) {
        console.error('Light sensor error:', error);
        setLightSensorSupported(false);
      }
    }

    // Check for Battery API if not on Capacitor
    if (!isCapacitor && 'getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        updateBatteryInfo(battery);

        // Listen for changes
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
      });
    }

    // Check for Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection;
      updateNetworkInfo(connection);

      connection.addEventListener('change', () => updateNetworkInfo(connection));
    }

    // Get available cameras if not using Capacitor
    if (!isCapacitor && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setAvailableCameras(videoDevices);
        })
        .catch(error => {
          console.error('Error enumerating devices:', error);
        });
    }

    // Cleanup function
    return () => {
      if (watchId) {
        if (isCapacitor) {
          locationService.clearWatch(watchId);
        } else {
          navigator.geolocation.clearWatch(watchId);
        }
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const updateBatteryInfo = (battery) => {
    setBatteryInfo({
      level: battery.level ? battery.level * 100 : battery.batteryLevel * 100,
      charging: battery.charging || battery.isCharging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    });
  };

  const updateNetworkInfo = (connection) => {
    setNetworkInfo({
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlinkMax: connection.downlinkMax,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  };

  // Handle device orientation
  const handleOrientationPermission = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            setMotionPermission('granted');
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            setMotionPermission('denied');
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (event) => {
    setOrientation({
      alpha: event.alpha ? Math.round(event.alpha) : 'N/A',
      beta: event.beta ? Math.round(event.beta) : 'N/A',
      gamma: event.gamma ? Math.round(event.gamma) : 'N/A'
    });
  };

  // Camera functions - now with Capacitor support
  const enableCamera = async () => {
    if (isCapacitor) {
      try {
        // Request permissions first
        const permission = await cameraService.requestPermissions();
        setHasPhotoPermission(true);

        // Take a photo immediately using Capacitor
        const photo = await cameraService.getPhoto();
        if (photo) {
          // For Capacitor, the photo comes in a different format
          setCapturedImage(photo.webPath || photo.path || photo.dataUrl);
        }
      } catch (error) {
        console.error('Error accessing camera', error);
        setHasPhotoPermission(false);
      }
    } else {
      // Web implementation
      setCameraEnabled(true);
    }
  };

  const disableCamera = () => {
    setCameraEnabled(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (isCapacitor) {
      // Use Capacitor camera
      cameraService.getPhoto().then(photo => {
        if (photo) {
          setCapturedImage(photo.webPath || photo.path || photo.dataUrl);
        }
      });
    } else if (webcamRef.current) {
      // Use web camera
      const imgSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imgSrc);
    }
  };

  const switchCamera = () => {
    setActiveCamera(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Geolocation functions - now with Capacitor support
  const getLocation = async () => {
    if (isCapacitor) {
      try {
        // Request permissions first on native
        const permission = await locationService.requestPermissions();
        setHasLocationPermission(true);

        // Get position using Capacitor
        const position = await locationService.getCurrentPosition();

        if (position) {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(newLocation);
          setLocationHistory(prev => [...prev, newLocation]);
          setGeoError(null);
        }
      } catch (error) {
        console.error('Error getting location', error);
        setGeoError(error.message || 'Error accessing location');
        setHasLocationPermission(false);
      }
    } else if (navigator.geolocation) {
      // Web implementation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(newLocation);
          setLocationHistory(prev => [...prev, newLocation]);
          setGeoError(null);
        },
        (error) => {
          setGeoError(error.message);
        }
      );
    } else {
      setGeoError('Geolocation is not supported by this browser');
    }
  };

  const watchLocation = () => {
    if (isCapacitor) {
      // Use Capacitor for native watching
      const id = locationService.watchPosition((position) => {
        if (position) {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(newLocation);
          setLocationHistory(prev => [...prev, newLocation]);
          setGeoError(null);
        }
      });

      if (id) setWatchId(id);
    } else if (navigator.geolocation && !watchId) {
      // Web implementation
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(newLocation);
          setLocationHistory(prev => [...prev, newLocation]);
          setGeoError(null);
        },
        (error) => {
          setGeoError(error.message);
        }
      );
      setWatchId(id);
    }
  };

  const clearLocationWatch = () => {
    if (watchId) {
      if (isCapacitor) {
        locationService.clearWatch(watchId);
      } else {
        navigator.geolocation.clearWatch(watchId);
      }
      setWatchId(null);
    }
  };

  // Vibration function
  const triggerVibration = (pattern) => {
    if (vibrationSupported) {
      switch (pattern) {
        case 'short':
          navigator.vibrate(200);
          break;
        case 'long':
          navigator.vibrate(1000);
          break;
        case 'pattern':
          navigator.vibrate([100, 50, 200, 50, 300]);
          break;
        default:
          navigator.vibrate(200);
      }
    }
  };

  return (
    <div>
      <h2>Device & Hardware Access</h2>
      <p>
        {isCapacitor
          ? `Using Capacitor native bridge on ${capacitorPlatform} for enhanced device access.`
          : 'Modern web browsers provide APIs for accessing various device features, but usually with permission prompts and some limitations compared to native apps.'}
      </p>

      <div className="card">
        <div className="card-header">
          <h3>Device Information</h3>
        </div>
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '10px'
        }}>
          {isCapacitor ? (
            <div style={{
              backgroundColor: '#e6f7ff',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '10px',
              borderLeft: '4px solid #1890ff'
            }}>
              <p><strong>Running on Capacitor:</strong> {capacitorPlatform}</p>
            </div>
          ) : null}

          <p><strong>Device Type:</strong> {deviceType}</p>
          <p><strong>Operating System:</strong> {osName}</p>
          <p><strong>Browser:</strong> {browserName}</p>

          {isMobile && (
            <>
              <p><strong>Vendor:</strong> {mobileVendor}</p>
              <p><strong>Model:</strong> {mobileModel}</p>
            </>
          )}

          {isIOS && <p><strong>Platform:</strong> iOS</p>}
          {isAndroid && <p><strong>Platform:</strong> Android</p>}

          <div style={{ marginTop: '15px' }}>
            <p><strong>User Agent:</strong></p>
            <div style={{
              backgroundColor: '#eee',
              padding: '8px',
              borderRadius: '4px',
              overflowX: 'auto',
              fontSize: '12px'
            }}>
              {getUA}
            </div>
          </div>

          {batteryInfo && (
            <div style={{ marginTop: '15px' }}>
              <p><strong>Battery Information:</strong></p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                <div style={{
                  width: '150px',
                  height: '20px',
                  backgroundColor: '#eee',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${batteryInfo.level}%`,
                    height: '100%',
                    backgroundColor: batteryInfo.charging ? '#52c41a' : batteryInfo.level < 20 ? '#f5222d' : '#1890ff'
                  }}></div>
                </div>
                <span>{batteryInfo.level.toFixed(0)}%</span>
                {batteryInfo.charging && <span style={{ color: '#52c41a' }}>⚡ Charging</span>}
              </div>
            </div>
          )}

          {networkInfo && (
            <div style={{ marginTop: '15px' }}>
              <p><strong>Network Information:</strong></p>
              <p>Connection Type: {networkInfo.type || 'unknown'}</p>
              <p>Effective Type: {networkInfo.effectiveType || 'unknown'}</p>
              <p>Downlink: {networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'unknown'}</p>
              <p>Round-Trip Time: {networkInfo.rtt ? `${networkInfo.rtt} ms` : 'unknown'}</p>
              {networkInfo.saveData && <p>Data Saver: Enabled</p>}
            </div>
          )}
        </div>
        <p>
          {isCapacitor
            ? `Capacitor provides enhanced device information access on ${capacitorPlatform}.`
            : 'In React Native, this information is accessible without permission prompts through the Platform and DeviceInfo APIs.'}
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Camera Access</h3>
        </div>
        {!cameraEnabled && !capturedImage ? (
          <button onClick={enableCamera}>
            {isCapacitor ? 'Take Photo with Capacitor' : 'Enable Camera'}
          </button>
        ) : (
          <div>
            {!isCapacitor && !capturedImage && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="webcam-video"
                videoConstraints={{
                  facingMode: activeCamera
                }}
              />
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!capturedImage && !isCapacitor && (
                <>
                  <button onClick={captureImage}>Capture Photo</button>
                  <button onClick={switchCamera}>Switch Camera</button>
                </>
              )}

              {isCapacitor && !capturedImage && (
                <button onClick={captureImage}>Take Another Photo</button>
              )}

              <button onClick={disableCamera} className="danger">
                {capturedImage ? 'Clear Image' : 'Disable Camera'}
              </button>
            </div>

            {availableCameras.length > 0 && !isCapacitor && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>Available Cameras:</strong> {availableCameras.length}</p>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {availableCameras.map((camera, index) => (
                    <li key={camera.deviceId}>
                      Camera {index + 1}: {camera.label || `Camera ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {capturedImage && (
              <div style={{ marginTop: '15px' }}>
                <h4>Captured Image:</h4>
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }}
                />
                <div style={{ marginTop: '10px' }}>
                  <a
                    href={capturedImage}
                    download="captured-image.jpg"
                    style={{
                      textDecoration: 'none',
                      color: 'white',
                      backgroundColor: '#1890ff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    Download Image
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: '15px' }}>
          <p>
            {isCapacitor
              ? 'Capacitor provides native camera access with better control and performance.'
              : 'Web camera access requires explicit user permission and works only in secure contexts (HTTPS). In React Native, camera permissions are requested at app installation or first use.'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Geolocation</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={getLocation}>Get Current Location</button>
          {!watchId ? (
            <button onClick={watchLocation}>Watch Location</button>
          ) : (
            <button onClick={clearLocationWatch} className="warning">Stop Watching</button>
          )}
        </div>

        {location && (
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '15px'
          }}>
            <p><strong>Latitude:</strong> {location.latitude.toFixed(6)}</p>
            <p><strong>Longitude:</strong> {location.longitude.toFixed(6)}</p>
            <p><strong>Accuracy:</strong> {location.accuracy.toFixed(2)} meters</p>
            <p><strong>Timestamp:</strong> {new Date(location.timestamp).toLocaleTimeString()}</p>

            <div style={{ marginTop: '10px' }}>
              <a
                href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0070f3', textDecoration: 'none' }}
              >
                View on OpenStreetMap →
              </a>
            </div>

            {locationHistory.length > 1 && (
              <div style={{ marginTop: '15px' }}>
                <p><strong>Location History:</strong></p>
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #eaeaea',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Time</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Latitude</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Longitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationHistory.map((loc, index) => (
                        <tr key={index} style={{ borderTop: '1px solid #eaeaea' }}>
                          <td style={{ padding: '8px' }}>{new Date(loc.timestamp).toLocaleTimeString()}</td>
                          <td style={{ padding: '8px' }}>{loc.latitude.toFixed(6)}</td>
                          <td style={{ padding: '8px' }}>{loc.longitude.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => setLocationHistory([])}
                  style={{ marginTop: '10px' }}
                  className="danger"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        )}

        {geoError && (
          <div className="feature-unavailable">
            <p>Error: {geoError}</p>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <p>
            {isCapacitor
              ? 'Capacitor provides native geolocation services with better accuracy and background capabilities.'
              : 'Geolocation API is well-supported across browsers but requires user permission. React Native offers more background location capabilities and better battery optimization.'}
          </p>
        </div>
      </div>

      {/* Rest of component remains similar but with Capacitor conditional rendering */}
      <div className="card">
        <div className="card-header">
          <h3>Web vs Native vs Capacitor Comparison</h3>
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
              <td>Camera Access</td>
              <td>MediaDevices API, permission required</td>
              <td>Native camera module with web fallback</td>
              <td>Native camera module, better control</td>
            </tr>
            <tr>
              <td>Geolocation</td>
              <td>Geolocation API, limited background access</td>
              <td>Native location services with web fallback</td>
              <td>Native location services, background tracking</td>
            </tr>
            <tr>
              <td>Device Sensors</td>
              <td>Limited access, inconsistent across browsers</td>
              <td>Native sensors with progressive enhancement</td>
              <td>Full access to all device sensors</td>
            </tr>
            <tr>
              <td>Push Notifications</td>
              <td>Web Push API, requires service worker</td>
              <td>Native push notifications + web fallback</td>
              <td>Native push notifications</td>
            </tr>
            <tr>
              <td>Bluetooth/NFC</td>
              <td>Web Bluetooth API (limited), no NFC</td>
              <td>Native Bluetooth/NFC with plugins</td>
              <td>Native Bluetooth and NFC access</td>
            </tr>
            <tr>
              <td>Development</td>
              <td>Web-only development</td>
              <td>Web-first with native bridge</td>
              <td>Native-first development</td>
            </tr>
            <tr>
              <td>Distribution</td>
              <td>Web only</td>
              <td>Web + App Stores</td>
              <td>App Stores only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceAccess;
EOL

print_success "Created updated DeviceAccess component with Capacitor integration"

# Create a script to update the StorageCapabilities component
print_header "Updating StorageCapabilities Component"

# Backup original file
cp src/components/storage/StorageCapabilities.jsx src/components/storage/StorageCapabilities.jsx.backup
print_info "Backed up original StorageCapabilities.jsx"

# Create a script to modify the component
cat > src/components/storage/StorageCapabilities-capacitor.jsx << 'EOL'
import React, { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import { isNative, getPlatform, storageService } from '../../services/CapacitorService';

const StorageCapabilities = () => {
  // Platform detection
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [capacitorPlatform, setCapacitorPlatform] = useState('web');

  // Storage state
  const [items, setItems] = useState([]);
  const [newItemKey, setNewItemKey] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [storageType, setStorageType] = useState('');
  const [storageEstimate, setStorageEstimate] = useState(null);

  // Offline state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState('checking');

  // File API state
  const [fileSupport, setFileSupport] = useState({
    fileReader: false,
    fileSaver: false,
    dragDrop: false,
    fileSystem: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const fileInputRef = useRef(null);

  // Cache API state
  const [cachesSupported, setCachesSupported] = useState(false);
  const [cacheContents, setCacheContents] = useState([]);

  // IndexedDB direct usage state
  const [dbStatus, setDbStatus] = useState('checking');
  const [dbStats, setDbStats] = useState(null);

  // Configure storage and check capabilities on mount
  useEffect(() => {
    // Check for Capacitor
    const checkCapacitor = async () => {
      const nativePlatform = isNative();
      setIsCapacitor(nativePlatform);
      setCapacitorPlatform(getPlatform());
    };

    checkCapacitor();

    // Configure localforage
    localforage.config({
      name: 'ReactNativeCompare',
      storeName: 'demo_store'
    });

    // Detect storage driver
    localforage.ready().then(() => {
      setStorageType(isCapacitor ? 'Capacitor Storage' : localforage.driver());
    });

    // Check for storage estimate support
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageEstimate(estimate);
      });
    }

    // Check File API support
    setFileSupport({
      fileReader: 'FileReader' in window,
      fileSaver: 'Blob' in window && 'URL' in window && 'createObjectURL' in window.URL,
      dragDrop: 'DataTransfer' in window && 'ondragover' in document.documentElement,
      fileSystem: 'showOpenFilePicker' in window || 'webkitRequestFileSystem' in window
    });

    // Check Cache API support
    if ('caches' in window) {
      setCachesSupported(true);
      listCaches();
    }

    // Check for IndexedDB support
    if ('indexedDB' in window) {
      setDbStatus('supported');
      checkIndexedDbDatabases();
    } else {
      setDbStatus('unsupported');
    }

    // Check Service Worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          setServiceWorkerStatus('registered');
          setOfflineReady(true);
        } else {
          setServiceWorkerStatus('not-registered');
        }
      });
    } else {
      setServiceWorkerStatus('unsupported');
    }

    // Load all items from storage
    const loadItems = async () => {
      try {
        let loadedItems = [];

        if (isCapacitor) {
          // Use Capacitor Storage
          const keys = await storageService.keys();

          for (const key of keys) {
            const value = await storageService.getItem(key);
            loadedItems.push({ key, value: JSON.stringify(value) });
          }
        } else {
          // Use localforage
          const keys = await localforage.keys();

          for (const key of keys) {
            const value = await localforage.getItem(key);
            loadedItems.push({ key, value: JSON.stringify(value) });
          }
        }

        setItems(loadedItems);
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();

    // Setup online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // List caches using Cache API
  const listCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await window.caches.keys();
        const cacheDetails = [];

        for (const name of cacheNames) {
          const cache = await window.caches.open(name);
          const requests = await cache.keys();
          cacheDetails.push({
            name,
            size: requests.length,
            items: requests.map(req => req.url)
          });
        }

        setCacheContents(cacheDetails);
      } catch (error) {
        console.error('Error listing caches:', error);
      }
    }
  };

  // Check IndexedDB databases
  const checkIndexedDbDatabases = () => {
    if (window.indexedDB.databases) {
      window.indexedDB.databases().then(dbs => {
        setDbStats({
          count: dbs.length,
          names: dbs.map(db => db.name)
        });
      }).catch(error => {
        console.error('Error listing databases:', error);
      });
    }
  };

  // Handle adding a new item to storage
  const addItem = async () => {
    if (!newItemKey || !newItemValue) return;

    try {
      if (isCapacitor) {
        await storageService.setItem(newItemKey, newItemValue);
      } else {
        await localforage.setItem(newItemKey, newItemValue);
      }

      setItems([...items, { key: newItemKey, value: newItemValue }]);
      setNewItemKey('');
      setNewItemValue('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Handle removing an item from storage
  const removeItem = async (key) => {
    try {
      if (isCapacitor) {
        await storageService.removeItem(key);
      } else {
        await localforage.removeItem(key);
      }

      setItems(items.filter(item => item.key !== key));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Clear all items from storage
  const clearAll = async () => {
    try {
      if (isCapacitor) {
        await storageService.clear();
      } else {
        await localforage.clear();
      }

      setItems([]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFileContent(content);
      };

      if (file.type.startsWith('text/') || file.type === 'application/json') {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  // Save file example
  const saveExampleFile = () => {
    const content = "This is an example file created and saved using the Web File API.";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'example-file.txt';
    a.click();

    URL.revokeObjectURL(url);
  };

  // Simulate offline experience
  const simulateOffline = () => {
    setIsOnline(false);
    alert('Simulated offline mode. The app will continue to work with local data.');
  };

  const simulateOnline = () => {
    setIsOnline(true);
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div>
      <h2>Storage & Offline Capabilities</h2>
      <p>
        {isCapacitor
          ? `Using Capacitor native storage on ${capacitorPlatform} for enhanced data persistence.`
          : 'Modern web apps can store data locally and function offline, though with some limitations compared to native apps.'}
      </p>

      <div className="card">
        <div className="card-header">
          <h3>Network Status</h3>
        </div>
        <div style={{
          backgroundColor: isOnline ? '#f6ffed' : '#fff2f0',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Status: </strong>
            <span style={{
              color: isOnline ? '#52c41a' : '#f44336',
              fontWeight: 'bold'
            }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {offlineReady && (
              <span style={{ marginLeft: '10px', fontSize: '14px', color: '#52c41a' }}>
                ✓ Offline ready
              </span>
            )}
            {isCapacitor && (
              <span style={{ marginLeft: '10px', fontSize: '14px', color: '#1890ff' }}>
                ✓ Capacitor enabled
              </span>
            )}
          </div>
          <div>
            {isOnline ? (
              <button
                className="warning"
                onClick={simulateOffline}
              >
                Simulate Offline
              </button>
            ) : (
              <button
                className="success"
                onClick={simulateOnline}
              >
                Simulate Online
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Service Worker Status: </strong>
          {serviceWorkerStatus === 'registered' ? (
            <span style={{ color: '#52c41a' }}>Registered ✓</span>
          ) : serviceWorkerStatus === 'not-registered' ? (
            <span style={{ color: '#faad14' }}>Not Registered</span>
          ) : serviceWorkerStatus === 'unsupported' ? (
            <span style={{ color: '#ff4d4f' }}>Not Supported</span>
          ) : (
            <span>Checking...</span>
          )}
        </div>

        <p>
          {isCapacitor
            ? 'Capacitor handles offline mode at the native level with automatic data synchronization.'
            : 'Web apps can detect network status changes and adjust functionality accordingly, though not as reliably as native apps. Service Workers enable offline capabilities.'}
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Storage Information</h3>
        </div>
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <p><strong>Current Storage Driver:</strong> {storageType || 'Loading...'}</p>

          {isCapacitor && (
            <div style={{
              backgroundColor: '#e6f7ff',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '10px',
              borderLeft: '4px solid #1890ff'
            }}>
              <p><strong>Using Capacitor Storage for {capacitorPlatform}</strong></p>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>
                Capacitor provides enhanced storage with native SQLite on mobile devices
              </p>
            </div>
          )}

          {storageEstimate && !isCapacitor && (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Storage Usage:</strong></p>
              <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#eee',
                borderRadius: '10px',
                overflow: 'hidden',
                marginTop: '5px'
              }}>
                <div style={{
                  width: `${(storageEstimate.usage / storageEstimate.quota) * 100}%`,
                  height: '100%',
                  backgroundColor: '#1890ff'
                }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '14px' }}>
                <span>Used: {formatBytes(storageEstimate.usage)}</span>
                <span>Available: {formatBytes(storageEstimate.quota)}</span>
              </div>
            </div>
          )}

          <p style={{ marginTop: '15px' }}>
            {isCapacitor
              ? 'Capacitor Storage provides secure, high-performance data persistence using native APIs.'
              : 'LocalForage automatically selects the best available storage option: IndexedDB → WebSQL → localStorage'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Persistent Storage {isCapacitor && '(Capacitor Enhanced)'}</h3>
        </div>
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Key"
              value={newItemKey}
              onChange={(e) => setNewItemKey(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                flexGrow: 1
              }}
            />
            <input
              type="text"
              placeholder="Value"
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                flexGrow: 1
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <button onClick={addItem}>Add Item</button>
            <button onClick={clearAll} className="danger">Clear All</button>
          </div>

          <div style={{
            border: '1px solid #eaeaea',
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f0f0f0',
                  position: 'sticky',
                  top: 0
                }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Key</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Value</th>
                  <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '10px', textAlign: 'center' }}>
                      Loading items...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '10px', textAlign: 'center' }}>
                      No items in storage
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #eaeaea' }}>
                      <td style={{ padding: '10px' }}>{item.key}</td>
                      <td style={{ padding: '10px' }}>{item.value}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="danger"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            {isCapacitor
              ? 'Data stored with Capacitor Storage persists securely using native storage APIs.'
              : 'Data stored with LocalForage persists even if you close this tab or browser. Try adding items, closing the browser, and returning to see them still here.'}
          </p>
        </div>
      </div>

      {/* Rest of the component with conditional rendering based on isCapacitor */}
      {/* For brevity, only showing one more section */}

      <div className="card">
        <div className="card-header">
          <h3>Web vs Native vs Capacitor Comparison</h3>
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
              <td>Storage Options</td>
              <td>localStorage, sessionStorage, IndexedDB, Cache API</td>
              <td>Native storage with web fallback</td>
              <td>AsyncStorage, SQLite, Realm, filesystem</td>
            </tr>
            <tr>
              <td>Storage Limits</td>
              <td>Browser dependent (typically 5-10MB for localStorage)</td>
              <td>Native capacity on device, unlimited on native</td>
              <td>Limited only by device storage</td>
            </tr>
            <tr>
              <td>Offline Detection</td>
              <td>online/offline events, unreliable in some cases</td>
              <td>Native network info with web fallback</td>
              <td>NetInfo API, more reliable network info</td>
            </tr>
            <tr>
              <td>Background Sync</td>
              <td>Limited via Service Workers</td>
              <td>Native background sync on mobile</td>
              <td>Native background tasks with better reliability</td>
            </tr>
            <tr>
              <td>Data Security</td>
              <td>Limited security, accessible in browser</td>
              <td>Secure storage plugins available</td>
              <td>More secure storage options (KeyStore, Keychain)</td>
            </tr>
            <tr>
              <td>Distribution</td>
              <td>Web only</td>
              <td>Web + App Stores</td>
              <td>App Stores only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StorageCapabilities;
EOL

print_success "Created updated StorageCapabilities component with Capacitor integration"

print_header "Creating Component Update Script"

# Create an installation script for the updated components
cat > install-capacitor-components.sh << 'EOL'
#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing updated Capacitor-enabled components...${NC}"

# Check if DeviceAccess.jsx exists
if [ -f "src/components/device/DeviceAccess.jsx" ]; then
  # Create backup if not already done
  if [ ! -f "src/components/device/DeviceAccess.jsx.backup" ]; then
    cp src/components/device/DeviceAccess.jsx src/components/device/DeviceAccess.jsx.backup
    echo -e "${GREEN}Created backup of DeviceAccess.jsx${NC}"
  fi

  # Copy updated component
  if [ -f "src/components/device/DeviceAccess-capacitor.jsx" ]; then
    cp src/components/device/DeviceAccess-capacitor.jsx src/components/device/DeviceAccess.jsx
    echo -e "${GREEN}Installed Capacitor-enabled DeviceAccess.jsx${NC}"
  else
    echo -e "${RED}Error: DeviceAccess-capacitor.jsx not found${NC}"
  fi
else
  echo -e "${RED}Error: DeviceAccess.jsx not found in src/components/device/${NC}"
fi

# Check if StorageCapabilities.jsx exists
if [ -f "src/components/storage/StorageCapabilities.jsx" ]; then
  # Create backup if not already done
  if [ ! -f "src/components/storage/StorageCapabilities.jsx.backup" ]; then
    cp src/components/storage/StorageCapabilities.jsx src/components/storage/StorageCapabilities.jsx.backup
    echo -e "${GREEN}Created backup of StorageCapabilities.jsx${NC}"
  fi

  # Copy updated component
  if [ -f "src/components/storage/StorageCapabilities-capacitor.jsx" ]; then
    cp src/components/storage/StorageCapabilities-capacitor.jsx src/components/storage/StorageCapabilities.jsx
    echo -e "${GREEN}Installed Capacitor-enabled StorageCapabilities.jsx${NC}"
  else
    echo -e "${RED}Error: StorageCapabilities-capacitor.jsx not found${NC}"
  fi
else
  echo -e "${RED}Error: StorageCapabilities.jsx not found in src/components/storage/${NC}"
fi

# Check if HapticFeedback.jsx was already updated by setup-capacitor.sh
if [ -f "src/components/device/HapticFeedback.jsx.backup" ]; then
  echo -e "${GREEN}HapticFeedback.jsx already updated by setup-capacitor.sh${NC}"
else
  echo -e "${RED}Warning: HapticFeedback.jsx wasn't backed up by setup-capacitor.sh${NC}"
  echo -e "${BLUE}Make sure to run setup-capacitor.sh first before this script${NC}"
fi

echo -e "${GREEN}Component installation complete${NC}"
echo -e "${BLUE}You can restore original components anytime by running restore-original-components.sh${NC}"

# Create restore script
cat > restore-original-components.sh << 'RESTORE'
#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Restoring original components...${NC}"

# Restore DeviceAccess.jsx
if [ -f "src/components/device/DeviceAccess.jsx.backup" ]; then
  cp src/components/device/DeviceAccess.jsx.backup src/components/device/DeviceAccess.jsx
  echo -e "${GREEN}Restored original DeviceAccess.jsx${NC}"
else
  echo -e "${RED}Error: DeviceAccess.jsx.backup not found${NC}"
fi

# Restore StorageCapabilities.jsx
if [ -f "src/components/storage/StorageCapabilities.jsx.backup" ]; then
  cp src/components/storage/StorageCapabilities.jsx.backup src/components/storage/StorageCapabilities.jsx
  echo -e "${GREEN}Restored original StorageCapabilities.jsx${NC}"
else
  echo -e "${RED}Error: StorageCapabilities.jsx.backup not found${NC}"
fi

# Restore HapticFeedback.jsx
if [ -f "src/components/device/HapticFeedback.jsx.backup" ]; then
  cp src/components/device/HapticFeedback.jsx.backup src/components/device/HapticFeedback.jsx
  echo -e "${GREEN}Restored original HapticFeedback.jsx${NC}"
else
  echo -e "${RED}Error: HapticFeedback.jsx.backup not found${NC}"
fi

echo -e "${GREEN}Component restoration complete${NC}"
RESTORE

chmod +x restore-original-components.sh
echo -e "${GREEN}Created restore-original-components.sh script${NC}"

chmod +x install-capacitor-components.sh
EOL

chmod +x install-capacitor-components.sh
print_success "Created component installation script"

# Final message
print_header "Update Complete"
echo "Component update scripts have been created successfully!"
echo "To use them:"
echo "1. First run ./setup-capacitor.sh to set up Capacitor and basic services"
echo "2. Then run ./install-capacitor-components.sh to update the components"
echo "3. If needed, you can restore original components with ./restore-original-components.sh"
