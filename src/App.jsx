import React, { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import ComparisonTable from './components/ComparisonTable';
import DeviceAccess from './components/device/DeviceAccess';
import HapticFeedback from './components/device/HapticFeedback';
import Home from './components/Home';
import StorageCapabilities from './components/storage/StorageCapabilities';
import UIAnimations from './components/ui/UIAnimations';
import { getPlatform } from './services/CapacitorService';

function App() {
  const [capacitorPlatform, setCapacitorPlatform] = useState('web');

  useEffect(() => {
    setCapacitorPlatform(getPlatform());

    console.log('plat', capacitorPlatform)
  }, [])


  return (
    <div className={`${capacitorPlatform}`}>
      <header>
        <div className="container">
          <h1>React Native vs React.js Features</h1>
        </div>
      </header>

      <nav className="container">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/ui-animations">UI/Animations</NavLink>
        <NavLink to="/device-access">Device Access</NavLink>
        <NavLink to="/haptic-feedback">Haptic Feedback</NavLink>
        <NavLink to="/storage">Storage & Offline</NavLink>
        <NavLink to="/comparison">Comparison Table</NavLink>
      </nav>

      <main className="container" style={{ padding: '20px 0' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ui-animations" element={<UIAnimations />} />
          <Route path="/device-access" element={<DeviceAccess />} />
          <Route path="/haptic-feedback" element={<HapticFeedback />} />
          <Route path="/storage" element={<StorageCapabilities />} />
          <Route path="/comparison" element={<ComparisonTable />} />
        </Routes>
      </main>

      <footer className="container" style={{ borderTop: '1px solid #eaeaea', padding: '20px 0', textAlign: 'center' }}>
        <p>A demonstration of React.js web capabilities compared to React Native</p>
      </footer>
    </div>
  );
}

export default App;
