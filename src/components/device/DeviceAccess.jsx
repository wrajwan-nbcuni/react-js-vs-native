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

const DeviceAccess = () => {
  // Camera state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [activeCamera, setActiveCamera] = useState('user');
  const webcamRef = useRef(null);

  // Geolocation state
  const [location, setLocation] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

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

    // Check for Battery API
    if ('getBattery' in navigator) {
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

    // Get available cameras
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
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
        navigator.geolocation.clearWatch(watchId);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const updateBatteryInfo = (battery) => {
    setBatteryInfo({
      level: battery.level * 100,
      charging: battery.charging,
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

  // Camera functions
  const enableCamera = () => setCameraEnabled(true);
  const disableCamera = () => {
    setCameraEnabled(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imgSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imgSrc);
    }
  };

  const switchCamera = () => {
    setActiveCamera(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Geolocation functions
  const getLocation = () => {
    if (navigator.geolocation) {
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
    if (navigator.geolocation && !watchId) {
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
      navigator.geolocation.clearWatch(watchId);
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
        Modern web browsers provide APIs for accessing various device features,
        but usually with permission prompts and some limitations compared to native apps.
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
          In React Native, this information is accessible without permission prompts
          through the Platform and DeviceInfo APIs.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Camera Access</h3>
        </div>
        {!cameraEnabled ? (
          <button onClick={enableCamera}>Enable Camera</button>
        ) : (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam-video"
              videoConstraints={{
                facingMode: activeCamera
              }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={captureImage}>Capture Photo</button>
              <button onClick={switchCamera}>Switch Camera</button>
              <button onClick={disableCamera} className="danger">Disable Camera</button>
            </div>

            {availableCameras.length > 0 && (
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
            Web camera access requires explicit user permission and works only in secure contexts (HTTPS).
            In React Native, camera permissions are requested at app installation or first use.
          </p>
          <p>
            Web apps have limited camera control compared to native apps, with fewer options
            for flash, zoom, exposure, and more advanced features.
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
            Geolocation API is well-supported across browsers but requires user permission.
            React Native offers more background location capabilities and better battery optimization.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Device Orientation & Motion</h3>
        </div>

        {motionPermission === 'need-request' && (
          <button onClick={handleOrientationPermission}>
            Request Motion Permission
          </button>
        )}

        {motionPermission === 'granted' || (motionPermission === 'available' && orientation) ? (
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '15px'
          }}>
            <p><strong>Alpha (Z-axis):</strong> {orientation?.alpha}°</p>
            <p><strong>Beta (X-axis):</strong> {orientation?.beta}°</p>
            <p><strong>Gamma (Y-axis):</strong> {orientation?.gamma}°</p>

            <div style={{
              marginTop: '20px',
              width: '100px',
              height: '100px',
              backgroundColor: '#0070f3',
              borderRadius: '8px',
              transform: orientation ?
                `rotateZ(${orientation.alpha}deg) rotateX(${orientation.beta}deg) rotateY(${orientation.gamma}deg)` :
                'none',
              transition: 'transform 0.1s ease',
              margin: '0 auto'
            }}></div>
          </div>
        ) : (
          motionPermission === 'denied' ? (
            <div className="feature-unavailable">
              <p>Motion sensor access denied.</p>
            </div>
          ) : motionPermission === 'unavailable' ? (
            <div className="feature-unavailable">
              <p>Device motion and orientation sensors not available.</p>
            </div>
          ) : <p>Waiting for sensor data...</p>
        )}

        <div style={{ marginTop: '15px' }}>
          <p>
            Modern devices have various motion sensors, but web access is limited and
            iOS requires explicit permission. React Native provides more consistent
            sensor access with better performance.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Vibration</h3>
        </div>

        {vibrationSupported ? (
          <div>
            <p>Your device supports vibration. Try different patterns:</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => triggerVibration('short')}>Short Vibration</button>
              <button onClick={() => triggerVibration('long')}>Long Vibration</button>
              <button onClick={() => triggerVibration('pattern')}>Pattern Vibration</button>
            </div>
          </div>
        ) : (
          <div className="feature-unavailable">
            <p>Vibration is not supported on this device or browser.</p>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <p>
            The Web Vibration API allows basic haptic feedback, but with less control than
            native apps. Not all browsers support this API, particularly on desktop.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Ambient Light Sensor</h3>
        </div>

        {lightSensorSupported ? (
          <div>
            <p>Current ambient light level: {lightLevel !== null ? `${lightLevel} lux` : 'Reading sensor...'}</p>

            {lightLevel !== null && (
              <div style={{
                marginTop: '15px',
                padding: '20px',
                backgroundColor: lightLevel < 50 ? '#333' : lightLevel < 200 ? '#555' : '#f0f0f0',
                color: lightLevel < 200 ? '#fff' : '#000',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {lightLevel < 50 ? 'Dark environment detected!' :
                  lightLevel < 200 ? 'Dim environment detected!' :
                  lightLevel < 1000 ? 'Average indoor lighting detected!' :
                  'Bright environment detected!'}
              </div>
            )}
          </div>
        ) : (
          <div className="feature-unavailable">
            <p>Ambient Light Sensor is not supported on this device or browser.</p>
            <p>This is an experimental API with limited support, while React Native can access this sensor on compatible devices.</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Web vs Native Comparison</h3>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>React.js Web</th>
              <th>React Native</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Camera Access</td>
              <td>MediaDevices API, permission required</td>
              <td>Native camera module, better control</td>
            </tr>
            <tr>
              <td>Geolocation</td>
              <td>Geolocation API, limited background access</td>
              <td>Native location services, background tracking</td>
            </tr>
            <tr>
              <td>Device Sensors</td>
              <td>Limited access, inconsistent across browsers</td>
              <td>Full access to all device sensors</td>
            </tr>
            <tr>
              <td>Push Notifications</td>
              <td>Web Push API, requires service worker</td>
              <td>Native push notifications</td>
            </tr>
            <tr>
              <td>Bluetooth/NFC</td>
              <td>Web Bluetooth API (limited), no NFC</td>
              <td>Native Bluetooth and NFC access</td>
            </tr>
            <tr>
              <td>File System</td>
              <td>Limited access via File API</td>
              <td>Full file system access</td>
            </tr>
            <tr>
              <td>Background Processing</td>
              <td>Limited via Service Workers</td>
              <td>Native background processes</td>
            </tr>
            <tr>
              <td>Haptic Feedback</td>
              <td>Basic vibration API</td>
              <td>Advanced haptic patterns</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceAccess;
