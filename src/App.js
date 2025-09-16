import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DataTab from './components/DataTab';
import VotersTab from './components/VotersTab';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>LD11 Campaign Dashboard</h1>
          <nav className="tab-navigation">
            <Link 
              to="/data" 
              className={`tab-link ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              Data
            </Link>
            <Link 
              to="/voters" 
              className={`tab-link ${activeTab === 'voters' ? 'active' : ''}`}
              onClick={() => setActiveTab('voters')}
            >
              Voters
            </Link>
          </nav>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DataTab />} />
            <Route path="/data" element={<DataTab />} />
            <Route path="/voters" element={<VotersTab />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
