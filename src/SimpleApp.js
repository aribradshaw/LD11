import React, { useState } from 'react';
import SimpleDataTab from './components/SimpleDataTab';
import SimpleVotersTab from './components/SimpleVotersTab';
import './App.css';

function SimpleApp() {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="App">
      <header className="app-header">
        <h1>LD11 Campaign Dashboard</h1>
        <nav className="tab-navigation">
          <button 
            className={`tab-link ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button 
            className={`tab-link ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}
          >
            Voters
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeTab === 'data' ? <SimpleDataTab /> : <SimpleVotersTab />}
      </main>
    </div>
  );
}

export default SimpleApp;
