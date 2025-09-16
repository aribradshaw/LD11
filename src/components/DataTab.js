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
  Line,
  Area,
  AreaChart
} from 'recharts';

const DataTab = () => {
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
      const [adSpendResponse, voterResponse, resultsResponse] = await Promise.all([
        axios.get('/ld11/fixed-api.php?endpoint=adspend'),
        axios.get('/ld11/fixed-api.php?endpoint=voterdata'),
        axios.get('/ld11/fixed-api.php?endpoint=results')
      ]);

      setAdSpendData(adSpendResponse.data);
      setVoterData(voterResponse.data);
      setResultsData(resultsResponse.data);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  // Prepare data for visualizations
  const optimizationData = adSpendData?.by_optimization ? 
    Object.entries(adSpendData.by_optimization).map(([key, value]) => ({
      name: key,
      spent: value.total_spent,
      reach: value.total_reach,
      impressions: value.total_impressions
    })) : [];

  const targetData = adSpendData?.by_target ? 
    Object.entries(adSpendData.by_target).map(([key, value]) => ({
      name: key.length > 20 ? key.substring(0, 20) + '...' : key,
      fullName: key,
      spent: value.total_spent,
      reach: value.total_reach
    })) : [];

  const voterRegistrationData = voterData ? [
    { name: 'Republican', value: voterData[0]['Registered Voters'].Republican, color: '#dc3545' },
    { name: 'Democrat', value: voterData[0]['Registered Voters'].Democrat, color: '#007bff' },
    { name: 'Other', value: voterData[0]['Registered Voters'].Other, color: '#6c757d' }
  ] : [];

  const turnoutData = resultsData?.precinct_analysis?.all_precincts?.slice(0, 10) || [];

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

      {/* Charts Grid */}
      <div className="dashboard-grid">
        {/* Ad Spend by Optimization */}
        <div className="chart-card">
          <h3 className="chart-title">Ad Spend by Optimization Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={optimizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']} />
              <Bar dataKey="spent" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Voter Registration by Party */}
        <div className="chart-card">
          <h3 className="chart-title">Voter Registration by Party</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* Ad Spend by Target */}
        <div className="chart-card">
          <h3 className="chart-title">Ad Spend by Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={targetData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Bar dataKey="spent" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Precincts by Turnout */}
        <div className="chart-card">
          <h3 className="chart-title">Top 10 Precincts by Turnout</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={turnoutData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Turnout']} />
              <Area type="monotone" dataKey="turnout" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="chart-card">
          <h3 className="chart-title">Campaign Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              {
                name: 'Avg Frequency',
                value: adSpendData?.performance_metrics?.avg_frequency || 0
              },
              {
                name: 'Total Impressions',
                value: (adSpendData?.performance_metrics?.total_impressions || 0) / 1000
              },
              {
                name: 'Avg Turnout',
                value: resultsData?.turnout_summary?.avg_turnout || 0
              }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f093fb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Candidate Performance */}
        <div className="chart-card">
          <h3 className="chart-title">Candidate Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(resultsData?.candidate_performance || {}).map(([name, data]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              votes: data.total,
              precincts: data.precincts
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="votes" fill="#4facfe" name="Total Votes" />
              <Bar dataKey="precincts" fill="#00f2fe" name="Precincts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Tables */}
      <div className="dashboard-grid">
        <div className="chart-card">
          <h3 className="chart-title">Recent Ad Campaigns</h3>
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
              {adSpendData?.raw?.slice(0, 10).map((row, index) => (
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

        <div className="chart-card">
          <h3 className="chart-title">Precinct Turnout Summary</h3>
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
              {resultsData?.precinct_analysis?.all_precincts?.slice(0, 10).map((precinct, index) => (
                <tr key={index}>
                  <td>{precinct.name}</td>
                  <td>{precinct.registered.toLocaleString()}</td>
                  <td>{precinct.ballots_cast.toLocaleString()}</td>
                  <td>{precinct.turnout.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTab;
