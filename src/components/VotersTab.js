import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VotersTab = () => {
  const [dbStatus, setDbStatus] = useState('disconnected');
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await axios.get('/ld11/voters_api.php?action=status');
      setDbStatus(response.data.connected ? 'connected' : 'disconnected');
      if (response.data.connected) {
        fetchVoters();
      }
    } catch (err) {
      setDbStatus('disconnected');
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/ld11/voters_api.php?action=fetch');
      setVoters(response.data.voters || []);
    } catch (err) {
      setError('Failed to fetch voters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      setLoading(true);
      setError(null);
      setUploadStatus('Uploading and processing CSV...');
      
      const response = await axios.post('/ld11/voters_api.php?action=upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for large files
      });

      if (response.data.success) {
        setUploadStatus(`Successfully imported ${response.data.imported} voters`);
        if (response.data.errors && response.data.errors.length > 0) {
          setUploadStatus(prev => prev + ` (${response.data.errors.length} errors)`);
        }
        await fetchVoters();
      } else {
        setError('Upload failed: ' + (response.data.error || 'Unknown error'));
        setUploadStatus('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed: ' + (err.response?.data?.error || err.message));
      setUploadStatus('');
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all voter data? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post('/ld11/voters_api.php?action=clear');
      setVoters([]);
      setUploadStatus('Database cleared successfully');
    } catch (err) {
      setError('Failed to clear database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voters-container">
      <div className="voters-header">
        <h2 className="voters-title">Voter Database Management</h2>
        <div className={`database-status ${dbStatus}`}>
          <div className="status-indicator"></div>
          <span>{dbStatus === 'connected' ? 'Database Connected' : 'Database Disconnected'}</span>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {uploadStatus && <div style={{color: '#28a745', marginBottom: '1rem'}}>{uploadStatus}</div>}

      <div className="upload-section">
        <h3>📁 Upload LD11.csv File</h3>
        <p>Upload your LD11.csv file to populate the voter database. Maximum file size: 10MB</p>
        
        <div className="file-upload-area">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            id="csv-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="csv-upload" className="file-upload-label">
            {loading ? (
              <div className="upload-progress">
                <div className="progress-spinner"></div>
                <span>Processing CSV...</span>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">📤</div>
                <span>Click to select CSV file</span>
                <small>or drag and drop here</small>
              </div>
            )}
          </label>
        </div>
        
        {loading && (
          <div className="upload-progress-bar">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p>Processing your file...</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="upload-button" 
          onClick={fetchVoters}
          disabled={loading || dbStatus === 'disconnected'}
        >
          Refresh Data
        </button>
        <button 
          className="upload-button" 
          onClick={clearDatabase}
          disabled={loading || dbStatus === 'disconnected'}
          style={{ backgroundColor: '#dc3545' }}
        >
          Clear Database
        </button>
      </div>

      {dbStatus === 'disconnected' && (
        <div className="error">
          <h4>Database Setup Required</h4>
          <p>Please follow the HostGator database setup instructions below to connect your database.</p>
        </div>
      )}

      {loading && <div className="loading">Loading voter data...</div>}

      {voters.length > 0 && (
        <div>
          <h3>Voter Data ({voters.length} records)</h3>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Party</th>
                  <th>Precinct</th>
                  <th>Voter ID</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter, index) => (
                  <tr key={index}>
                    <td>{voter.id}</td>
                    <td>{voter.name}</td>
                    <td>{voter.address}</td>
                    <td>{voter.party}</td>
                    <td>{voter.precinct}</td>
                    <td>{voter.voter_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

export default VotersTab;
