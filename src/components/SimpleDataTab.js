import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleDataTab = () => {
  const [adSpendData, setAdSpendData] = useState(null);
  const [voterData, setVoterData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [adSpendRes, voterRes, resultsRes] = await Promise.all([
        axios.get('/ld11/api.php?action=adspend'),
        axios.get('/ld11/api.php?action=voters'),
        axios.get('/ld11/api.php?action=results')
      ]);

      setAdSpendData(adSpendRes.data.data);
      setVoterData(voterRes.data.data);
      setResultsData(resultsRes.data.data);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Calculate totals
  const totalSpent = adSpendData ? 
    adSpendData.reduce((sum, row) => sum + parseFloat(row.Spent.replace(/[$,]/g, '')), 0) : 0;
  
  const totalReach = adSpendData ? 
    adSpendData.reduce((sum, row) => sum + parseInt(row.Reach.replace(/,/g, '')), 0) : 0;

  const totalRegistered = resultsData ? 
    resultsData.reduce((sum, row) => sum + row.registered, 0) : 0;

  const avgTurnout = resultsData && resultsData.length > 0 ? 
    resultsData.reduce((sum, row) => sum + row.turnout, 0) / resultsData.length : 0;

  return (
    <div>
      <h2>LD11 Campaign Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">${totalSpent.toLocaleString()}</div>
          <div className="metric-label">Total Ad Spend</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalReach.toLocaleString()}</div>
          <div className="metric-label">Total Reach</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalRegistered.toLocaleString()}</div>
          <div className="metric-label">Registered Voters</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{avgTurnout.toFixed(1)}%</div>
          <div className="metric-label">Avg Turnout</div>
        </div>
      </div>

      {/* Ad Spend Table */}
      <div className="chart-card">
        <h3 className="chart-title">Ad Spend Data</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Optimization</th>
              <th>Target</th>
              <th>Reach</th>
              <th>Spent</th>
            </tr>
          </thead>
          <tbody>
            {adSpendData?.slice(0, 10).map((row, index) => (
              <tr key={index}>
                <td>{row.Optimization}</td>
                <td>{row.Target}</td>
                <td>{parseInt(row.Reach.replace(/,/g, '')).toLocaleString()}</td>
                <td>{row.Spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Voter Data */}
      <div className="chart-card">
        <h3 className="chart-title">Voter Registration</h3>
        {voterData && voterData[0] && (
          <div>
            <p>Republican: {voterData[0]['Registered Voters'].Republican.toLocaleString()}</p>
            <p>Democrat: {voterData[0]['Registered Voters'].Democrat.toLocaleString()}</p>
            <p>Other: {voterData[0]['Registered Voters'].Other.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="chart-card">
        <h3 className="chart-title">Precinct Results</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Precinct</th>
              <th>Registered</th>
              <th>Ballots Cast</th>
              <th>Turnout %</th>
            </tr>
          </thead>
          <tbody>
            {resultsData?.slice(0, 10).map((row, index) => (
              <tr key={index}>
                <td>{row.precinct}</td>
                <td>{row.registered.toLocaleString()}</td>
                <td>{row.ballots_cast.toLocaleString()}</td>
                <td>{row.turnout.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleDataTab;
