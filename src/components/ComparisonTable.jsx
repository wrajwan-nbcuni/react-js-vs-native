import React, { useState } from 'react';

const ComparisonTable = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const features = [
    {
      category: 'UI & Animations',
      id: 'ui',
      items: [
        {
          name: 'Animations',
          web: {
            support: 'Good',
            details: 'CSS, Web Animations API, JS libraries'
          },
          capacitor: {
            support: 'Good',
            details: 'Plugins for native animations'
          },
          native: {
            support: 'Excellent',
            details: 'Native drivers, hardware acceleration'
          },
          examples: {
            web: 'react-spring, framer-motion, GSAP',
            capacitor: '@capacitor/motion',
            native: 'Animated API, React Native Reanimated'
          }
        },
        {
          name: 'Gestures',
          web: {
            support: 'Good',
            details: 'Touch events, pointer events, gesture libraries'
          },
          capacitor: {
            support: 'Good',
            details: 'Plugins or web APIs'
          },
          native: {
            support: 'Excellent',
            details: 'PanResponder, Gesture Handler, native touch handling'
          },
          examples: {
            web: 'react-use-gesture, react-swipeable, Hammer.js',
            capacitor: 'Potentially similar web libraries or custom plugins',
            native: 'React Native Gesture Handler, PanResponder'
          }
        },
        {
          name: '60fps Animations',
          web: {
            support: 'Moderate',
            details: 'Possible with optimizations'
          },
          capacitor: {
            support: 'Good',
            details: 'Leverages native capabilities'
          },
          native: {
            support: 'Good',
            details: 'Easier to achieve with native drivers'
          },
          examples: {
            web: 'requestAnimationFrame, CSS transforms, will-change',
            capacitor: 'Underlying native APIs',
            native: 'useNativeDriver: true, Reanimated worklets'
          }
        },
        {
          name: 'Custom UI Components',
          web: {
            support: 'Excellent',
            details: 'Full HTML/CSS customization'
          },
          capacitor: {
            support: 'Good',
            details: 'Web technologies with native plugins'
          },
          native: {
            support: 'Good',
            details: 'Native UI components with some limitations'
          },
          examples: {
            web: 'Custom CSS, SVG, Canvas, WebGL',
            capacitor: 'Combination of web and native plugins',
            native: 'Custom native components, UI libraries'
          }
        },
        {
          name: 'Transitions',
          web: {
            support: 'Excellent',
            details: 'CSS transitions, JS libraries'
          },
          capacitor: {
            support: 'Good',
            details: 'Web transitions or native plugins'
          },
          native: {
            support: 'Good',
            details: 'LayoutAnimation, custom transitions'
          },
          examples: {
            web: 'CSS transitions, FLIP animations, react-transition-group',
            capacitor: 'Potentially similar web libraries or native transition plugins',
            native: 'LayoutAnimation, Shared Element Transitions'
          }
        }
      ]
    },
    {
      category: 'Device & Hardware',
      id: 'device',
      items: [
        {
          name: 'Camera',
          web: {
            support: 'Limited',
            details: 'getUserMedia API, requires permission'
          },
          capacitor: {
            support: 'Excellent',
            details: '@capacitor/camera plugin'
          },
          native: {
            support: 'Excellent',
            details: 'Native camera access, full control'
          },
          examples: {
            web: 'MediaDevices API, react-webcam',
            capacitor: '@capacitor/camera',
            native: 'react-native-camera, Expo Camera'
          }
        },
        {
          name: 'Geolocation',
          web: {
            support: 'Good',
            details: 'Geolocation API, limited background access'
          },
          capacitor: {
            support: 'Excellent',
            details: '@capacitor/geolocation plugin'
          },
          native: {
            support: 'Excellent',
            details: 'Native location services, background tracking'
          },
          examples: {
            web: 'navigator.geolocation, Google Maps API',
            capacitor: '@capacitor/geolocation',
            native: 'react-native-geolocation, Expo Location'
          }
        },
        {
          name: 'Device Sensors',
          web: {
            support: 'Limited',
            details: 'Some sensors accessible, varies by browser'
          },
          capacitor: {
            support: 'Good',
            details: 'Plugins for various sensors'
          },
          native: {
            support: 'Excellent',
            details: 'Full access to all device sensors'
          },
          examples: {
            web: 'DeviceOrientation API, Ambient Light Sensor',
            capacitor: '@capacitor/motion, community plugins',
            native: 'react-native-sensors, Expo Sensors'
          }
        },
        {
          name: 'Push Notifications',
          web: {
            support: 'Limited',
            details: 'Service Worker required, limited features'
          },
          capacitor: {
            support: 'Excellent',
            details: '@capacitor/push-notifications plugin'
          },
          native: {
            support: 'Excellent',
            details: 'Native notifications, rich features'
          },
          examples: {
            web: 'Web Push API, Notification API',
            capacitor: '@capacitor/push-notifications, Firebase SDK',
            native: 'Firebase Cloud Messaging, Apple Push Notification Service'
          }
        },
        {
          name: 'Bluetooth/NFC',
          web: {
            support: 'Poor',
            details: 'Web Bluetooth experimental, no NFC'
          },
          capacitor: {
            support: 'Good',
            details: 'Plugins available'
          },
          native: {
            support: 'Good',
            details: 'Native Bluetooth and NFC APIs'
          },
          examples: {
            web: 'Web Bluetooth API (Chrome only), no NFC',
            capacitor: '@capacitor-community/bluetooth-serial, community NFC plugins',
            native: 'react-native-ble-plx, react-native-nfc-manager'
          }
        },
        {
          name: 'Biometrics',
          web: {
            support: 'Limited',
            details: 'Web Authentication API, limited to authentication'
          },
          capacitor: {
            support: 'Excellent',
            details: '@capacitor/biometrics plugin'
          },
          native: {
            support: 'Excellent',
            details: 'Fingerprint, Face ID, etc.'
          },
          examples: {
            web: 'WebAuthn, FIDO2',
            capacitor: '@capacitor/biometrics',
            native: 'react-native-biometrics, Expo LocalAuthentication'
          }
        }
      ]
    },
    {
      category: 'Storage & Offline',
      id: 'storage',
      items: [
        {
          name: 'Persistent Storage',
          web: {
            support: 'Good',
            details: 'IndexedDB, localStorage, size limits apply'
          },
          capacitor: {
            support: 'Good',
            details: '@capacitor/storage, SQLite plugin'
          },
          native: {
            support: 'Excellent',
            details: 'AsyncStorage, SQLite, Realm, FileSystem'
          },
          examples: {
            web: 'localforage, PouchDB, Dexie.js',
            capacitor: '@capacitor/storage, @capacitor-community/sqlite',
            native: 'react-native-mmkv, WatermelonDB, Realm'
          }
        },
        {
          name: 'Offline Functionality',
          web: {
            support: 'Moderate',
            details: 'Service Workers, requires setup'
          },
          capacitor: {
            support: 'Good',
            details: 'Service Workers, native storage'
          },
          native: {
            support: 'Excellent',
            details: 'Built-in offline capability'
          },
          examples: {
            web: 'Workbox, offline-plugin',
            capacitor: 'Workbox, @capacitor/storage',
            native: 'Redux Persist, Realm synchronization'
          }
        },
        {
          name: 'Background Sync',
          web: {
            support: 'Limited',
            details: 'Background Sync API, limited browser support'
          },
          capacitor: {
            support: 'Limited',
            details: 'Needs specific plugins or workarounds'
          },
          native: {
            support: 'Good',
            details: 'Native background tasks'
          },
          examples: {
            web: 'Background Sync API, Periodic Sync API',
            capacitor: 'Needs community plugins or custom native code',
            native: 'react-native-background-fetch, BackgroundTasks API'
          }
        },
        {
          name: 'Secure Storage',
          web: {
            support: 'Poor',
            details: 'Limited options, browser storage is insecure'
          },
          capacitor: {
            support: 'Good',
            details: '@capacitor-community/secure-storage'
          },
          native: {
            support: 'Good',
            details: 'Keychain/KeyStore, encrypted storage'
          },
          examples: {
            web: 'Web Crypto API, encrypted IndexedDB',
            capacitor: '@capacitor-community/secure-storage',
            native: 'react-native-keychain, Expo SecureStore'
          }
        }
      ]
    },
    {
      category: 'User Experience',
      id: 'ux',
      items: [
        {
          name: 'Installation',
          web: {
            support: 'Good',
            details: 'PWA install option, no app store'
          },
          capacitor: {
            support: 'Moderate',
            details: 'App store process'
          },
          native: {
            support: 'Moderate',
            details: 'App store process, user must install'
          },
          examples: {
            web: 'Web App Manifest, BeforeInstallPrompt event',
            capacitor: 'App Store / Play Store distribution',
            native: 'App Store / Play Store distribution'
          }
        },
        {
          name: 'Updates',
          web: {
            support: 'Excellent',
            details: 'Instant updates, no app store review'
          },
          capacitor: {
            support: 'Moderate',
            details: 'App store approval, but can use code push'
          },
          native: {
            support: 'Moderate',
            details: 'App store approval, user must update'
          },
          examples: {
            web: 'Server-side deployment, PWA cache updates',
            capacitor: 'CodePush, app store updates',
            native: 'CodePush, Expo Updates, app store updates'
          }
        },
        {
          name: 'Performance',
          web: {
            support: 'Moderate',
            details: 'Depends on browser and device'
          },
          capacitor: {
            support: 'Good',
            details: 'Leverages native performance'
          },
          native: {
            support: 'Good',
            details: 'Better performance, especially on low-end devices'
          },
          examples: {
            web: 'Code splitting, lazy loading, web optimizations',
            capacitor: 'Native rendering, web optimizations',
            native: 'Native performance, optimized rendering'
          }
        },
        {
          name: 'Offline UX',
          web: {
            support: 'Moderate',
            details: 'Requires careful implementation'
          },
          capacitor: {
            support: 'Good',
            details: 'Leverages native storage and web capabilities'
          },
          native: {
            support: 'Good',
            details: 'Better offline experience'
          },
          examples: {
            web: 'Service worker caching, offline-first design',
            capacitor: 'Service workers, native storage strategies',
            native: 'Built-in offline capabilities, sync strategies'
          }
        },
        {
          name: 'Platform Integration',
          web: {
            support: 'Limited',
            details: 'Some integration via PWA and Web APIs'
          },
          capacitor: {
            support: 'Good',
            details: 'Plugins for native features'
          },
          native: {
            support: 'Excellent',
            details: 'Deep integration with platform features'
          },
          examples: {
            web: 'Share API, Contact Picker API',
            capacitor: '@capacitor/app, @capacitor/share, community plugins',
            native: 'Deep linking, app shortcuts, widgets'
          }
        }
      ]
    },
    {
      category: 'Development Experience',
      id: 'dev',
      items: [
        {
          name: 'Developer Tools',
          web: {
            support: 'Excellent',
            details: 'Mature browser dev tools'
          },
          capacitor: {
            support: 'Good',
            details: 'Browser dev tools, native debugging'
          },
          native: {
            support: 'Good',
            details: 'React Native tools, platform-specific debuggers'
          },
          examples: {
            web: 'Chrome DevTools, Firefox Developer Tools',
            capacitor: 'Chrome DevTools, Xcode/Android Studio',
            native: 'React Native Debugger, Flipper'
          }
        },
        {
          name: 'Hot Reloading',
          web: {
            support: 'Excellent',
            details: 'Fast refresh in most frameworks'
          },
          capacitor: {
            support: 'Excellent',
            details: 'Live reload for web view'
          },
          native: {
            support: 'Good',
            details: 'Fast refresh, but can be slower than web'
          },
          examples: {
            web: 'Webpack HMR, Vite HMR',
            capacitor: 'Capacitor live reload',
            native: 'React Native Fast Refresh'
          }
        },
        {
          name: 'Testing',
          web: {
            support: 'Excellent',
            details: 'Mature testing ecosystem'
          },
          capacitor: {
            support: 'Good',
            details: 'Web testing frameworks, native testing'
          },
          native: {
            support: 'Good',
            details: 'Growing testing ecosystem, platform complexities'
          },
          examples: {
            web: 'Jest, React Testing Library, Cypress',
            capacitor: 'Jest, Cypress (for web part), native testing tools',
            native: 'Jest, React Native Testing Library, Detox'
          }
        },
        {
          name: 'Deployment',
          web: {
            support: 'Excellent',
            details: 'Simple deployment to web servers'
          },
          capacitor: {
            support: 'Moderate',
            details: 'App store submission process'
          },
          native: {
            support: 'Moderate',
            details: 'App store reviews, versioning challenges'
          },
          examples: {
            web: 'Netlify, Vercel, GitHub Pages',
            capacitor: 'App Store Connect, Google Play Console',
            native: 'App Store Connect, Google Play Console, Expo EAS'
          }
        }
      ]
    }
  ];

  const getSupportColor = (level) => {
    switch (level) {
      case 'Excellent': return '#52c41a';
      case 'Good': return '#1890ff';
      case 'Moderate': return '#faad14';
      case 'Limited': return '#fa8c16';
      case 'Poor': return '#f5222d';
      default: return '#666';
    }
  };

  const filteredFeatures = activeCategory === 'all'
    ? features
    : features.filter(category => category.id === activeCategory);

  return (
    <div>
      <h2>React Native vs React.js vs Capacitor Feature Comparison</h2>
      <p>
        This table provides a side-by-side comparison of features available in React.js for web
        applications, Capacitor for building cross-platform apps, and React Native for mobile apps,
        along with specific examples of libraries and APIs used in each environment.
      </p>

      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            backgroundColor: activeCategory === 'all' ? '#0070f3' : '#f0f0f0',
            color: activeCategory === 'all' ? 'white' : '#333'
          }}
        >
          All Categories
        </button>
        {features.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            style={{
              backgroundColor: activeCategory === category.id ? '#0070f3' : '#f0f0f0',
              color: activeCategory === category.id ? 'white' : '#333'}}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="legend" style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                flexShrink: '0',
                backgroundColor: getSupportColor('Excellent'),
                marginRight: '5px'
              }}></span>
              Excellent
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                flexShrink: '0',
                backgroundColor: getSupportColor('Good'),
                marginRight: '5px'
              }}></span>
              Good
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                flexShrink: '0',
                backgroundColor: getSupportColor('Moderate'),
                marginRight: '5px'
              }}></span>
              Moderate
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                flexShrink: '0',
                backgroundColor: getSupportColor('Limited'),
                marginRight: '5px'
              }}></span>
              Limited
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                flexShrink: '0',
                backgroundColor: getSupportColor('Poor'),
                marginRight: '5px'
              }}></span>
              Poor
            </div>
          </div>

          {filteredFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex} className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h3>{category.category}</h3>
              </div>

              <table className="comparison-table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Feature</th>
                    <th style={{ width: '20%' }}>React.js Web</th>
                    <th style={{ width: '20%' }}>Capacitor</th>
                    <th style={{ width: '20%' }}>React Native</th>
                    <th style={{ width: '20%' }}>Implementation Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            flexShrink: '0',
                            backgroundColor: getSupportColor(item.web.support),
                            marginRight: '8px'
                          }}></span>
                          <span>
                            <strong>{item.web.support}</strong>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {item.web.details}
                            </div>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            flexShrink: '0',
                            backgroundColor: getSupportColor(item.capacitor.support),
                            marginRight: '8px'
                          }}></span>
                          <span>
                            <strong>{item.capacitor.support}</strong>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {item.capacitor.details}
                            </div>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            flexShrink: '0',
                            backgroundColor: getSupportColor(item.native.support),
                            marginRight: '8px'
                          }}></span>
                          <span>
                            <strong>{item.native.support}</strong>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {item.native.details}
                            </div>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Web:</strong> {item.examples.web}
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Capacitor:</strong> {item.examples.capacitor}
                          </div>
                          <div>
                            <strong>Native:</strong> {item.examples.native}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="card">
            <div className="card-header">
              <h3>When to Choose Which Approach</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h4 style={{ marginBottom: '10px', color: '#0070f3' }}>Choose React.js Web When:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>You need to reach users across all devices without installation</li>
                  <li>Fast deployment and updates are critical</li>
                  <li>SEO and web discoverability matter</li>
                  <li>Your app needs deep web integration (URLs, sharing)</li>
                  <li>Hardware access is minimal or non-essential</li>
                  <li>You want to avoid app store approvals and fees</li>
                  <li>Progressive enhancement is important for different browsers/devices</li>
                  <li>You need web-specific features like browser extensions integration</li>
                </ul>
              </div>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h4 style={{ marginBottom: '10px', color: '#388e3c' }}>Choose Capacitor When:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>You want to leverage web technologies (HTML, CSS, JavaScript) for mobile apps</li>
                  <li>You need access to native device features through plugins</li>
                  <li>You prefer a single codebase for web and mobile (with potential platform-specific adjustments)</li>
                  <li>You need flexibility in choosing UI frameworks (React, Angular, Vue, etc.)</li>
                  <li>You want easier web-to-mobile migration for existing web apps</li>
                  <li>You need control over native project configurations</li>
                  <li>You want to use standard web development tools and workflows</li>
                </ul>
              </div>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h4 style={{ marginBottom: '10px', color: '#ff4081' }}>Choose React Native When:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Deep device integration is essential</li>
                  <li>You need the best possible performance</li>
                  <li>Offline functionality is critical</li>
                  <li>Complex animations and interactions are required</li>
                  <li>You need background processing capabilities</li>
                  <li>Secure local storage is needed</li>
                  <li>Access to native hardware features is required</li>
                  <li>You want a fully native look and feel</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Hybrid Approaches</h3>
            </div>
            <div>
              <p>
                Many successful applications use hybrid approaches, combining the strengths of different platforms:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                <li>
                  <strong>React Native Web</strong> - Allows sharing code between React Native and web applications,
                  providing a middle ground with a single codebase.
                </li>
                <li>
                  <strong>Native features in PWAs</strong> - Progressive Web Apps can implement many native-like
                  features while maintaining the benefits of web distribution.
                </li>
                <li>
                  <strong>WebViews in Native apps</strong> - React Native apps can embed web content for specific
                  features that are better implemented as web pages.
                </li>
                <li>
                  <strong>Native Bridges</strong> - Create custom bridges between web applications and native
                  functionality for specific features.
                </li>
                <li>
                  <strong>Capacitor Plugins</strong> - Extend the capabilities of web apps running in Capacitor
                  by building or using community plugins for native functionality.
                </li>
              </ul>

              <div style={{
                backgroundColor: '#e6f7ff',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <h4 style={{ marginBottom: '10px', color: '#1890ff' }}>Consider Your Project Requirements</h4>
                <p>
                  The best choice depends on your specific project requirements, target audience, development
                  resources, and timeline. All three approaches continue to evolve rapidly, with web capabilities
                  expanding and both React Native and Capacitor becoming more powerful and easier to use.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default ComparisonTable;
