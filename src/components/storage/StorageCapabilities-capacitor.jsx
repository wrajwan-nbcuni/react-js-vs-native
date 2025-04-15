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
