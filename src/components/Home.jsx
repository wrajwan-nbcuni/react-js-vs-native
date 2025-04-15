import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="card">
        <h2>Comparing React Native, Capacitor, and React.js Web Capabilities</h2>
        <p>
          This demo showcases what's possible with React.js on the web compared to
          React Native and Capacitor for mobile apps, focusing on the following areas:
        </p>

        <ul style={{ margin: '15px 0', paddingLeft: '20px' }}>
          <li>
            <strong><Link to="/ui-animations">UI &amp; Animations</Link></strong> -
            Gestures, animations, transitions, and interaction patterns
          </li>
          <li>
            <strong><Link to="/device-access">Device &amp; Hardware Access</Link></strong> -
            Camera, sensors, geolocation, device information
          </li>
          <li>
            <strong><Link to="/haptic-feedback">Haptic Feedback</Link></strong> -
            Vibration patterns, tactile responses, and feedback types
          </li>
          <li>
            <strong><Link to="/storage">Storage &amp; Offline Capabilities</Link></strong> -
            Data persistence, offline functionality
          </li>
          <li>
            <strong><Link to="/comparison">Comparison Table</Link></strong> -
            Side-by-side feature comparison
          </li>
        </ul>
      </div>

      <div className="card">
        <h3>Key Takeaways</h3>
        <p>
          While <strong>React Native</strong> offers deeper integration with native device features and better
          performance for complex UI, <strong>Capacitor</strong> bridges the gap between web and native by providing native
          access from web-based apps, and <strong>React.js web applications</strong> have improved significantly
          and can now implement many native-like features using modern Web APIs.
        </p>
        <p>
          The main differences are in permission models, performance optimizations, and
          the user experience flow when accessing hardware features:
        </p>
        <ul>
          <li>
            <strong>React Native:</strong> Native-first development, full access to hardware APIs, optimized performance.
          </li>
          <li>
            <strong>Capacitor:</strong> Web-first development with native bridge, native hardware access plus web fallback, easier to maintain cross-platform compatibility.
          </li>
          <li>
            <strong>React.js Web:</strong> Web-only, limited but improving hardware access through browser APIs, broader device compatibility, simpler deployment.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
