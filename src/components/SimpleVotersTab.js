import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleVotersTab = () => {
  const [dbStatus, setDbStatus] = useState('checking');
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
        timeout: 60000,
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
    <div>
      {/* Database Status */}
      <div className="card">
        <h3 className="card-title">Database Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div 
            className={`status-indicator ${dbStatus}`}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: dbStatus === 'connected' ? '#28a745' : '#dc3545'
            }}
          ></div>
          <span>
            {dbStatus === 'connected' ? '✅ Database Connected' : '❌ Database Disconnected'}
          </span>
        </div>
        
        {dbStatus === 'connected' && (
          <div className="success">
            <p>✅ Database is connected and ready to use!</p>
            <p>Voter records: {voters.length}</p>
          </div>
        )}
      </div>

      {/* Database Setup Instructions */}
      {dbStatus === 'disconnected' && (
        <div className="card">
          <h3 className="card-title">🔧 HostGator Database Setup</h3>
          <div className="instructions">
            <p>To use the voter management features, you need to set up a MySQL database on HostGator:</p>
            
            <h4>Step 1: Create Database</h4>
            <ol>
              <li>Log into your HostGator cPanel</li>
              <li>Go to "MySQL Databases" in the Databases section</li>
              <li>Create a new database named <code>ld11_voters</code></li>
            </ol>

            <h4>Step 2: Create Database User</h4>
            <ol>
              <li>Create a new MySQL user with a strong password</li>
              <li>Add the user to the database with "All Privileges"</li>
              <li>Note down the database details:
                <ul>
                  <li>Database name: <code>yourusername_ld11_voters</code></li>
                  <li>Username: <code>yourusername_dbuser</code></li>
                  <li>Password: <code>[your chosen password]</code></li>
                  <li>Host: <code>localhost</code></li>
                </ul>
              </li>
            </ol>

            <h4>Step 3: Update Configuration</h4>
            <ol>
              <li>Edit the file <code>voters_api.php</code> on your server</li>
              <li>Update the database configuration section with your credentials:</li>
            </ol>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '6px', 
              margin: '1rem 0',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '0.85rem',
              overflow: 'auto'
            }}>
              <pre>{`$db_config = [
    'host' => 'localhost',
    'dbname' => 'yourusername_ld11_voters',
    'username' => 'yourusername_dbuser',
    'password' => 'your_secure_password'
];`}</pre>
            </div>

            <h4>Step 4: Test Connection</h4>
            <p>After updating the configuration, refresh this page to test the database connection.</p>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {dbStatus === 'connected' && (
        <div className="card">
          <h3 className="card-title">📁 Upload LD11.csv File</h3>
          <p>Upload your LD11.csv file to populate the voter database. Maximum file size: 10MB</p>
          
          <div style={{ margin: '1.5rem 0' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              id="csv-upload"
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="csv-upload" 
              style={{
                display: 'block',
                padding: '2rem',
                border: '2px dashed #667eea',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                background: loading ? '#f8f9fa' : 'white',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <div>
                  <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <span>Processing CSV...</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                  <span>Click to select CSV file</span>
                  <br />
                  <small style={{ color: '#666' }}>or drag and drop here</small>
                </div>
              )}
            </label>
          </div>

          {error && <div className="error">{error}</div>}
          {uploadStatus && <div className="success">{uploadStatus}</div>}
        </div>
      )}

      {/* Database Actions */}
      {dbStatus === 'connected' && (
        <div className="card">
          <h3 className="card-title">Database Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="button" 
              onClick={fetchVoters}
              disabled={loading}
            >
              🔄 Refresh Data
            </button>
            <button 
              className="button button-secondary" 
              onClick={clearDatabase}
              disabled={loading}
            >
              🗑️ Clear Database
            </button>
            <button 
              className="button" 
              onClick={checkDatabaseStatus}
            >
              🔍 Check Connection
            </button>
          </div>
        </div>
      )}

      {/* Voter Data Display */}
      {dbStatus === 'connected' && voters.length > 0 && (
        <div className="card">
          <h3 className="card-title">Voter Data ({voters.length} records)</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Party</th>
                  <th>Precinct</th>
                </tr>
              </thead>
              <tbody>
                {voters.slice(0, 50).map((voter, index) => (
                  <tr key={index}>
                    <td>{voter.id}</td>
                    <td>{voter.name}</td>
                    <td>{voter.address}</td>
                    <td>{voter.party}</td>
                    <td>{voter.precinct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {voters.length > 50 && (
              <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
                Showing first 50 records of {voters.length} total
              </p>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card">
        <h3 className="card-title">💡 Need Help?</h3>
        <div className="instructions">
          <p><strong>Common Issues:</strong></p>
          <ul>
            <li><strong>Database Connection Failed:</strong> Check your database credentials in voters_api.php</li>
            <li><strong>Upload Failed:</strong> Ensure your CSV file is properly formatted and under 10MB</li>
            <li><strong>Permission Denied:</strong> Check file permissions on your HostGator server</li>
          </ul>
          
          <p><strong>CSV Format Requirements:</strong></p>
          <ul>
            <li>File must be in CSV format (.csv extension)</li>
            <li>First row should contain column headers</li>
            <li>Expected columns: name, address, party, precinct, voter_id</li>
            <li>Maximum file size: 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleVotersTab;