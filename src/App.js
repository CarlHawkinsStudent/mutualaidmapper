import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './MapComponent';
import { getStates, getCities, getNeighborhoods } from './locationData';

// The backend API endpoint
const API_URL = 'http://localhost:5000/api/reports';

function App() {
  // State for the list of reports
  const [reports, setReports] = useState([]);
  // State for the form inputs
  const [groupName, setGroupName] = useState('');
  const [activityType, setActivityType] = useState('Food Distribution');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  
  const [availableCities, setAvailableCities] = useState([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState([]);
  
  useEffect(() => {
    setAvailableCities(getCities(state));
    setCity('');
    setNeighborhood('');
  }, [state]);
  
  useEffect(() => {
    setAvailableNeighborhoods(getNeighborhoods(state, city));
    setNeighborhood('');
  }, [state, city]);

  // Fetch reports from the backend when the component mounts
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((error) => console.error("Error fetching reports:", error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Geocode neighborhood, city, state to lat/lng
    const locationQuery = neighborhood 
      ? `${neighborhood}, ${city}, ${state}, USA`
      : `${city}, ${state}, USA`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`;
    
    try {
      const geoResponse = await fetch(geocodeUrl);
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) {
        alert('Location not found. Please check city and state.');
        return;
      }

      const newReport = {
        groupName,
        activityType,
        description,
        location: {
          lat: parseFloat(geoData[0].lat),
          lng: parseFloat(geoData[0].lon),
          state,
          city,
          neighborhood
        },
      };

    // Send the new report to the backend
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newReport),
    })
      .then((res) => res.json())
      .then((savedReport) => {
        // Add the new report to the top of the list
        setReports([savedReport, ...reports]);
        // Clear form fields
        setGroupName('');
        setDescription('');
        setState('');
        setCity('');
        setNeighborhood('');
      })
      .catch((error) => console.error("Error submitting report:", error));
    } catch (error) {
      console.error("Error geocoding location:", error);
      alert('Error finding location. Please try again.');
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
        <div className="report-form">
          <h2>Report an Activity</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group Name" required />
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
              <option>Food Distribution</option>
              <option>Shelter</option>
              <option>Medical Supplies</option>
              <option>Clothing Drive</option>
              <option>Other</option>
            </select>
            <select value={state} onChange={(e) => setState(e.target.value)} required>
              <option value="">Select State</option>
              {getStates().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} required disabled={!state}>
              <option value="">Select City</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} disabled={!city}>
              <option value="">Select Neighborhood (Optional)</option>
              {availableNeighborhoods.map(neighborhood => (
                <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
              ))}
            </select>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Activity Description..."></textarea>
            <button type="submit">Submit Report</button>
          </form>
        </div>

        <div className="reports-list">
          <h2>Recent Activities</h2>
          {reports.map((report) => (
            <div key={report.id} className="report-item">
              <h3>{report.activityType} by {report.groupName}</h3>
              <p>{report.description}</p>
              <small>Location: {report.location.neighborhood ? `${report.location.neighborhood}, ` : ''}{report.location.city}, {report.location.state}</small>
              <small> | Reported: {new Date(report.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>

        <div className="map-container">
          <h2>Activity Map</h2>
          <MapComponent reports={reports} darkMode={darkMode} />
        </div>
      </main>
    </div>
  );
}

export default App;