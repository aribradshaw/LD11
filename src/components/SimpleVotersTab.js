import React, { useState } from 'react';

const SimpleVotersTab = () => {
  const [dbStatus, setDbStatus] = useState('disconnected');
  const [uploadStatus, setUploadStatus] = useState('');

  return (
    <div className="voters-container">
      <div className="voters-header">
        <h2 className="voters-title">Voter Database Management</h2>
        <div className={`database-status ${dbStatus}`}>
          <div className="status-indicator"></div>
          <span>{dbStatus === 'connected' ? 'Database Connected' : 'Database Disconnected'}</span>
        </div>
      </div>

      <div className="upload-section">
        <h3>Upload LD11.csv File</h3>
        <p>Upload your LD11.csv file to populate the voter database</p>
        <input
          type="file"
          accept=".csv"
          style={{ marginBottom: '1rem' }}
        />
        <br />
        <button className="upload-button">
          Choose CSV File
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>HostGator Database Setup Instructions</h4>
        <ol>
          <li>Log into your HostGator cPanel</li>
          <li>Navigate to "MySQL Databases" in the Databases section</li>
          <li>Create a new database named "ld11_voters"</li>
          <li>Create a new MySQL user with a strong password</li>
          <li>Add the user to the database with "All Privileges"</li>
          <li>Note down the database details:
            <ul>
              <li>Database name: yourusername_ld11_voters</li>
              <li>Username: yourusername_dbuser</li>
              <li>Password: [your chosen password]</li>
              <li>Host: localhost</li>
            </ul>
          </li>
          <li>Update the database configuration in <code>voters_api.php</code></li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleVotersTab;
