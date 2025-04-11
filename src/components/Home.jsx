import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="card">
        <h2>Comparing React Native and React.js Web Capabilities</h2>
        <p>
          This demo showcases what's possible with React.js on the web compared to
          React Native for mobile apps, focusing on the following areas:
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
          While React Native offers deeper integration with native device features and better
          performance for complex UI, React.js web applications have improved significantly
          and can now implement many native-like features using modern Web APIs.
        </p>
        <p>
          The main differences are in permission models, performance optimizations, and
          the user experience flow when accessing hardware features.
        </p>
      </div>
    </div>
  );
};

export default Home;
