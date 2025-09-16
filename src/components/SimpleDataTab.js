import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const SimpleDataTab = () => {
  const [adSpendData, setAdSpendData] = useState(null);
  const [voterData, setVoterData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [adSpendResponse, voterResponse, resultsResponse] = await Promise.all([
        axios.get('./fixed-api.php?endpoint=adspend'),
        axios.get('./fixed-api.php?endpoint=voterdata'),
        axios.get('./fixed-api.php?endpoint=results')
      ]);

      setAdSpendData(adSpendResponse.data);
      setVoterData(voterResponse.data);
      setResultsData(resultsResponse.data);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button className="button" onClick={fetchAllData}>
          🔄 Retry
        </button>
      </div>
    );
  }

  // Prepare data for visualizations
  const optimizationData = adSpendData?.by_optimization ? 
    Object.entries(adSpendData.by_optimization).map(([key, value]) => ({
      name: key,
      spent: value.total_spent,
      reach: value.total_reach
    })) : [];

  const targetData = adSpendData?.by_target ? 
    Object.entries(adSpendData.by_target).slice(0, 10).map(([key, value]) => ({
      name: key.length > 15 ? key.substring(0, 15) + '...' : key,
      fullName: key,
      spent: value.total_spent
    })) : [];

  const voterRegistrationData = voterData ? [
    { name: 'Republican', value: voterData[0]['Registered Voters'].Republican, color: '#9A3434' },
    { name: 'Democrat', value: voterData[0]['Registered Voters'].Democrat, color: '#34419A' },
    { name: 'Other', value: voterData[0]['Registered Voters'].Other, color: '#222222' }
  ] : [];

  const turnoutData = resultsData?.precinct_analysis?.all_precincts?.slice(0, 8) || [];

  return (
    <div>
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">
            ${adSpendData?.spending_summary?.total?.toLocaleString() || '0'}
          </div>
          <div className="metric-label">Total Ad Spend</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {adSpendData?.performance_metrics?.total_reach?.toLocaleString() || '0'}
          </div>
          <div className="metric-label">Total Reach</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {resultsData?.turnout_summary?.overall_turnout?.toFixed(1) || '0'}%
          </div>
          <div className="metric-label">Overall Turnout</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {resultsData?.turnout_summary?.total_registered?.toLocaleString() || '0'}
          </div>
          <div className="metric-label">Registered Voters</div>
        </div>
      </div>

      {/* Ad Spend by Optimization */}
      <div className="card">
        <h3 className="card-title">Ad Spend by Optimization Type</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={optimizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']} />
              <Bar dataKey="spent" fill="#34419A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Voter Registration by Party */}
      <div className="card">
        <h3 className="card-title">Voter Registration by Party</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={voterRegistrationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {voterRegistrationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Targets by Spend */}
      <div className="card">
        <h3 className="card-title">Top 10 Targets by Ad Spend</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={targetData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Bar dataKey="spent" fill="#9A3434" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Precincts by Turnout */}
      <div className="card">
        <h3 className="card-title">Top 8 Precincts by Turnout</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={turnoutData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Turnout']} />
              <Line type="monotone" dataKey="turnout" stroke="#34419A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Ad Campaigns Table */}
      <div className="card">
        <h3 className="card-title">Recent Ad Campaigns</h3>
        <div style={{ overflowX: 'auto' }}>
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
              {adSpendData?.raw?.slice(0, 8).map((row, index) => (
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
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="button" onClick={fetchAllData}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default SimpleDataTab;