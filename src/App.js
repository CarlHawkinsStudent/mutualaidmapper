import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './MapComponent';
import ActivityForm from './ActivityForm';
import ActivitiesList from './ActivitiesList';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GroupManager from './GroupManager';

const API_BASE = window.location.origin;
const API_URL = `${API_BASE}/api/activities`;

function App() {
  const [activities, setActivities] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((error) => console.error("Error fetching activities:", error));
  }, []);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.email) {
        setUser(userData);
      }
    }
  }, [token]);

  const handleActivitySubmit = async (newActivity) => {
    try {
      console.log('Sending to API:', API_URL, newActivity);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newActivity),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const savedActivity = await response.json();
      setActivities([savedActivity, ...activities]);
      return savedActivity;
    } catch (error) {
      console.error("Error submitting activity:", error);
      throw new Error(error.message || 'Failed to submit activity');
    }
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setUserGroups([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  const handleGroupChange = (groups) => {
    setUserGroups(groups);
  };

  if (!user) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <header className="App-header">
          <h1>Mutual Aid Activity Mapper</h1>
          <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>
        <main>
          {showRegister ? (
            <div>
              <RegisterForm onRegister={handleRegister} />
              <p>Already have an account? <button onClick={() => setShowRegister(false)}>Login</button></p>
            </div>
          ) : (
            <div>
              <LoginForm onLogin={handleLogin} />
              <p>Need an account? <button onClick={() => setShowRegister(true)}>Register</button></p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className="App-header">
        <h1>Mutual Aid Activity Mapper</h1>
        <div>
          <span>Welcome, {user.username}!</span>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
          <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main>
        <GroupManager token={token} user={user} onGroupChange={handleGroupChange} />
        {userGroups.length > 0 && (
          <ActivityForm onActivitySubmit={handleActivitySubmit} groups={userGroups} />
        )}
        <ActivitiesList activities={activities} />
      </main>

      <div className="map-container">
        <h2>Activity Map</h2>
        <MapComponent activities={activities} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default App;