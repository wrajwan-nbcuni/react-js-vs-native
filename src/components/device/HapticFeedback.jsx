import React, { useEffect, useState } from 'react';
import { getPlatform, hapticService, isNative } from '../../services/CapacitorService';

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
                    width: `${Math.min(parseInt(duration, 10) / 5, 50)}px`,
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
          <h3>Web vs Capacitor vs Native Comparison</h3>
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
