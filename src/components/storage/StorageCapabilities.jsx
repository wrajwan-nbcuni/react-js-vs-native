import React, { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';

const StorageCapabilities = () => {
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

  // Configure localforage and check capabilities on mount
  useEffect(() => {
    // Configure localforage
    localforage.config({
      name: 'ReactNativeCompare',
      storeName: 'demo_store'
    });

    // Detect storage driver
    localforage.ready().then(() => {
      setStorageType(localforage.driver());
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

    // Load all items from localforage
    const loadItems = async () => {
      try {
        const keys = await localforage.keys();
        const loadedItems = [];

        for (const key of keys) {
          const value = await localforage.getItem(key);
          loadedItems.push({ key, value: JSON.stringify(value) });
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

  // Handle adding a new item to localforage
  const addItem = async () => {
    if (!newItemKey || !newItemValue) return;

    try {
      await localforage.setItem(newItemKey, newItemValue);
      setItems([...items, { key: newItemKey, value: newItemValue }]);
      setNewItemKey('');
      setNewItemValue('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Handle removing an item from localforage
  const removeItem = async (key) => {
    try {
      await localforage.removeItem(key);
      setItems(items.filter(item => item.key !== key));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Clear all items from localforage
  const clearAll = async () => {
    try {
      await localforage.clear();
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
        Modern web apps can store data locally and function offline, though with
        some limitations compared to native apps.
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
          Web apps can detect network status changes and adjust functionality accordingly,
          though not as reliably as native apps. Service Workers enable offline capabilities.
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

          {storageEstimate && (
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
            LocalForage automatically selects the best available storage option:
            IndexedDB → WebSQL → localStorage
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Persistent Storage (localforage)</h3>
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
            Data stored with LocalForage persists even if you close this tab or browser.
            Try adding items, closing the browser, and returning to see them still here.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>File API</h3>
        </div>
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <p><strong>File API Support:</strong></p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li>
                <span style={{ color: fileSupport.fileReader ? '#52c41a' : '#f5222d', marginRight: '8px' }}>
                  {fileSupport.fileReader ? '✓' : '✗'}
                </span>
                FileReader API
              </li>
              <li>
                <span style={{ color: fileSupport.fileSaver ? '#52c41a' : '#f5222d', marginRight: '8px' }}>
                  {fileSupport.fileSaver ? '✓' : '✗'}
                </span>
                File Saving (Blob & URL API)
              </li>
              <li>
                <span style={{ color: fileSupport.dragDrop ? '#52c41a' : '#f5222d', marginRight: '8px' }}>
                  {fileSupport.dragDrop ? '✓' : '✗'}
                </span>
                Drag & Drop Files
              </li>
              <li>
                <span style={{ color: fileSupport.fileSystem ? '#52c41a' : '#f5222d', marginRight: '8px' }}>
                  {fileSupport.fileSystem ? '✓' : '✗'}
                </span>
                File System Access API
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Read a file:</strong></p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current.click()}>
              Select File
            </button>

            {selectedFile && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>Selected File:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {formatBytes(selectedFile.size)}</p>
                <p><strong>Type:</strong> {selectedFile.type || 'unknown'}</p>

                {fileContent && selectedFile.type.startsWith('text/') && (
                  <div style={{
                    marginTop: '10px',
                    maxHeight: '150px',
                    overflow: 'auto',
                    backgroundColor: '#fff',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #eaeaea',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {fileContent}
                  </div>
                )}

                {fileContent && selectedFile.type.startsWith('image/') && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={fileContent}
                      alt={selectedFile.name}
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <p><strong>Write a file:</strong></p>
            <button onClick={saveExampleFile}>
              Save Example Text File
            </button>
          </div>
        </div>

        <p style={{ marginTop: '15px' }}>
          Web apps have limited file system access compared to native apps.
          React Native has full access to the device's file system for reading and writing files.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Cache API & Service Workers</h3>
        </div>
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px'
        }}>
          {cachesSupported ? (
            <div>
              <p><strong>Cache API is supported!</strong></p>

              {cacheContents.length > 0 ? (
                <div style={{ marginTop: '10px' }}>
                  <p>Found {cacheContents.length} cache(s):</p>
                  <div style={{
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid #eaeaea',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    {cacheContents.map((cache, index) => (
                      <div key={index} style={{
                        padding: '10px',
                        borderBottom: index < cacheContents.length - 1 ? '1px solid #eaeaea' : 'none'
                      }}>
                        <strong>{cache.name}</strong> ({cache.size} items)
                        <ul style={{
                          fontSize: '12px',
                          marginTop: '5px',
                          maxHeight: '100px',
                          overflow: 'auto'
                        }}>
                          {cache.items.slice(0, 5).map((url, i) => (
                            <li key={i}>{url}</li>
                          ))}
                          {cache.items.length > 5 && <li>... and {cache.items.length - 5} more</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No caches found.</p>
              )}
            </div>
          ) : (
            <div className="feature-unavailable">
              <p>Cache API is not supported in this browser.</p>
            </div>
          )}

          <div style={{ marginTop: '15px' }}>
            <p><strong>IndexedDB Status:</strong> {dbStatus}</p>
            {dbStats && (
              <div>
                <p>Found {dbStats.count} database(s):</p>
                <ul style={{ marginLeft: '20px' }}>
                  {dbStats.names.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p style={{ marginTop: '15px' }}>
          Service Workers and the Cache API enable web apps to control network requests and
          responses, allowing for sophisticated offline strategies. React Native handles
          offline mode at the native level with more direct control.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Offline Demo</h3>
        </div>
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <p>
            This demo works offline thanks to Service Workers and local storage.
            Try the following steps:
          </p>
          <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Click "Simulate Offline" at the top of this page</li>
            <li>Continue using the local storage feature (adding/removing items)</li>
            <li>Navigate to different sections using the navigation menu</li>
            <li>Refresh the page - it should still load while "offline"</li>
          </ol>

          <div style={{
            backgroundColor: '#e6f7ff',
            padding: '10px',
            borderRadius: '4px',
            marginTop: '15px'
          }}>
            <p>
              <strong>Note:</strong> Real offline functionality requires this page to be loaded
              from a server with HTTPS for Service Workers to be active. Local development
              servers may also work.
            </p>
          </div>
        </div>
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
              <td>Storage Options</td>
              <td>localStorage, sessionStorage, IndexedDB, Cache API</td>
              <td>AsyncStorage, SQLite, Realm, filesystem</td>
            </tr>
            <tr>
              <td>Storage Limits</td>
              <td>Browser dependent (typically 5-10MB for localStorage, more for IndexedDB)</td>
              <td>Limited only by device storage</td>
            </tr>
            <tr>
              <td>Offline Detection</td>
              <td>online/offline events, unreliable in some cases</td>
              <td>NetInfo API, more reliable network info</td>
            </tr>
            <tr>
              <td>Background Sync</td>
              <td>Limited via Service Workers, requires user permission</td>
              <td>Native background tasks with better reliability</td>
            </tr>
            <tr>
              <td>Data Security</td>
              <td>Limited security, accessible in browser storage</td>
              <td>More secure storage options available (KeyStore, Keychain)</td>
            </tr>
            <tr>
              <td>File System Access</td>
              <td>Limited and requires permission</td>
              <td>Full access to device file system</td>
            </tr>
            <tr>
              <td>Database Support</td>
              <td>IndexedDB, WebSQL (deprecated)</td>
              <td>SQLite, Realm, Firebase, etc.</td>
            </tr>
            <tr>
              <td>Offline First Approach</td>
              <td>Requires careful implementation with Service Workers</td>
              <td>More natural offline-first architecture</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StorageCapabilities;
