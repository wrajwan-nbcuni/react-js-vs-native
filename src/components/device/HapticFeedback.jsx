import React, { useEffect, useState } from 'react';

const HapticFeedback = () => {
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState('none');
  const [customPattern, setCustomPattern] = useState('100,50,200,50,300');
  const [patternPlaying, setPatternPlaying] = useState(false);

  // Check for vibration support
  useEffect(() => {
    if ('vibrate' in navigator) {
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

  // Trigger vibration pattern
  const triggerHapticFeedback = (pattern) => {
    if (!vibrationSupported) return;

    setSelectedPattern(pattern);
    setPatternPlaying(true);

    if (pattern === 'custom') {
      const parsedPattern = customPattern.split(',').map(num => parseInt(num.trim(), 10));
      navigator.vibrate(parsedPattern);
    } else if (hapticPatterns[pattern]) {
      navigator.vibrate(hapticPatterns[pattern]);
    } else if (pattern === 'stop') {
      navigator.vibrate(0); // Stop any ongoing vibration
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
        Web browsers offer basic vibration capabilities, while React Native provides fine-tuned haptic patterns.
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
            <p style={{ margin: 0 }}>✓ Your device supports vibration</p>
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
              Web can only approximate these experiences.
            </p>
          </div>

          <div className="card" style={{ marginBottom: '15px' }}>
            <div className="card-header">
              <h3>Android-Inspired Haptic Patterns</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
              <button onClick={() => triggerHapticFeedback('androidLight')}>Light</button>
              <button onClick={() => triggerHapticFeedback('androidMedium')}>Medium</button>
              <button onClick={() => triggerHapticFeedback('androidHeavy')}>Heavy</button>
              <button onClick={() => triggerHapticFeedback('androidClick')}>Click</button>
              <button onClick={() => triggerHapticFeedback('androidDoubleClick')}>Double Click</button>
              <button onClick={() => triggerHapticFeedback('androidTick')}>Tick</button>
              <button onClick={() => triggerHapticFeedback('androidLongPress')}>Long Press</button>
            </div>
            <p>
              Android haptics are more varied across devices due to hardware differences.
              React Native unifies these through platform-specific implementations.
            </p>
          </div>

          <div className="card" style={{ marginBottom: '15px' }}>
            <div className="card-header">
              <h3>UI Interaction Patterns</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
              <button onClick={() => triggerHapticFeedback('buttonPress')}>Button Press</button>
              <button onClick={() => triggerHapticFeedback('toggleSwitch')}>Toggle Switch</button>
              <button onClick={() => triggerHapticFeedback('sliderTick')}>Slider Tick</button>
              <button onClick={() => triggerHapticFeedback('keyboardTap')}>Keyboard Tap</button>
              <button onClick={() => triggerHapticFeedback('scrollStop')}>Scroll Stop</button>
              <button onClick={() => triggerHapticFeedback('pullToRefresh')}>Pull to Refresh</button>
            </div>
            <p>
              These patterns simulate common UI interactions. React Native can trigger
              these precisely at the right moments in the interaction flow.
            </p>
          </div>

          <div className="card" style={{ marginBottom: '15px' }}>
            <div className="card-header">
              <h3>Notification Patterns</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
              <button onClick={() => triggerHapticFeedback('notificationGentle')}>Gentle Notification</button>
              <button onClick={() => triggerHapticFeedback('notificationImportant')}>Important Alert</button>
              <button onClick={() => triggerHapticFeedback('messageReceived')}>Message Received</button>
              <button onClick={() => triggerHapticFeedback('callIncoming')}>Incoming Call</button>
              <button onClick={() => triggerHapticFeedback('callEnded')}>Call Ended</button>
            </div>
            <p>
              Notification haptics help users distinguish between different types of alerts.
              In React Native, these can be synchronized with visual and audio cues.
            </p>
          </div>

          <div className="card" style={{ marginBottom: '15px' }}>
            <div className="card-header">
              <h3>Game & Interactive Patterns</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
              <button onClick={() => triggerHapticFeedback('collision')}>Collision</button>
              <button onClick={() => triggerHapticFeedback('explosion')}>Explosion</button>
              <button onClick={() => triggerHapticFeedback('achievement')}>Achievement</button>
              <button onClick={() => triggerHapticFeedback('countdownTick')}>Countdown Tick</button>
              <button onClick={() => triggerHapticFeedback('countdownFinish')}>Countdown Finish</button>
              <button onClick={() => triggerHapticFeedback('lowEnergy')}>Low Energy</button>
              <button onClick={() => triggerHapticFeedback('healthCritical')}>Health Critical</button>
            </div>
            <p>
              Gaming experiences benefit greatly from haptic feedback. React Native
              offers better timing precision for these interactive elements.
            </p>
          </div>

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
              <th>React Native</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API Access</td>
              <td>Web Vibration API only</td>
              <td>Native Haptic APIs (iOS, Android)</td>
            </tr>
            <tr>
              <td>Pattern Types</td>
              <td>Basic timing patterns (on/off durations)</td>
              <td>Complex patterns with intensity control</td>
            </tr>
            <tr>
              <td>Device Support</td>
              <td>Limited browser support, mainly mobile</td>
              <td>Full support on compatible devices</td>
            </tr>
            <tr>
              <td>iOS Support</td>
              <td>Poor (limited Safari support)</td>
              <td>Excellent (using UIFeedbackGenerator)</td>
            </tr>
            <tr>
              <td>Android Support</td>
              <td>Better than iOS, but limited control</td>
              <td>Good (using Vibrator API with full control)</td>
            </tr>
            <tr>
              <td>Precision</td>
              <td>Low (timing can be inconsistent)</td>
              <td>High (native precision)</td>
            </tr>
            <tr>
              <td>Power Efficiency</td>
              <td>Poor (runs through browser)</td>
              <td>Good (optimized native implementation)</td>
            </tr>
            <tr>
              <td>Integration with Gestures</td>
              <td>Manual coordination required</td>
              <td>Can be tied directly to gesture events</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '10px' }}>Implementation Differences:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li>
              <strong>React.js Web:</strong> Uses the Navigator Vibration API with simple on/off patterns.
              <pre style={{ margin: '5px 0', backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '4px' }}>
                navigator.vibrate([100, 50, 200])
              </pre>
            </li>
            <li>
              <strong>React Native iOS:</strong> Uses UIFeedbackGenerator for precise haptic feedback.
              <pre style={{ margin: '5px 0', backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '4px' }}>
                import * as Haptics from 'expo-haptics';<br />
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              </pre>
            </li>
            <li>
              <strong>React Native Android:</strong> Uses Vibrator service with better pattern control.
              <pre style={{ margin: '5px 0', backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '4px' }}>
                {'// Example React Native code (not browser compatible)'}
                {'import { Vibration } from "react-native";'}
                {'// Use the pattern with optional repeat parameter'}
                {'// Vibration.vibrate(pattern, repeat);'}
              </pre>
            </li>
          </ul>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            Third-party libraries like <strong>react-native-haptic-feedback</strong> provide a unified
            API across platforms in React Native, something web applications cannot achieve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HapticFeedback;
