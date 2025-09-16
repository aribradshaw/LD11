import React, { useState } from 'react';
import SimpleDataTab from './components/SimpleDataTab';
import SimpleVotersTab from './components/SimpleVotersTab';
import './SimpleApp.css';

function SimpleApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="simple-app">
      <header className="app-header">
        <div className="header-content">
          <img src="./public/smalllogo.png" alt="LD11 Logo" className="header-logo" />
          <div className="header-text">
            <h1>LD11 Campaign Dashboard</h1>
            <p className="subtitle">2024 Meta Ad Spend & Election Results</p>
          </div>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'voters' ? 'active' : ''}`}
          onClick={() => setActiveTab('voters')}
        >
          👥 Voters
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && <SimpleDataTab />}
        {activeTab === 'voters' && <SimpleVotersTab />}
      </main>
    </div>
  );
}

export default SimpleApp;