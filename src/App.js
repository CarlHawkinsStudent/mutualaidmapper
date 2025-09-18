import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './MapComponent';
import ReportForm from './ReportForm';
import ReportsList from './ReportsList';

// The backend API endpoint
const API_URL = 'http://localhost:5000/api/reports';

function App() {
  const [reports, setReports] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Fetch reports from the backend when the component mounts
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((error) => console.error("Error fetching reports:", error));
  }, []);

  const handleReportSubmit = async (newReport) => {
    try {
      console.log('Sending to API:', API_URL, newReport);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const savedReport = await response.json();
      console.log('Received back from server:', savedReport);
      console.log('Contact info received:', savedReport.contact);
      
      setReports([savedReport, ...reports]);
      return savedReport;
    } catch (error) {
      console.error("Error submitting report:", error);
      throw new Error(error.message || 'Failed to submit report');
    }
  };

  // Apply dark mode to entire page
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className="App-header">
        <h1>Mutual Aid Activity Mapper</h1>
        <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>
      <main>
        <ReportForm onReportSubmit={handleReportSubmit} />
        <ReportsList reports={reports} />
      </main>
      
      <div className="map-container">
        <h2>Activity Map</h2>
        <MapComponent reports={reports} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default App;