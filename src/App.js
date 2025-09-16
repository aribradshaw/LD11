import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DataTab from './components/DataTab';
import VotersTab from './components/VotersTab';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AppHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DataTab />} />
            <Route path="/dashboard" element={<DataTab />} />
            <Route path="/voters" element={<VotersTab />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function AppHeader() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/' ? 'dashboard' : location.pathname.substring(1));

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>LD11 Campaign Dashboard</h1>
        <p className="header-subtitle">2024 Meta Ad Spend & Election Results Analysis</p>
      </div>
      <nav className="tab-navigation">
        <Link 
          to="/dashboard" 
          className={`tab-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/voters" 
          className={`tab-link ${activeTab === 'voters' ? 'active' : ''}`}
          onClick={() => setActiveTab('voters')}
        >
          👥 Voters
        </Link>
      </nav>
    </header>
  );
}

export default App;
