import React, { useState } from 'react';
import { shareService } from '../../services/CapacitorService';

const ShareBuild = () => {
  const [buildUrl, setBuildUrl] = useState('');

  const handleShare = async () => {
    try {
      await shareService.shareAppBuild(buildUrl);
    } catch (error) {
      console.error('Failed to share', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Share App Build</h3>
      </div>
      <div style={{ margin: '15px 0' }}>
        <input
          type="text"
          value={buildUrl}
          onChange={(e) => setBuildUrl(e.target.value)}
          placeholder="Enter TestFlight or App Store URL"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #d9d9d9'
          }}
        />
        <button onClick={handleShare}>Share App Build</button>
      </div>
      <p>
        For iOS, you can share a TestFlight or App Store link. Users will need to have TestFlight installed to access beta builds.
      </p>
    </div>
  );
};

export default ShareBuild;
